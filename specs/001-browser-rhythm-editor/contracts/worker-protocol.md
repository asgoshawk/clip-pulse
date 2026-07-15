# Worker Protocol v1

All messages are validated before dispatch and include `version: 1`, `requestId`, and
a discriminant `type`.

## Requests

- `compile-plan`: selection, rhythm template, mapping settings
- `analyze-rhythm`: transferable mono Float32 chunks, sample rate, cancellation token
- `render-export`: validated media descriptor, render plan, audio mix, output settings
- `cancel`: target request identifier

## Responses

- `progress`: phase, completed, total
- `plan-ready`: `RenderPlanV1`
- `analysis-ready`: BPM, confidence, ordered beats
- `export-ready`: written byte count and output metadata
- `cancelled`
- `error`: stable code, localized-message key, recoverable flag

Unknown versions, message types, fields, non-finite numbers, and oversized arrays are
rejected without dispatching media work.
