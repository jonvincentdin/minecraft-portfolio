"""Build the original JVD Pixel display font from hand-authored 5x7 glyphs."""
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

GLYPHS={
'A':'01110/11011/11011/11111/11011/11011/11011',
'B':'11110/11011/11011/11110/11011/11011/11110',
'C':'01111/11000/11000/11000/11000/11000/01111',
'D':'11110/11011/11011/11011/11011/11011/11110',
'E':'11111/11000/11000/11110/11000/11000/11111',
'F':'11111/11000/11000/11110/11000/11000/11000',
'G':'01111/11000/11000/11011/11011/11011/01111',
'H':'11011/11011/11011/11111/11011/11011/11011',
'I':'11111/00100/00100/00100/00100/00100/11111',
'J':'00111/00011/00011/00011/11011/11011/01110',
'K':'11011/11011/11110/11100/11110/11011/11011',
'L':'11000/11000/11000/11000/11000/11000/11111',
'M':'10001/11011/11111/10101/10101/10101/10101',
'N':'11001/11101/11101/11011/11011/11011/11001',
'O':'01110/11011/11011/11011/11011/11011/01110',
'P':'11110/11011/11011/11110/11000/11000/11000',
'Q':'01110/11011/11011/11011/11111/01110/00011',
'R':'11110/11011/11011/11110/11100/11010/11011',
'S':'01111/11000/11000/01110/00011/00011/11110',
'T':'11111/00100/00100/00100/00100/00100/00100',
'U':'11011/11011/11011/11011/11011/11011/01110',
'V':'11011/11011/11011/11011/11011/01110/00100',
'W':'10101/10101/10101/10101/11111/11011/10001',
'X':'11011/11011/01110/00100/01110/11011/11011',
'Y':'11011/11011/01110/00100/00100/00100/00100',
'Z':'11111/00011/00110/01100/11000/11000/11111',
'0':'01110/11011/11011/11011/11011/11011/01110',
'1':'00100/01100/00100/00100/00100/00100/01110',
'2':'01110/11011/00011/00110/01100/11000/11111',
'3':'11110/00011/00011/01110/00011/00011/11110',
'4':'11011/11011/11011/11111/00011/00011/00011',
'5':'11111/11000/11000/11110/00011/00011/11110',
'6':'01110/11000/11000/11110/11011/11011/01110',
'7':'11111/00011/00110/00100/01100/01100/01100',
'8':'01110/11011/11011/01110/11011/11011/01110',
'9':'01110/11011/11011/01111/00011/00011/01110',
'.':'0/0/0/0/0/1/1',',':'00/00/00/00/01/01/10',
'!':'1/1/1/1/1/0/1','?':'01110/11011/00011/00110/00100/00000/00100',
':':'0/1/1/0/1/1/0','-':'000/000/000/111/000/000/000',
"'":'1/1/0/0/0/0/0','/':'00001/00011/00110/00100/01100/11000/10000',
'+':'000/010/010/111/010/010/000','&':'01100/11010/11000/01101/11010/11011/01101',
'(':'01/10/10/10/10/10/01',')':'10/01/01/01/01/01/10',
'%':'11001/11011/00010/00100/01000/11011/10011',
}
def main():
    dest=Path(__file__).resolve().parents[1]/'fonts';dest.mkdir(exist_ok=True)
    glyphs={};metrics={};cmap={};order=['.notdef','space']
    for name in order:glyphs[name]=TTGlyphPen(None).glyph();metrics[name]=(350,0)
    cmap[32]='space'
    for char,rows in GLYPHS.items():
        name='uni%04X'%ord(char);order.append(name);cmap[ord(char)]=name
        if char.isalpha():cmap[ord(char.lower())]=name
        rows=rows.split('/');p=TTGlyphPen(None);edges=set()
        for y,row in enumerate(rows):
            for x,bit in enumerate(row):
                if bit=='1':
                    x0,y0=x*100,(6-y)*100
                    pts=[(x0,y0),(x0,y0+100),(x0+100,y0+100),(x0+100,y0)]
                    for a,b in zip(pts,pts[1:]+pts[:1]):
                        if (b,a) in edges:edges.remove((b,a))
                        else:edges.add((a,b))
        # Trace the union boundary, eliminating antialias seams between pixels.
        while edges:
            start,nxt=next(iter(edges));edges.remove((start,nxt));p.moveTo(start);p.lineTo(nxt)
            while nxt!=start:
                a,b=next(e for e in edges if e[0]==nxt);edges.remove((a,b));nxt=b
                if nxt!=start:p.lineTo(nxt)
            p.closePath()
        glyphs[name]=p.glyph();metrics[name]=((len(rows[0])+1)*100,0)
    cmap[0x2019]=cmap[ord("'")];cmap[0x2014]=cmap[ord('-')];cmap[0x00d7]=cmap[ord('X')]
    fb=FontBuilder(800,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=800,descent=0);fb.setupNameTable({'familyName':'JVD Pixel','styleName':'Regular','uniqueFontIdentifier':'JVDPixel-1.0','fullName':'JVD Pixel Regular','psName':'JVDPixel-Regular','version':'Version 1.0'});fb.setupOS2(sTypoAscender=800,sTypoDescender=0,usWinAscent=800,usWinDescent=0);fb.setupPost();fb.save(dest/'JVDPixel.ttf')
    fb.font.flavor='woff';fb.font.save(dest/'JVDPixel.woff')
    (dest/'LICENSE.txt').write_text('JVD Pixel is an original display font created for Jon Vincent Din’s portfolio. Permission is granted to use, copy, modify, embed, and distribute this font and its glyph source, including commercially. Provided as-is without warranty. Not an official Minecraft font.\n')
    print('Created JVD Pixel TTF and WOFF.')
if __name__=='__main__':main()
