/**
 * Genera fotos de ejemplo (placeholders) para que la galería se pueda ver
 * antes de subir las fotos reales. Cuando tengas tus fotos, borra las
 * carpetas de photos/ y sustitúyelas por las tuyas.
 *
 * Uso: npm run placeholders
 */
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const raiz = new URL("..", import.meta.url).pathname;
const datos = JSON.parse(await readFile(path.join(raiz, "data/photos.json"), "utf8"));

// Paleta cálida tipo papel/scrapbook para los degradados
const paletas = [
  ["#e8a87c", "#c38d5f"],
  ["#d4a5a5", "#a97155"],
  ["#c9b458", "#8f7f3f"],
  ["#9fb8ad", "#5f7d6e"],
  ["#c97b63", "#8e4f3d"],
  ["#b5a642", "#7d7030"],
  ["#d9b382", "#a67c52"],
  ["#a5c0d4", "#5f7d8e"]
];

// Distintas proporciones para que el masonry tenga vida
const tamanos = [
  [1200, 900],
  [900, 1200],
  [1200, 1200],
  [1200, 800],
  [900, 1350]
];

const emojis = ["🎓", "📸", "🎉", "✨", "💛", "🌅", "🚌", "🏖️", "📚", "🥳"];

function svgPlaceholder(w, h, colores, etiqueta, emoji) {
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${colores[0]}"/>
        <stop offset="1" stop-color="${colores[1]}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="50%" y="46%" font-size="${Math.round(w / 6)}" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="50%" y="62%" font-family="sans-serif" font-size="${Math.round(w / 28)}" font-weight="bold" fill="rgba(255,255,255,0.85)" text-anchor="middle">${etiqueta}</text>
  </svg>`;
}

let i = 0;
const todas = datos.capitulos.flatMap((c) => c.fotos.map((f) => f.src));
for (const src of todas) {
  const destino = path.join(raiz, src);
  await mkdir(path.dirname(destino), { recursive: true });
  const [w, h] = tamanos[i % tamanos.length];
  const svg = svgPlaceholder(
    w,
    h,
    paletas[i % paletas.length],
    "Foto de ejemplo — sustitúyeme",
    emojis[i % emojis.length]
  );
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(destino);
  i++;
}

console.log(`Generadas ${i} fotos de ejemplo en photos/`);
