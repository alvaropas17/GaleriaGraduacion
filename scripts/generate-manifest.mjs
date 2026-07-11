/*
 * Genera miniaturas WebP y el índice images/manifest.json a partir de las
 * fotos de images/. Lo ejecuta automáticamente la GitHub Action al subir
 * fotos nuevas; también puede lanzarse a mano con `node scripts/generate-manifest.mjs`.
 */
import { readdir, mkdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve(process.cwd(), 'images');
const THUMBS_DIR = path.join(IMAGES_DIR, 'thumbs');
const MANIFEST = path.join(IMAGES_DIR, 'manifest.json');
const THUMB_WIDTHS = [400, 800, 1200];
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.gif']);

await mkdir(THUMBS_DIR, { recursive: true });

const files = (await readdir(IMAGES_DIR, { withFileTypes: true }))
  .filter((d) => d.isFile() && EXTENSIONS.has(path.extname(d.name).toLowerCase()))
  .map((d) => d.name)
  .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

const previous = await readFile(MANIFEST, 'utf8')
  .then((txt) => new Map(JSON.parse(txt).images.map((img) => [img.file, img])))
  .catch(() => new Map());

const missing = (p) => stat(p).then(() => false, () => true);

const images = [];
const expectedThumbs = new Set();

for (const file of files) {
  const srcPath = path.join(IMAGES_DIR, file);
  const base = path.basename(file, path.extname(file));
  const buffer = await readFile(srcPath);
  // Hash del contenido: estable entre checkouts de git, a diferencia del mtime
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 12);

  // Reutiliza la entrada anterior si la foto no cambió y sus miniaturas existen
  const cached = previous.get(file);
  let needsWork = !cached || cached.hash !== hash;
  if (!needsWork) {
    for (const rel of Object.values(cached.thumbs)) {
      if (await missing(path.join(IMAGES_DIR, rel))) { needsWork = true; break; }
    }
  }
  if (!needsWork) {
    images.push(cached);
    for (const rel of Object.values(cached.thumbs)) expectedThumbs.add(path.basename(rel));
    continue;
  }

  console.log(`Procesando ${file}…`);
  const image = sharp(buffer, { failOn: 'none' }).rotate(); // respeta la orientación EXIF
  const meta = await image.metadata();
  const swap = (meta.orientation || 1) >= 5;
  const width = swap ? meta.height : meta.width;
  const height = swap ? meta.width : meta.height;

  const { dominant } = await image.stats();
  const color = '#' + [dominant.r, dominant.g, dominant.b]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('');

  const thumbs = {};
  for (const w of THUMB_WIDTHS) {
    const name = `${base}-${w}.webp`;
    const targetWidth = Math.min(w, width);
    await image
      .clone()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(THUMBS_DIR, name));
    thumbs[targetWidth] = 'thumbs/' + name;
    expectedThumbs.add(name);
    if (w >= width) break; // la foto es más pequeña: no hacen falta tamaños mayores
  }

  images.push({ file, width, height, color, hash, thumbs });
}

// Limpia miniaturas huérfanas de fotos que ya no existen
for (const name of await readdir(THUMBS_DIR)) {
  if (!expectedThumbs.has(name)) {
    console.log(`Eliminando miniatura huérfana ${name}`);
    await unlink(path.join(THUMBS_DIR, name));
  }
}

// Salida determinista: si nada cambió, el archivo queda idéntico y no hay commit
await writeFile(MANIFEST, JSON.stringify({ images }, null, 2) + '\n');

console.log(`Listo: ${images.length} foto(s) en el manifest.`);
