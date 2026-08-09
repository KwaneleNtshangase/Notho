# NOTHO — apparel / embroidery masters

Files for shirts, caps and anything else a vendor prints or stitches. Everything
here is **solid fill, no gradients, no strokes, no effects, no embedded raster,
transparent background**. The garment shows through wherever there is no fill.

Outlines are **rebuilt from** `brand/flat/svg/notho-logo-flat.svg`, not copied
from it. The master was auto-traced from a 1200 px raster and carried the usual
trace damage: wavy curves, ~2300 redundant nodes, and a spurious spur on the W
of GROW. Those are fixed here. Same shapes — maximum movement 0.34% of cap
height, total ink area within 0.24% — drawn cleanly.

See `CLEANING-VECTORS.md` for what was wrong, how it was fixed, and how to do it
yourself. **The rest of `brand/` still has the original traced geometry** and
should be regenerated to match.

---

## Two sets

| Set | What it is | Use on |
|---|---|---|
| `notho-white-*` | Every element white, one ink | Dark garments — black, navy, charcoal, bottle green |
| `notho-colour-*` | Colour mark, **OTHO** and **BUILD WEALTH** in white | Mid-tone and dark garments where you want the mark in full colour |

## Four lockups in each set

| File | Contains | Typical placement |
|---|---|---|
| `-full` | Icon + OTHO + LEARN · GROW · BUILD WEALTH | Full front, back print |
| `-no-tagline` | Icon + OTHO | Left chest — the safe one for embroidery |
| `-icon` | The N mark alone | Cap front, sleeve, back yoke, badge |
| `-tagline` | LEARN · GROW · BUILD WEALTH alone | Across the shoulders on the back |

## Four formats of each

| Folder | Give it to | Notes |
|---|---|---|
| `eps/` | **Embroidery digitisers.** First choice. | Plain Level 2 PostScript, human-readable, opens in Wilcom, Hatch, Illustrator, CorelDRAW |
| `svg/` | Web-based print vendors, Printful/Printify-type uploads | Named layer groups — `n-teal-ribbon`, `otho`, `build-wealth` etc. |
| `pdf/` | Anyone who says "send vector" and won't say which | Page size is the true artwork size in mm |
| `png/` | DTG, proofs, mockups, previews | Transparent, 300 dpi+ at the sizes below |

If a vendor asks for `.ai`: send the EPS or the PDF. Illustrator opens both and
saves out `.ai` unchanged.

If a vendor asks for `.dst`, `.pes`, `.exp` or "a digitised file" — those are
machine files, not artwork. Send the EPS and let them digitise it. Then **ask for
a sew-out sample before the full run.** Every shop digitises differently.

---

## Artwork sizes as supplied

| File | Width | Height |
|---|---|---|
| `-full` | 250 mm | 83 mm |
| `-no-tagline` | 250 mm | 70 mm |
| `-icon` | 46 mm | 45 mm |
| `-tagline` | 225 mm | 14 mm |

Clear space is already inside the artboard on every file — tell the vendor to
place it flush, not to add margin. Scale freely; the proportions are locked.

---

## Minimum sizes

| | Embroidery | Screen / DTG / vinyl |
|---|---|---|
| Full lockup with tagline | 90 mm wide | 60 mm |
| No-tagline lockup | 45 mm wide | 25 mm |
| Icon alone | 45 mm wide | 20 mm |
| Tagline alone | 140 mm wide | 90 mm |

Below the embroidery minimum the negative gap between the N's stem and the
ribbon closes and the fold in the mark is lost. That gap is a real design
element, not a gap in the file.

**On the white set, leave that gap as garment showing through — do not stitch it
white.** The whole point of the one-ink version is that the garment does the
drawing.

---

## Colours

White set: `#FFFFFF` throughout. One thread.

Colour set:

| Element | Hex | Pantone starting point |
|---|---|---|
| N — teal ribbon | `#0C9098` | 321 C |
| Leaf — gold + dot | `#E8A838` | 143 C |
| Leaf — navy | `#0A3A71` | 288 C |
| OTHO | `#FFFFFF` | — |
| LEARN | `#109898` | 321 C |
| GROW + dots | `#E8A838` | 143 C |
| BUILD WEALTH | `#FFFFFF` | — |

Pantone references are starting points. Match against a physical thread card or
swatch book, never a screen.

**One thing to know about the colour set on very dark garments.** The leaf navy
`#0A3A71` is close in value to black and to a navy shirt — on those two it reads
as a shadow rather than a shape. It is fine on charcoal, heather grey, bottle
green and anything mid-tone. On black or navy, either use the white set, or ask
the embroiderer to swap the leaf thread to a brighter blue (`#2B58B4` is the
brand's dark-ground blue). The files ship with the original navy as specified.

---

## Rebuilding

These were generated from `brand/flat/svg/notho-logo-flat.svg`. If the master
changes, regenerate rather than editing these by hand.
