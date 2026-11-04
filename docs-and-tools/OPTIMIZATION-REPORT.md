# Media optimization — 2026-11-04

Part of the resume hardening (`2026/Documentation/reporting-and-resume/BOOT-AND-RESUME-HARDENING-2026-11-03.md`
§2.4–2.5): less media ahead of the resume restore, and a lighter package.

## Images

Tool: `reencode-media.py` (copied from mass-measure-01), boxes in `media-display-boxes.json` (derived from each
part's `css/style.css`; the 660×660 zoom panel counts for every zoomable image). Type kept (all PNG), resized
to 2 × the largest drawn box, libimagequant 256 colours + oxipng, `-opt` names, references rewritten.
Per-file rows: `reencode-rows.md`.

20 files: **29,876,280 → 6,627,819 bytes** (Arabic images: rice on scales, roller-coaster graph, flour, ingredients). Zoomable 1254² images stay 1254² (2 × 660 > 1254) and are only
quantized; the rest shrink (carousel 188 → 376², hook characters to ~1200×680, lamp 260²).

## Landing-screen clips

| Clip | Drawn at (max) | Before | After |
|---|---|---|---|
| `unit-assets/video/scales-opt.mp4` | 440² | 1,211,277 (1080², 2.3 Mbps) | 300,952 (880²) |
| `unit-assets/video/lifting-opt.mp4` | 440² | 1,362,941 | 285,486 (880²) |
| `unit-assets/video/moving-opt.mp4` | 440² | 1,075,580 | 287,335 (880²) |
| `-02/assets/video/running-opt.mp4` | 290² | 461,365 (with an audio track) | 85,661 (580²) |

`ffmpeg -vf scale=N:N:flags=lanczos -c:v libx264 -profile:v high -preset slow -crf 23 -maxrate 500k
-bufsize 1000k -pix_fmt yuv420p -an -movflags +faststart`. Other clips are not in the boot window (lazy or set
by script on entry) and were left.
