import { writeFileSync } from 'node:fs';
// Generates the v2 JVD logo set. Usage: node generate-logo.mjs <output-dir>
const out = process.argv[2];
const G = {
  J: ['..####','...##.','...##.','...##.','##.##.','##.##.','.###..'],
  V: ['##..##','##..##','##..##','##..##','##..##','.####.','..##..'],
  D: ['#####.','##..##','##..##','##..##','##..##','##..##','#####.'],
};
const C = { bg:'#111e1a', cream:'#eee3be', creamDk:'#d9cc9f', grass:'#bbd48e', grassDk:'#8fb15a', sideR:'#2f4a34', sideB:'#1c2e22', grassSideR:'#5f7f3a', grassSideB:'#46622b', dirt:'#8a6a43', dirtDk:'#6e5434', dirtSpk:'#7a5c39', topG:'#9fc265', topGLt:'#bbd48e' };
const r = (x,y,w,h,f) => `<rect x="${+x.toFixed(2)}" y="${+y.toFixed(2)}" width="${+w.toFixed(2)}" height="${+h.toFixed(2)}" fill="${f}"/>`;
const poly = (pts,f) => `<polygon points="${pts.map(p=>p.map(n=>+n.toFixed(2)).join(',')).join(' ')}" fill="${f}"/>`;
// deterministic texture
const tex = (i,j,seed=1) => ((i*73856093 ^ j*19349663 ^ seed*83492791) >>> 0) % 7 === 0;

// ---------- Wordmark: extruded pixel JVD + grass-block full stop ----------
function wordmark({ u = 10, d = 5, withBg = false } = {}) {
  const cells = []; let ox = 0;
  for (const ch of 'JVD') { G[ch].forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') cells.push({ x: ox + x, y, ch }); })); ox += 7; }
  const pad = u; const faces = [], ext = [];
  // grass cap: the top filled cell of each column in each letter, plus drips
  const topOf = new Map();
  for (const c of cells) { const k = c.x; if (!topOf.has(k) || topOf.get(k) > c.y) topOf.set(k, c.y); }
  const isGrass = c => c.y === 0 || (c.y === 1 && tex(c.x, c.y, 3));
  for (const c of cells) {
    const X = pad + c.x * u, Y = pad + c.y * u, g = isGrass(c);
    ext.push(poly([[X+u,Y],[X+u+d,Y+d],[X+u+d,Y+u+d],[X+u,Y+u]], g ? C.grassSideR : C.sideR));
    ext.push(poly([[X,Y+u],[X+u,Y+u],[X+u+d,Y+u+d],[X+d,Y+u+d]], g ? C.grassSideB : C.sideB));
    faces.push(r(X, Y, u, u, g ? (tex(c.x,c.y,5) ? C.grassDk : C.grass) : ((c.x * 7 + c.y * 3) % 11 === 0 ? C.creamDk : C.cream)));
  }
  // full stop: a small isometric grass block sitting on the baseline
  const s = u * 2, bx = pad + 21.4 * u, by = pad + 7 * u + d - s * 1.5; // bottom tip on baseline
  const cx = bx, top = by, h = s * 0.5;
  const T = [cx, top], R = [cx + s*0.866, top + h], F = [cx, top + 2*h], L = [cx - s*0.866, top + h];
  const down = p => [p[0], p[1] + s];
  const block = [
    poly([L, F, down(F), down(L)], C.dirt), poly([F, R, down(R), down(F)], C.dirtDk),
    poly([L, F, [F[0], F[1] + s*0.32], [L[0], L[1] + s*0.32]], C.grassDk),
    poly([F, R, [R[0], R[1] + s*0.32], [F[0], F[1] + s*0.32]], C.grassSideR),
    poly([T, R, F, L], C.topGLt),
  ];
  const W = pad * 2 + 21.4 * u + s*0.866 + d, H = pad * 2 + 7 * u + d;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+W.toFixed(2)} ${H}" width="${+W.toFixed(2)}" height="${H}" shape-rendering="crispEdges" role="img" aria-labelledby="t"><title id="t">JVD — Jon Vincent Din</title>${withBg ? r(0,0,W,H,C.bg) : ''}<g>${ext.join('')}</g><g>${faces.join('')}</g><g shape-rendering="geometricPrecision">${block.join('')}</g></svg>`;
}

// ---------- Mark: isometric grass block whose three faces carry J, V and D ----------
function mark({ size = 512, withBg = true, letters = true } = {}) {
  const s = size * 0.5, k = 0.866, n = 9, p = s / n;
  const O = [size / 2, size * 0.5 - s]; // back vertex of the top face
  // face transforms: local (u,v) in [0,s]
  const left = `matrix(${k},0.5,0,1,${O[0]-k*s},${O[1]+0.5*s})`;
  const right = `matrix(${k},-0.5,0,1,${O[0]},${O[1]+s})`;
  const topT = `matrix(${k},0.5,${-k},0.5,${O[0]},${O[1]})`;
  const face = (base, spk, grassRows, letter, letterColor, shade, seed) => {
    let o = r(0, 0, s, s, base);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (tex(i, j, seed)) o += r(i*p, j*p, p, p, spk);
    if (grassRows) for (let i = 0; i < n; i++) { const rows = grassRows + (tex(i, 1, seed + 9) ? 1 : 0); o += r(i*p, 0, p, rows*p, i % 3 === 1 ? C.grassDk : C.grass); }
    const oy = grassRows ? 2 : 1;
    if (letter) G[letter].forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') o += r((1.5 + x)*p, (oy + y)*p, p, p, letterColor); }));
    if (shade) o += r(0, 0, s, s, shade);
    return o;
  };
  const body = [
    `<g transform="${left}">${face(C.dirt, C.dirtSpk, 2, letters && 'J', C.cream, null, 1)}</g>`,
    `<g transform="${right}">${face(C.dirt, C.dirtSpk, 2, letters && 'V', C.cream, '#00000022', 2)}</g>`,
    `<g transform="${topT}">${face(C.topG, C.grassDk, 0, letters && 'D', C.cream, '#ffffff10', 4)}</g>`,
  ].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-labelledby="t"><title id="t">JVD block — Jon Vincent Din</title>${withBg ? r(0,0,size,size,C.bg) : ''}<g shape-rendering="crispEdges">${body}</g></svg>`;
}

writeFileSync(`${out}/jvd-wordmark.svg`, wordmark());
writeFileSync(`${out}/jvd-wordmark-on-dark.svg`, wordmark({ withBg: true }));
writeFileSync(`${out}/jvd-mark.svg`, mark());
writeFileSync(`${out}/jvd-mark-transparent.svg`, mark({ withBg: false }));
writeFileSync(`${out}/jvd-favicon.svg`, mark({ size: 64, withBg: false, letters: false }));
