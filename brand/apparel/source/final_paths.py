"""NOTHO apparel geometry cleanup.

The brand master (brand/flat/svg/notho-logo-flat.svg) was auto-traced from a
1200 x 297 px raster, i.e. roughly one source pixel per logo unit. Every defect
in it is therefore ~1 unit in scale: wavy outlines, ~2300 redundant nodes, and
in one case (the W of GROW) a spurious spur with a 0.4 unit hole in it.

Two passes, chosen per element:

  icon + wordmark -> vector pass (refit2)
      Curvature-adaptive refit. Long sweeps get a loose fit tolerance so the
      trace waviness is averaged out; high-curvature zones get a tight one so
      corner radii and the sharp ribbon tip survive intact.

  tagline -> raster pass (clean) then the same adaptive refit
      Cap height is only ~33 units, so trace error is ~3% of letter height and
      shows as spurs and nicks. Re-rasterising at 16 px/unit, blurring at
      sigma 0.7 units and re-extracting the boundary removes sub-unit spurs
      that no curve fit can see, because they are topology, not smoothness.

Contours under 3 units^2 are dropped as trace noise; the smallest real counter
in the artwork is 23 units^2, so the cutoff is unambiguous.
"""
import sys, pickle, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0,'/sessions/gallant-zealous-keller/mnt/outputs/build')
from parts import load, parse_path
import refit2, clean

TAG_SIGMA = 0.7

def build():
    icon, word, tag = load()
    return {
        'icon': [(refit2.refit_path(d)[0], f, l) for d, f, l in icon],
        'word': [(refit2.refit_path(d)[0], f, l) for d, f, l in word],
        'tag' : [(clean.to_d(clean.clean_path(d, sigma=TAG_SIGMA)), f, l) for d, f, l in tag],
    }

if __name__=='__main__':
    o=build(); pickle.dump(o, open('final_paths.pkl','wb'))
    icon,word,tag=load()
    n=lambda ds: sum(sum(1 for s in parse_path(d) if s[0]=='C') for d in ds)
    for k,old in [('icon',icon),('word',word),('tag',tag)]:
        print(f'{k:5s} nodes {n([d for d,_,_ in old]):5d} -> {n([d for d,_,_ in o[k]]):5d}')
