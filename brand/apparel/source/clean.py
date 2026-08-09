import numpy as np, cv2, sys
sys.path.insert(0,'/sessions/gallant-zealous-keller/mnt/outputs/build')
from geom import contours, flatten, resample_closed, find_corners, taper_smooth
from fit import fit_cubic, tangent, sample_bez, hausdorff_to
import refit2

K = 16          # raster px per logo unit  (original trace was ~1)
SS = 3          # extra supersample for the fill

def rasterize(polys, K=K, pad=8):
    allp=np.vstack(polys)
    x0,y0=allp.min(0)-pad; x1,y1=allp.max(0)+pad
    W=int(np.ceil((x1-x0)*K)); H=int(np.ceil((y1-y0)*K))
    img=np.zeros((H,W),np.uint8)
    for P in polys:                      # XOR accumulate -> even-odd, correct for glyph outlines
        q=np.round((P-[x0,y0])*K*16).astype(np.int32)
        m=np.zeros((H,W),np.uint8)
        cv2.fillPoly(m,[q],255,lineType=cv2.LINE_8,shift=4)
        img=cv2.bitwise_xor(img,m)
    return img,(x0,y0)

def clean_path(d, sigma=1.0, min_area=3.0, **fitkw):
    polys=[flatten(c,0.004) for c in contours(d)]
    img,(x0,y0)=rasterize(polys)
    s=max(1,int(round(sigma*K)))
    ks=2*int(3*s)+1
    blur=cv2.GaussianBlur(img.astype(np.float32),(ks,ks),s)
    binr=(blur>127.5).astype(np.uint8)*255
    cs,_=cv2.findContours(binr,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
    out=[]
    for c_ in cs:
        P=c_[:,0,:].astype(np.float64)/K + [x0,y0]
        if len(P)<12: continue
        A=0.5*np.sum(P[:,0]*np.roll(P[:,1],-1)-np.roll(P[:,0],-1)*P[:,1])
        if abs(A)<min_area: continue
        bez,_,_,_=refit2.fit_polyline(P, **fitkw)
        if bez: out.append(bez)
    return out

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
