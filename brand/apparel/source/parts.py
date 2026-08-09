import re, xml.etree.ElementTree as ET
SVG='http://www.w3.org/2000/svg'
SRC='/sessions/gallant-zealous-keller/mnt/notho/brand/flat/svg/notho-logo-flat.svg'

def parse_path(d):
    """Return list of subpaths; each a list of segments ('M',x,y) / ('C',x1,y1,x2,y2,x,y) / ('Z',)."""
    toks = re.findall(r'([MCZ])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)', d)
    out=[]; i=0
    flat=[t[0] if t[0] else float(t[1]) for t in toks]
    while i < len(flat):
        c = flat[i]
        if c=='M': out.append(('M',flat[i+1],flat[i+2])); i+=3
        elif c=='C': out.append(('C',*flat[i+1:i+7])); i+=7
        elif c=='Z': out.append(('Z',)); i+=1
        else: raise ValueError('unexpected token %r'%c)
    return out

def _cub_extrema(p0,p1,p2,p3):
    vals=[p0,p3]
    a = -p0 + 3*p1 - 3*p2 + p3
    b = 2*(p0 - 2*p1 + p2)
    c = -p0 + p1
    if abs(a) < 1e-12:
        if abs(b) > 1e-12:
            ts=[-c/b]
        else: ts=[]
    else:
        disc = b*b - 4*a*c
        ts = [] if disc < 0 else [(-b+disc**0.5)/(2*a), (-b-disc**0.5)/(2*a)]
    for t in ts:
        if 0 < t < 1:
            mt=1-t
            vals.append(mt**3*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t**3*p3)
    return min(vals), max(vals)

def bbox(segs):
    xs=[]; ys=[]; cx=cy=0.0
    for s in segs:
        if s[0]=='M': cx,cy=s[1],s[2]; xs.append(cx); ys.append(cy)
        elif s[0]=='C':
            x1,y1,x2,y2,x,y=s[1:]
            lo,hi=_cub_extrema(cx,x1,x2,x); xs+= [lo,hi]
            lo,hi=_cub_extrema(cy,y1,y2,y); ys+= [lo,hi]
            cx,cy=x,y
    return min(xs),min(ys),max(xs),max(ys)

def union(bs):
    return (min(b[0] for b in bs), min(b[1] for b in bs),
            max(b[2] for b in bs), max(b[3] for b in bs))

def load():
    """-> dict with keys icon(list of (d,fill,label)), wordmark(list), tagline(list of (d,fill,word))"""
    tree=ET.parse(SRC); root=tree.getroot()
    icon=[]; word=[]; tag=[]
    labels={'teal':'N / teal ribbon','gold':'Leaf / gold + dot','blue':'Leaf / navy'}
    for el in root:
        t=el.tag.replace('{%s}'%SVG,'')
        i=el.get('id')
        if t=='path' and i in labels:
            icon.append((el.get('d'), el.get('fill'), labels[i]))
        elif t=='g' and i=='wordmark':
            for p in el: word.append((p.get('d'), p.get('fill'), 'OTHO'))
        elif t=='g' and i=='tagline':
            for p in el:
                f=p.get('fill')
                w={'#109898':'LEARN','#E8A838':'GROW + dots','#083080':'BUILD WEALTH'}[f.upper()]
                tag.append((p.get('d'), f, w))
    return icon, word, tag

if __name__=='__main__':
    icon,word,tag=load()
    for name,grp in [('icon',icon),('wordmark',word),('tagline',tag)]:
        b=union([bbox(parse_path(d)) for d,_,_ in grp])
        print(f'{name:9s} n={len(grp):3d} bbox=({b[0]:8.2f},{b[1]:8.2f}) -> ({b[2]:8.2f},{b[3]:8.2f})  w={b[2]-b[0]:7.2f} h={b[3]-b[1]:7.2f}')
    for word_ in ['LEARN','GROW + dots','BUILD WEALTH']:
        g=[x for x in tag if x[2]==word_]
        b=union([bbox(parse_path(d)) for d,_,_ in g])
        print(f'  {word_:14s} n={len(g):2d} x {b[0]:8.2f}->{b[2]:8.2f}  y {b[1]:7.2f}->{b[3]:7.2f}')
    allb=union([bbox(parse_path(d)) for d,_,_ in icon+word+tag])
    print('ALL bbox', [round(v,2) for v in allb])
