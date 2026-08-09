# How to clean up the NOTHO vectors yourself

Written after fixing the apparel set. It covers what was actually wrong, which
free tool to use, and the exact steps.

---

## 1. What was wrong — this matters before you touch anything

Your brand master (`brand/flat/svg/notho-logo-flat.svg`) was **auto-traced from
`public/notho-logo.png`, which is 1200 × 297 pixels.**

The logo is 1353 units wide in the vector. So the trace had **roughly one source
pixel per logo unit**. Everything the tracer did was accurate to about one pixel
— and that one pixel of error is exactly what you were seeing.

Three separate symptoms, one cause:

**Wavy outlines.** The big O of OTHO should be a circle. Measured, its radius
wandered by 2.9 units peak-to-peak on a 106-unit radius. Some of that is
intentional (the letter is slightly oval — that's a real design decision, 0.8
units of it). The rest was trace noise at wavelengths of 45–100 units, which is
what reads as "lumpy".

**Node bloat.** That same O had **118 nodes on its outer contour.** A clean
circle needs 4. A well-drawn letter O needs about 8. When a shape has 118 nodes,
every one of them is a tiny opportunity for the curve to wobble.

**Actual defects.** The W of GROW had a spur growing out of its top-right corner
with a 0.4 unit² hole inside it. I checked the source PNG — the W there is
clean. The tracer invented it. That one is not softness, it's a bug in the file.

**How to spot this yourself in ten seconds:** open the SVG, grab the node tool,
select all nodes on one letter, and read the node count in the status bar. If a
letter O has more than about 20 nodes, it came out of a tracer and it will look
tacky at size.

---

## 2. Which tool

| Tool | Cost | Use it for |
|---|---|---|
| **Affinity Designer** | **Free** (Canva made it free in Nov 2025; needs a free Canva account) | Best free option. Real professional vector editor — proper node editing, clean EPS/PDF export |
| **Inkscape** | Free, open source, forever, no account | Just as capable for this job. Slightly less polished, but nothing is gated |
| Vectorizer.AI | Preview free, ~$10/mo to download | Only if you need to re-trace a raster from scratch and want the best automatic result |
| Illustrator | 7-day trial then ~$23/mo | Not needed for this |

