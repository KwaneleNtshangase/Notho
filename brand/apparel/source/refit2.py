import numpy as np, sys
sys.path.insert(0,'/sessions/gallant-zealous-keller/mnt/outputs/build')
from geom import contours, flatten, resample_closed, turn_angles, taper_smooth
from fit import fit_cubic, tangent, sample_bez, hausdorff_to

def diag(P): return float(np.hypot(np.ptp(P[:,0]), np.ptp(P[:,1])))
def poly_area(P):
    x,y=P[:,0],P[:,1]; return 0.5*np.sum(x*np.roll(y,-1)-np.roll(x,-1)*y)

MIN_AREA=3.0

def runs_of(mask):
    n=len(mask)
    if not mask.any(): return []
    if mask.all(): return [(0,n-1)]
    start=np.where(mask & ~np.roll(mask,1))[0]
    end=np.where(mask & ~np.roll(mask,-1))[0]
    out=[]
    for s in start:
        e=end[np.searchsorted(end,s)%len(end)]
        out.append((int(s),int(e)))
    return out

def refit_contour(cubics, **kw):
    return fit_polyline(flatten(cubics,0.006), **kw)

def fit_polyline(P0, k_loose=0.0075, k_tight=0.0009, k_detail=0.060,
                  k_sig_smooth=0.0090, sig_detail=0.20, ds_cap=0.25):
    """Curvature-adaptive: loose tolerance on long sweeps, tight where there is detail."""
    D=diag(P0)
    if D<1e-6: return None,P0,0,0.0
    tol_loose=float(np.clip(k_loose*D,0.10,1.60))
    tol_tight=float(np.clip(k_tight*D,0.020,0.16))
    r_detail =max(1.2,k_detail*D)
    sig_smooth=float(np.clip(k_sig_smooth*D,0.30,3.00))
    ds=max(0.05,min(ds_cap,D/1100))
    R,d=resample_closed(P0,ds)
    n=len(R)
    if n<28: return None,P0,0,0.0
    # local curvature radius from turn angle over ~1.5 units of arc
    w=max(1,int(round(0.75/d)))
    ang=np.abs(turn_angles(R,w)); arc=2*w*d
    kappa=ang/max(arc,1e-9)
    radius=np.where(kappa>1e-9, 1.0/kappa, 1e9)
    detail = radius < r_detail
    # widen detail zones slightly so the transition is inside the tight-fit arc
    pad=max(1,int(round(0.6/d)))
    if detail.any():
        idx=np.where(detail)[0]
        for o in range(-pad,pad+1): detail[(idx+o)%n]=True
    # variable sigma: light inside detail, normal outside
    sig=np.where(detail, sig_detail, sig_smooth)
    S=R.copy()
    for i in range(n):
        s=sig[i]
        if s<d*0.4: continue
        k=max(1,int(np.ceil(3*s/d))); o=np.arange(-k,k+1)
        g=np.exp(-0.5*((o*d)/s)**2); g/=g.sum()
        S[i]=(R[(i+o)%n]*g[:,None]).sum(0)
    # split at every detail-region boundary
    dr=runs_of(detail)
    cuts=sorted({a for a,b in dr} | {b for a,b in dr})
    if len(cuts)<2: cuts=[0,n//2]
    bez=[]
    for a,b in zip(cuts,cuts[1:]+[cuts[0]+n]):
        if b-a<3: continue
        seg=np.array([S[i%n] for i in range(a,b+1)])
        is_detail=detail[int((a+b)//2)%n]
        tol=tol_tight if is_detail else tol_loose
        bez+=fit_cubic(seg,tangent(S,a%n,True),-tangent(S,b%n,True),tol)
    if not bez: return None,P0,0,0.0
    bez=[list(map(np.asarray,x)) for x in bez]; bez[-1][3]=bez[0][0].copy()
    return bez,P0,int(detail.sum()),hausdorff_to(sample_bez(bez,120),P0)

def fmt(v):
    s=f'{v:.3f}'.rstrip('0').rstrip('.')
    return s if s not in ('-0','') else '0'
def to_d(all_bez):
    o=[]
    for bez in all_bez:
        o.append(f'M {fmt(bez[0][0][0])} {fmt(bez[0][0][1])}')
        for b in bez:
            o.append('C %s %s %s %s %s %s'%tuple(fmt(v) for v in (b[1][0],b[1][1],b[2][0],b[2][1],b[3][0],b[3][1])))
        o.append('Z')
    return ' '.join(o)

def refit_path(d, **kw):
    out=[]; worst=0.0; dropped=0
    for c in contours(d):
        if abs(poly_area(flatten(c,0.02)))<MIN_AREA: dropped+=1; continue
        bez,P0,nd,dev=refit_contour(c,**kw)
        if bez is None: continue
        out.append(bez); worst=max(worst,dev)
    return to_d(out), worst, dropped
