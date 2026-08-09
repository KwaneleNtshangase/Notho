import numpy as np, math
from parts import parse_path

def contours(d):
    """cubic path -> list of closed contours, each a list of (p0,p1,p2,p3) cubics"""
    segs=parse_path(d); out=[]; cur=None; start=None; pt=None
    for s in segs:
        if s[0]=='M':
            if cur: out.append(cur)
            cur=[]; pt=np.array([s[1],s[2]],float); start=pt.copy()
        elif s[0]=='C':
            p1=np.array(s[1:3],float); p2=np.array(s[3:5],float); p3=np.array(s[5:7],float)
            cur.append((pt,p1,p2,p3)); pt=p3
        elif s[0]=='Z':
            if np.linalg.norm(pt-start)>1e-9:
                cur.append((pt,pt+(start-pt)/3,pt+2*(start-pt)/3,start)); pt=start.copy()
    if cur: out.append(cur)
    return out

def _flat(p0,p1,p2,p3,tol,acc,depth=0):
    d1=abs(p1[0]-p3[0])*abs(p0[1]-p3[1])-abs(p1[1]-p3[1])*abs(p0[0]-p3[0])
    dev=max(np.linalg.norm(p1-(p0+(p3-p0)/3)), np.linalg.norm(p2-(p0+2*(p3-p0)/3)))
    if depth>18 or dev<tol:
        acc.append(p3); return
    m=lambda a,b:(a+b)/2
    p01,p12,p23=m(p0,p1),m(p1,p2),m(p2,p3)
    p012,p123=m(p01,p12),m(p12,p23); mid=m(p012,p123)
    _flat(p0,p01,p012,mid,tol,acc,depth+1); _flat(mid,p123,p23,p3,tol,acc,depth+1)

def flatten(cubics, tol=0.01):
    pts=[cubics[0][0]]
    for c in cubics: _flat(*c,tol,pts)
    P=np.array(pts)
    keep=[0]+[i for i in range(1,len(P)) if np.linalg.norm(P[i]-P[i-1])>1e-9]
    return P[keep]

def resample_closed(P, ds):
    Q=np.vstack([P,P[:1]])
    seg=np.linalg.norm(np.diff(Q,axis=0),axis=1); s=np.concatenate([[0],np.cumsum(seg)])
    L=s[-1]; n=max(16,int(round(L/ds))); t=np.linspace(0,L,n,endpoint=False)
    x=np.interp(t,s,Q[:,0]); y=np.interp(t,s,Q[:,1])
    return np.column_stack([x,y]), L/n

def turn_angles(P, w):
    """signed turn at each point using chords of w samples either side (closed)"""
    a=np.roll(P,w,axis=0); b=np.roll(P,-w,axis=0)
    v1=P-a; v2=b-P
    ang=np.arctan2(v1[:,0]*v2[:,1]-v1[:,1]*v2[:,0], (v1*v2).sum(1))
    return ang

def find_corners(P, ds, arc=1.0, deg=70.0):
    w=max(1,int(round(arc/ds)))
    ang=np.abs(turn_angles(P,w)); thr=math.radians(deg)
    cand=np.where(ang>thr)[0]
    if len(cand)==0: return []
    # non-max suppression within w
    corners=[]; used=np.zeros(len(P),bool)
    for i in cand[np.argsort(-ang[cand])]:
        if used[(np.arange(i-w,i+w+1))%len(P)].any(): continue
        corners.append(int(i)); used[(np.arange(i-w,i+w+1))%len(P)]=True
    return sorted(corners)

def taper_smooth(P, ds, sigma, corners):
    """variable-sigma gaussian along closed arclength; sigma -> 0 at corners"""
    n=len(P)
    if sigma<=0: return P.copy()
    idx=np.arange(n)
    if corners:
        c=np.array(corners)
        dist=np.min(np.minimum(np.abs(idx[:,None]-c[None,:]),
                               n-np.abs(idx[:,None]-c[None,:])),axis=1)*ds
        scale=np.clip(dist/(2.5*sigma),0,1)
    else:
        scale=np.ones(n)
    sig=sigma*scale
    K=max(1,int(math.ceil(3*sigma/ds)))
    off=np.arange(-K,K+1)
    out=np.empty_like(P)
    for i in range(n):
        s=sig[i]
        if s < ds*0.35: out[i]=P[i]; continue
        k=max(1,int(math.ceil(3*s/ds))); o=np.arange(-k,k+1)
        wgt=np.exp(-0.5*((o*ds)/s)**2); wgt/=wgt.sum()
        out[i]=(P[(i+o)%n]*wgt[:,None]).sum(0)
    return out

def straighten(P, ds, eps=0.75, min_len=7.0):
    """find maximal near-straight runs on a closed polyline and project them onto their TLS line"""
    n=len(P); kmin=max(4,int(round(min_len/ds)))
    used=np.zeros(n,bool); runs=[]; i=0
    while i < n:
        j=i+kmin
        if j-i >= n: break
        best=None
        while j-i < n-2:
            idx=(np.arange(i,j+1))%n; Q=P[idx]
            a=Q[0]; b=Q[-1]; ab=b-a; L=np.linalg.norm(ab)
            if L<1e-9: break
            nrm=np.array([-ab[1],ab[0]])/L
            dev=np.abs((Q-a)@nrm).max()
            if dev>eps: break
            best=(i,j); j+=1
        if best and (best[1]-best[0])>=kmin:
            runs.append(best); i=best[1]+1
        else:
            i+=1
    out=P.copy()
    for a,b in runs:
        idx=(np.arange(a,b+1))%n; Q=P[idx]
        c=Q.mean(0); u,s,vt=np.linalg.svd(Q-c); d=vt[0]
        out[idx]=c+((Q-c)@d)[:,None]*d
    return out, runs
