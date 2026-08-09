import os, sys, re, zlib, datetime, warnings, subprocess, pickle
warnings.filterwarnings('ignore')
sys.path.insert(0,'/sessions/gallant-zealous-keller/mnt/outputs/build')
from parts import parse_path, bbox, union
import final_paths

OUT='/sessions/gallant-zealous-keller/mnt/notho/brand/apparel'
PAD_FULL, PAD_SUB = 78.0, 20.5
WHITE='#FFFFFF'
MM = 2.8346456692913385
STAMP = datetime.datetime.now().strftime('%Y-%m-%d')

P = final_paths.build()
icon, word, tag = P['icon'], P['word'], P['tag']

WHITE_MAP  = {k: WHITE for k in ['N / teal ribbon','Leaf / gold + dot','Leaf / navy',
                                 'OTHO','LEARN','GROW + dots','BUILD WEALTH']}
COLOUR_MAP = {'OTHO': WHITE, 'BUILD WEALTH': WHITE}
LOCKUPS = {'full': (icon+word+tag, PAD_FULL), 'no-tagline': (icon+word, PAD_FULL),
           'icon': (icon, PAD_SUB), 'tagline': (tag, PAD_SUB)}
SETS = {'white':  (WHITE_MAP,  'all white'),
        'colour': (COLOUR_MAP, 'colour mark, white OTHO and BUILD WEALTH')}
GROUPS = ['N / teal ribbon','Leaf / gold + dot','Leaf / navy','OTHO','LEARN','GROW + dots','BUILD WEALTH']

def recolour(items,m): return [(d, m.get(l,f), l) for d,f,l in items]
def view(items,pad):
    b=union([bbox(parse_path(d)) for d,_,_ in items])
    return (b[0]-pad, b[1]-pad, (b[2]-b[0])+2*pad, (b[3]-b[1])+2*pad)
def hex2rgb(h):
    h=h.lstrip('#'); return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
def ordered(items):
    o=[]
    for g in GROUPS:
        m=[it for it in items if it[2]==g]
        if m: o.append((m[0][1],[d for d,_,_ in m],g))
    return o

# full lockup is 250 mm wide -> fixes the scale for every file
_fullvb = view(recolour(icon+word+tag, WHITE_MAP), PAD_FULL)
SCALE = (250*MM)/_fullvb[2]

DESC=('Apparel master. Solid fills only - no gradients, strokes, effects or embedded raster. '
      'Transparent background: the garment shows through. Clear space is built into the artboard. '
      'Outlines refit from the brand master to remove auto-trace noise.')

def build_svg(items,vb,title):
    x,y,w,h=vb
    o=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" '
       f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">',
       f'  <title>{title}</title>', f'  <desc>{DESC}</desc>']
    for fill,ds,g in ordered(items):
        gid=re.sub(r'[^a-z0-9]+','-',g.lower()).strip('-')
        o.append(f'  <g id="{gid}" fill="{fill}">')
        for d in ds: o.append(f'    <path d="{d}"/>')
        o.append('  </g>')
    o.append('</svg>'); return '\n'.join(o)+'\n'

def emit(items,mv,cv,close,fillop,colop):
    s=[]
    for fill,ds,_ in ordered(items):
        s.append(colop(*hex2rgb(fill)))
        for d in ds:
            for seg in parse_path(d):
                if seg[0]=='M': s.append(mv(seg[1],seg[2]))
                elif seg[0]=='C': s.append(cv(*seg[1:]))
                elif seg[0]=='Z': s.append(close)
            s.append(fillop)
    return s

