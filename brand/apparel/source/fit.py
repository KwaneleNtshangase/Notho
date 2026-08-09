import numpy as np, math

# ---- Schneider (Graphics Gems) least-squares cubic Bezier fitting ----
def _q(b,t):
    mt=1-t
    return (mt**3)[:,None]*b[0] + (3*mt**2*t)[:,None]*b[1] + (3*mt*t**2)[:,None]*b[2] + (t**3)[:,None]*b[3]
def _q1(b,t):
    mt=1-t
    return (3*mt**2)[:,None]*(b[1]-b[0]) + (6*mt*t)[:,None]*(b[2]-b[1]) + (3*t**2)[:,None]*(b[3]-b[2])
def _q2(b,t):
    mt=1-t
    return (6*mt)[:,None]*(b[2]-2*b[1]+b[0]) + (6*t)[:,None]*(b[3]-2*b[2]+b[1])

def _chord(P):
    d=np.linalg.norm(np.diff(P,axis=0),axis=1); u=np.concatenate([[0],np.cumsum(d)])
    return u/u[-1] if u[-1]>0 else np.linspace(0,1,len(P))

def _gen_bezier(P,u,t1,t2):
    mt=1-u
    A1=(3*mt**2*u)[:,None]*t1; A2=(3*mt*u**2)[:,None]*t2
    c11=(A1*A1).sum(); c12=(A1*A2).sum(); c22=(A2*A2).sum()
    tmp=P - ((mt**3)[:,None]*P[0] + (3*mt**2*u)[:,None]*P[0] +
             (3*mt*u**2)[:,None]*P[-1] + (u**3)[:,None]*P[-1])
    x1=(A1*tmp).sum(); x2=(A2*tmp).sum()
    det=c11*c22-c12*c12
    seglen=np.linalg.norm(P[-1]-P[0])
    if abs(det)<1e-12:
        a1=a2=seglen/3.0
    else:
        a1=(x1*c22-c12*x2)/det; a2=(c11*x2-x1*c12)/det
    eps=1e-6*seglen
    if a1<eps or a2<eps: a1=a2=seglen/3.0
    return [P[0], P[0]+t1*a1, P[-1]+t2*a2, P[-1]]

def _max_err(P,b,u):
    diff=_q(b,u)-P; d=(diff*diff).sum(1)
    i=int(np.argmax(d)); return math.sqrt(d[i]), i

def _reparam(P,u,b):
    num=((_q(b,u)-P)*_q1(b,u)).sum(1)
    den=(_q1(b,u)**2).sum(1) + ((_q(b,u)-P)*_q2(b,u)).sum(1)
    out=np.where(np.abs(den)<1e-12, u, u-num/den)
    return np.clip(out,0,1)

def _unit(v):
    n=np.linalg.norm(v); return v/n if n>1e-12 else np.array([1.0,0.0])

def fit_cubic(P,t1,t2,err,depth=0):
    if len(P)<3:
        d=np.linalg.norm(P[-1]-P[0])/3.0
        return [[P[0],P[0]+t1*d,P[-1]+t2*d,P[-1]]]
    u=_chord(P); b=_gen_bezier(P,u,t1,t2)
    e,split=_max_err(P,b,u)
    if e<err: return [b]
    if e<err*err or depth<1:
        for _ in range(24):
            u=_reparam(P,u,b); b=_gen_bezier(P,u,t1,t2)
            e,split=_max_err(P,b,u)
            if e<err: return [b]
    if depth>28 or split<=0 or split>=len(P)-1:
        return [b]
    tc=_unit(P[max(0,split-2)]-P[min(len(P)-1,split+2)])
    return (fit_cubic(P[:split+1],t1,tc,err,depth+1) +
            fit_cubic(P[split:],-tc,t2,err,depth+1))

def tangent(P,i,closed,k=6):
    n=len(P)
    if closed:
        a=P[(i-k)%n]; b=P[(i+k)%n]
    else:
        a=P[max(0,i-k)]; b=P[min(n-1,i+k)]
    return _unit(b-a)

def sample_bez(bez,n=200):
    t=np.linspace(0,1,n)
    return np.vstack([_q(np.array(b),t) for b in bez])

def hausdorff_to(Q,P):
    """max over P of distance to nearest point of Q (chunked brute force)"""
    m=0.0
    for i in range(0,len(P),512):
        c=P[i:i+512]
        d=np.sqrt(((c[:,None,:]-Q[None,:,:])**2).sum(-1)).min(1)
        m=max(m,d.max())
    return m