**My recommendation: Inkscape.** Not because it's better than Affinity, but
because it needs no account, never changes terms, and the keyboard shortcuts
below will still work in five years. Download from
[inkscape.org](https://inkscape.org/) — current version is 1.4.4.

If you'd rather have the nicer interface, Affinity Designer does all the same
things and is genuinely free now. Get it at
[affinity.studio](https://www.affinity.studio/).

---

## 3. The cleanup, step by step (Inkscape)

This is the pass I ran, done by hand. Budget 30–40 minutes.

### Set the simplify strength first

This is the step everyone skips, and it's why people's results are mushy.

1. `Edit ▸ Preferences ▸ Behavior` (Ctrl + Shift + P)
2. Find **Simplification threshold**. Default is `0.0020`.
3. Set it to **`0.0010`**.

Lower = gentler. The default is too aggressive for logo work — it's what rounds
off your corners and turns a T into a blob. You can always press Ctrl+L twice.

### Clean each shape

1. `File ▸ Open` your SVG.
2. Press **`N`** for the node tool. Click one shape — say the first O.
3. Press **Ctrl + A** to select all its nodes. **Read the node count in the
   status bar at the bottom.** Write it down. That's your before number.
4. Press **Ctrl + L** (Path ▸ Simplify) — **once**.
5. Look at the shape. Check the node count again.
6. If it's still lumpy, press Ctrl + L again — but **pause a second between
   presses.** Inkscape escalates the aggressiveness if you press it repeatedly
   within about half a second, and that's how you overshoot.
7. Stop when the outline is smooth and the corners still look like corners.

Target: a letter O should land around **8–12 nodes**. If you're at 40, keep
going. If corners are turning soft, you've gone one press too far — Ctrl + Z.

### Fix corners that got soft

Simplify treats the whole path uniformly, so it rounds corners while it's
smoothing curves. Repair them individually:

1. Node tool, click the two nodes either side of a corner (Shift-click to add).
2. **Shift + L** — makes the segment between them a straight line.
3. Click the corner node itself, press **Shift + C** — makes it a sharp corner
   instead of a smooth one.
4. For a segment that should be a curve, **Shift + U**.

### Delete the specks

The W of GROW had a stray hole in it. To find things like that:

1. Select the shape, `Path ▸ Break Apart` (**Ctrl + Shift + K**). Every contour
   becomes its own object.
2. `Edit ▸ Select All` (Ctrl + A), then open the Objects panel — tiny fragments
   are obvious by size.
3. Delete anything that isn't a real letter part or a real counter (the hole in
   a D, B, O, etc.).
4. Select the remaining pieces of that letter and `Path ▸ Union` (**Ctrl + +**),
   then re-cut the counters with `Path ▸ Difference` (**Ctrl + −**).

Rule of thumb from your file: real counters were 23 units² and up. The junk was
0.4 units². There's no grey area — if it looks like a speck, it is one.

### Check your work

Zoom to **1600%** and trace the outline with your eye. At that magnification a
bad curve is unmistakable and a good one is boring. If a curve looks fine at
1600%, it will look fine on a shirt.

---

## 4. The permanent fix for the wordmark

Everything above is repair work on a trace. The real fix is to stop having a
trace at all.

Your `brand/BRAND.md` already worked out that the wordmark is a very close match
for **Outfit Bold (700)** — free on Google Fonts at
[fonts.google.com/specimen/Outfit](https://fonts.google.com/specimen/Outfit).
The measurements in that file line up: O width ratio 1.051 vs 1.049 measured,
stem weight 0.222 vs 0.222. The T is slightly narrower in Outfit than in your
artwork, so it's a very close substitute rather than a confirmed match.

To rebuild OTHO from real type:

1. Download and install Outfit.
2. In Inkscape, press **T**, type `OTHO`, set it in Outfit Bold at the right size.
3. Paste your existing wordmark underneath, set it to 50% opacity, and line the
   two up. Adjust size and letter-spacing (**Alt + →** nudges tracking) until
   they sit on top of each other.
4. Accept that the T will be a hair off. Decide whether you care.
5. `Path ▸ Object to Path` (**Ctrl + Shift + C**) to convert the type to
   outlines. Do this before you send anything to a vendor — otherwise they need
   the font installed.

The result is mathematically perfect letterforms that will never need cleaning
again. **This changes the logo slightly.** It's a real decision, not a technical
one — worth sitting with before you commit.

The same logic doesn't apply to the N mark. That's genuine custom artwork, so
smoothing the trace is the right and only answer there.

---

## 5. If you ever need to re-trace from scratch

Only worth doing if you find a **higher-resolution original** than
`public/notho-logo.png`. Tracing the same 1200px file again just reproduces the
same problem. Check whoever designed the logo for the original AI, EPS, PDF or
a 4000px+ PNG first — that's a five-minute email that saves all of this.

If you do have a big clean raster:

**In Inkscape:** `Path ▸ Trace Bitmap` (**Shift + Alt + B**)
- Single scan, Brightness cutoff, for one colour at a time
- Turn **Smooth corners** up — this is the setting that controls waviness
- Turn on **Optimize paths** — this is what stops the 118-node problem at source
- Watch the live preview; adjust the threshold until the edge sits where you want

**Or Vectorizer.AI:** upload, look at the preview for free, pay ~$10 for a month
if the result is better than what Inkscape gave you. Cancel after.

---

## 6. Exporting for vendors

Once the paths are clean:

- **EPS** — `File ▸ Save a Copy`, choose *Encapsulated PostScript*. Tick
  **"Make bounding box around full page"** so your clear space survives; leave
  **"Rasterize filter effects"** off. This is the one embroiderers want.
- **PDF** — `File ▸ Save a Copy`, choose PDF. Set *Output page size: use document
  size*.
- **PNG** — `File ▸ Export` (**Shift + Ctrl + E**), set the width in pixels, make
  sure the background is transparent.
- **Never** send a JPG to a printer. It has no transparency and it has
  compression artefacts around every edge.

Before you send anything: open the exported file again in Inkscape and zoom to
1600%. Export settings silently rasterise things more often than you'd think.

---

## 7. What I actually did to the files in this folder

For the record, so you can reproduce or argue with it. Script is in `source/`.

**Icon and wordmark — curvature-adaptive refit.** Flattened each outline to a
dense polyline, measured local curvature, then refit with cubic Béziers using
*two* tolerances: loose on the long sweeps so trace waviness averages out, tight
in the high-curvature zones so corner radii and the sharp ribbon tip survive.
This is the same idea as Inkscape's Simplify, except Simplify uses one tolerance
everywhere — which is exactly why it softens corners while it smooths curves.

**Tagline — raster round-trip, then the same refit.** The tagline cap height is
only 33 units, so trace error was ~3% of letter height and showed up as spurs
and nicks. Those are topology, not smoothness — no curve fit can see them.
Re-rasterised each letter at 16 px/unit (the original trace was ~1), blurred at
σ 0.7 units, re-extracted the boundary, then refit.

**Specks dropped** below 3 units².

Results:

| | Before | After |
|---|---|---|
| Icon nodes | 682 | 94 |
| Wordmark nodes | 560 | 67 |
| Tagline nodes | 1031 | 413 |
| Lumpiness of the O (harmonics ≥ 6) | 0.374 units | 0.054 |
| File size, full lockup SVG | 100 KB | 29 KB |

Maximum any outline moved: **0.69 units, 0.34% of cap height.** Total ink area
changed by 0.24%. In other words the shapes are the same shapes — they're just
drawn properly now.

**Note:** only `brand/apparel/` has the cleaned geometry. The rest of
`brand/` — the web SVGs, app icons, PDFs, PNGs — still carries the original
traced outlines. Worth regenerating those from the same cleaned paths so the
whole system matches.
