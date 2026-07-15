use serde::{Deserialize, Serialize};
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum MappingMode {
    Restart,
    Hold,
    Fit,
    Alternate,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RenderSegment {
    pub output_start_us: u64,
    pub output_end_us: u64,
    pub source_start_us: u64,
    pub source_end_us: u64,
    pub rate: f64,
    pub direction: Direction,
    pub hold: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Direction {
    Forward,
    Reverse,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RenderPlan {
    pub schema_version: u8,
    pub duration_us: u64,
    pub segments: Vec<RenderSegment>,
}

#[derive(Debug, Error)]
pub enum PlanError {
    #[error("selection must have positive duration")]
    EmptySelection,
    #[error("beat timestamps must be strictly increasing")]
    UnorderedBeats,
    #[error("too many beats")]
    TooManyBeats,
    #[error("timeline overflow")]
    Overflow,
}

pub fn compile_plan(
    source_start_us: u64,
    source_end_us: u64,
    beats: &[u64],
    mode: MappingMode,
) -> Result<RenderPlan, PlanError> {
    let clip_duration = source_end_us
        .checked_sub(source_start_us)
        .filter(|value| *value > 0)
        .ok_or(PlanError::EmptySelection)?;
    if beats.len() > 10_000 {
        return Err(PlanError::TooManyBeats);
    }
    if beats.windows(2).any(|pair| pair[0] >= pair[1]) {
        return Err(PlanError::UnorderedBeats);
    }
    if beats.is_empty() {
        return Ok(RenderPlan {
            schema_version: 1,
            duration_us: 0,
            segments: Vec::new(),
        });
    }

    let mut segments = Vec::with_capacity(beats.len());
    for (index, &start) in beats.iter().enumerate() {
        let natural_end = start
            .checked_add(clip_duration)
            .ok_or(PlanError::Overflow)?;
        let output_end = beats.get(index + 1).copied().unwrap_or(natural_end);
        let interval = output_end
            .checked_sub(start)
            .ok_or(PlanError::UnorderedBeats)?;
        let (rate, source_span, hold) = match mode {
            MappingMode::Fit | MappingMode::Alternate => {
                let requested = clip_duration as f64 / interval.max(1) as f64;
                let rate = requested.clamp(0.5, 3.0);
                let span = ((interval as f64 * rate).round() as u64).min(clip_duration);
                (rate, span, span < clip_duration || requested < 0.5)
            }
            MappingMode::Restart => (1.0, interval.min(clip_duration), interval > clip_duration),
            MappingMode::Hold => (1.0, clip_duration.min(interval), interval > clip_duration),
        };
        let reverse = mode == MappingMode::Alternate && index % 2 == 1;
        let (segment_start, segment_end) = if reverse {
            (source_end_us - source_span, source_end_us)
        } else {
            (source_start_us, source_start_us + source_span)
        };
        segments.push(RenderSegment {
            output_start_us: start,
            output_end_us: output_end,
            source_start_us: segment_start,
            source_end_us: segment_end,
            rate,
            direction: if reverse {
                Direction::Reverse
            } else {
                Direction::Forward
            },
            hold,
        });
    }
    Ok(RenderPlan {
        schema_version: 1,
        duration_us: segments.last().map_or(0, |segment| segment.output_end_us),
        segments,
    })
}

pub fn analyze_onsets(samples: &[f32], sample_rate: u32) -> Vec<u64> {
    if samples.is_empty() || sample_rate == 0 {
        return Vec::new();
    }
    let window = (sample_rate / 100).max(1) as usize;
    let energies: Vec<f32> = samples
        .chunks(window)
        .map(|chunk| chunk.iter().map(|sample| sample.abs()).sum::<f32>() / chunk.len() as f32)
        .collect();
    let mean = energies.iter().sum::<f32>() / energies.len().max(1) as f32;
    let threshold = mean * 1.8;
    let mut previous = 0.0;
    energies
        .iter()
        .enumerate()
        .filter_map(|(index, &energy)| {
            let onset = energy > threshold && previous <= threshold;
            previous = energy;
            onset.then_some(index as u64 * window as u64 * 1_000_000 / sample_rate as u64)
        })
        .collect()
}

#[wasm_bindgen]
pub fn compile_plan_js(
    source_start_us: u64,
    source_end_us: u64,
    beats: Vec<u64>,
    mode: String,
) -> Result<JsValue, JsValue> {
    let mode = match mode.as_str() {
        "restart" => MappingMode::Restart,
        "hold" => MappingMode::Hold,
        "fit" => MappingMode::Fit,
        "alternate" => MappingMode::Alternate,
        _ => return Err(JsValue::from_str("unknown mapping mode")),
    };
    let plan = compile_plan(source_start_us, source_end_us, &beats, mode)
        .map_err(|error| JsValue::from_str(&error.to_string()))?;
    serde_wasm_bindgen::to_value(&plan).map_err(|error| JsValue::from_str(&error.to_string()))
}

#[wasm_bindgen]
pub fn analyze_onsets_js(samples: Vec<f32>, sample_rate: u32) -> Vec<u64> {
    analyze_onsets(&samples, sample_rate)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn restart_plan_cuts_at_each_beat() {
        let plan = compile_plan(0, 900_000, &[0, 300_000, 700_000], MappingMode::Restart).unwrap();
        assert_eq!(plan.segments.len(), 3);
        assert_eq!(plan.segments[1].source_end_us, 400_000);
        assert_eq!(plan.duration_us, 1_600_000);
    }

    #[test]
    fn fit_plan_respects_rate_limits() {
        let plan = compile_plan(0, 1_000_000, &[0, 100_000], MappingMode::Fit).unwrap();
        assert_eq!(plan.segments[0].rate, 3.0);
        assert!(plan.segments[0].source_end_us <= 1_000_000);
    }

    #[test]
    fn rejects_invalid_inputs() {
        assert!(compile_plan(1, 1, &[0], MappingMode::Restart).is_err());
        assert!(compile_plan(0, 1, &[2, 1], MappingMode::Restart).is_err());
    }
}
