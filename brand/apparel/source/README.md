# Rebuild pipeline

    python3 build_apparel.py     # regenerates every svg / pdf / eps / png

Reads `brand/flat/svg/notho-logo-flat.svg`, cleans the traced geometry, writes
into `brand/apparel/`.

| File | Does |
|---|---|
| `parts.py` | Reads the brand master, splits it into icon / wordmark / tagline |
| `geom.py` | Path flattening, arc-length resampling, corner detection, variable-sigma smoothing |
| `fit.py` | Schneider least-squares cubic Bézier fitting (Graphics Gems) |
| `refit2.py` | Curvature-adaptive refit — loose tolerance on long sweeps, tight where there's detail |
| `clean.py` | Raster round-trip at 16 px/unit for the tagline; removes sub-unit spurs that curve fitting can't see |
| `final_paths.py` | Decides which pass each element gets, and documents why |
| `build_apparel.py` | Emits SVG, PDF and EPS written directly (no converters), PNG via ghostscript |
| `make.py` | Same as `build_apparel.py` — kept for the old filename |

Requires `numpy`, `opencv-python`, and `ghostscript` on the path.

Why two passes: the icon and wordmark are large enough that trace error is a
small fraction of their size, so a curve refit fixes them without side effects.
The tagline's cap height is only 33 units — trace error there is ~3% of letter
height and shows up as spurs and holes, which are topology rather than
smoothness. Those need the raster round-trip.
