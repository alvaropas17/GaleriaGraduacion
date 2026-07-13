/**
 * Optimiza todas las fotos referenciadas en data/photos.json:
 * - Genera variantes WebP de 400 / 800 / 1600 px de ancho en assets/img/
 * - Genera un placeholder borroso diminuto (blur-up) en base64
 * - Escribe data/manifest.json con las rutas, dimensiones y placeholders
 *
 * La web usa el manifest para servir a cada dispositivo el tamaño justo.
 * Se ejecuta en cada despliegue (GitHub Actions) y también en local:
 *   npm run optimizar
 */
import sharp from "sharp";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const dirSalida = path.join(raiz, "assets/img");
const ANCHOS = [400, 800, 1600];
const CALIDAD = 78;
const EXTENSIONES_IMAGEN = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const datos = JSON.parse(await readFile(path.join(raiz, "data/photos.json"), "utf8"));
await mkdir(dirSalida, { recursive: true });

// Manifest previo para saltar fotos ya procesadas y no repetir trabajo
let manifest = {};
try {
  manifest = JSON.parse(await readFile(path.join(raiz, "data/manifest.json"), "utf8"));
} catch {
  /* primera ejecución */
}

function slug(src) {
  return src
    .replace(/^photos\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

const fuentes = [
  ...(datos.hero?.src ? [datos.hero.src] : []),
  ...datos.capitulos.flatMap((c) => c.fotos.filter((f) => EXTENSIONES_IMAGEN.has(path.extname(f.src).toLowerCase())).map((f) => f.src))
];

let procesadas = 0;
let saltadas = 0;

for (const src of [...new Set(fuentes)]) {
  const absoluta = path.join(raiz, src);
  let mtime;
  try {
    mtime = (await stat(absoluta)).mtimeMs;
  } catch {
    console.warn(`⚠ No existe ${src} — se omite (¿olvidaste copiar la foto?)`);
    continue;
  }

  const clave = slug(src);
  if (manifest[src]?.mtime === mtime) {
    saltadas++;
    continue;
  }

  const imagen = sharp(absoluta).rotate(); // respeta la orientación EXIF
  const meta = await imagen.metadata();
  const anchoReal = meta.autoOrient?.width ?? meta.width;
  const altoReal = meta.autoOrient?.height ?? meta.height;

  const variantes = {};
  for (const ancho of ANCHOS) {
    const destino = `assets/img/${clave}-${ancho}.webp`;
    await imagen
      .clone()
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: CALIDAD })
      .toFile(path.join(raiz, destino));
    variantes[ancho] = destino;
  }

  // Placeholder diminuto y borroso que se ve mientras carga la foto real
  const lqipBuffer = await imagen.clone().resize({ width: 24 }).webp({ quality: 30 }).toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuffer.toString("base64")}`;

  manifest[src] = { width: anchoReal, height: altoReal, variantes, lqip, mtime };
  procesadas++;
}

// Limpia del manifest fotos que ya no están en photos.json
const vigentes = new Set(fuentes);
for (const clave of Object.keys(manifest)) {
  if (!vigentes.has(clave)) delete manifest[clave];
}

await writeFile(path.join(raiz, "data/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Optimización lista: ${procesadas} fotos procesadas, ${saltadas} sin cambios.`);
