use clip_pulse_core::{MappingMode, compile_plan};
use proptest::prelude::*;

proptest! {
    #[test]
    fn segments_are_monotonic(mut beats in prop::collection::vec(0_u64..600_000_000, 1..100)) {
        beats.sort_unstable();
        beats.dedup();
        let plan = compile_plan(0, 1_000_000, &beats, MappingMode::Hold).unwrap();
        prop_assert!(plan.segments.windows(2).all(|pair| pair[0].output_end_us <= pair[1].output_start_us));
    }
}