def build_pdf(items,vb,title):
    x0,y0,w,h=vb; pw,ph=w*SCALE,h*SCALE
    s=[f'q {SCALE:.6f} 0 0 {SCALE:.6f} 0 0 cm', f'1 0 0 -1 {-x0:.4f} {y0+h:.4f} cm']
    s+=emit(items, lambda x,y:'%.3f %.3f m'%(x,y),
                   lambda *a:'%.3f %.3f %.3f %.3f %.3f %.3f c'%a,
                   'h','f', lambda r,g,b:'%.4f %.4f %.4f rg'%(r,g,b))
    s.append('Q'); st=zlib.compress('\n'.join(s).encode()); t=title.replace('(','').replace(')','')
    objs={1:b'<< /Type /Catalog /Pages 2 0 R >>',2:b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
          3:('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.4f %.4f] /Contents 4 0 R /Resources << >> '
             '/Group << /S /Transparency /CS /DeviceRGB >> >>'%(pw,ph)).encode(),
          4:b'<< /Length %d /Filter /FlateDecode >>\nstream\n'%len(st)+st+b'\nendstream',
          5:('<< /Title (%s) /Creator (NOTHO brand system) /Producer (NOTHO brand system) >>'%t).encode()}
    buf=bytearray(b'%PDF-1.5\n%\xe2\xe3\xcf\xd3\n'); off={}
    for n in sorted(objs): off[n]=len(buf); buf+=b'%d 0 obj\n'%n+objs[n]+b'\nendobj\n'
    xr=len(buf); buf+=b'xref\n0 %d\n'%(len(objs)+1)+b'0000000000 65535 f \n'
    for n in sorted(objs): buf+=b'%010d 00000 n \n'%off[n]
    buf+=b'trailer\n<< /Size %d /Root 1 0 R /Info 5 0 R >>\nstartxref\n%d\n%%%%EOF\n'%(len(objs)+1,xr)
    return bytes(buf)

def build_eps(items,vb,title):
    x0,y0,w,h=vb; pw,ph=w*SCALE,h*SCALE
    s=['%!PS-Adobe-3.0 EPSF-3.0','%%%%BoundingBox: 0 0 %d %d'%(int(pw+0.9999),int(ph+0.9999)),
       '%%%%HiResBoundingBox: 0 0 %.4f %.4f'%(pw,ph),'%%Creator: NOTHO brand system',
       '%%%%Title: %s'%title,'%%%%CreationDate: %s'%STAMP,'%%LanguageLevel: 2','%%Pages: 1',
       '%%DocumentData: Clean7Bit','%%EndComments','%%BeginProlog',
       '/m {moveto} bind def','/c {curveto} bind def','/h {closepath} bind def',
       '/f {fill} bind def','/k {setrgbcolor} bind def','%%EndProlog','%%Page: 1 1',
       'gsave','%.6f %.6f scale'%(SCALE,SCALE),'[1 0 0 -1 %.4f %.4f] concat'%(-x0,y0+h)]
    s+=emit(items, lambda x,y:'%.3f %.3f m'%(x,y),
                   lambda *a:'%.3f %.3f %.3f %.3f %.3f %.3f c'%a,
                   'h','f', lambda r,g,b:'%.4f %.4f %.4f k'%(r,g,b))
    s+=['grestore','showpage','%%Trailer','%%EOF']; return '\n'.join(s)+'\n'

for d in ['svg','pdf','eps','png']: os.makedirs(f'{OUT}/{d}',exist_ok=True)
rows=[]
for sk,(cmap,sd) in SETS.items():
    for lk,(items,pad) in LOCKUPS.items():
        it=recolour(items,cmap); vb=view(it,pad)
        name=f'notho-{sk}-{lk}'; title=f'NOTHO - {lk.replace("-"," ")} lockup - {sd}'
        open(f'{OUT}/svg/{name}.svg','w').write(build_svg(it,vb,title))
        open(f'{OUT}/pdf/{name}.pdf','wb').write(build_pdf(it,vb,title))
        open(f'{OUT}/eps/{name}.eps','w').write(build_eps(it,vb,title))
        px=1500 if lk=='icon' else 3000
        res=px/(vb[2]*SCALE/72.0)
        subprocess.run(['gs','-q','-dSAFER','-dBATCH','-dNOPAUSE','-sDEVICE=pngalpha',
            f'-r{res:.4f}','-dTextAlphaBits=4','-dGraphicsAlphaBits=4',
            f'-sOutputFile={OUT}/png/{name}.png', f'{OUT}/pdf/{name}.pdf'],check=True)
        rows.append((name, vb[2]*SCALE/MM, vb[3]*SCALE/MM))
for n,wm,hm in rows: print(f'{n:26s} {wm:7.1f} x {hm:5.1f} mm')
