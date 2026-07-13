/**
 * Escanea las carpetas de photos/ y actualiza data/photos.json:
 * - Cada subcarpeta de photos/ es un capítulo (usa un prefijo numérico
 *   para ordenarlas, p. ej. "01-el-primer-dia").
 * - Las fotos nuevas se añaden con el pie de foto vacío para que lo
 *   rellenes tú; las que ya existen conservan su caption, lugar y coords.
 *
 * Uso: npm run fotos
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const raiz = new URL("..", import.meta.url).pathname;
const rutaDatos = path.join(raiz, "data/photos.json");
const dirFotos = path.join(raiz, "photos");

const EXTENSIONES = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const datos = JSON.parse(await readFile(rutaDatos, "utf8"));
const previos = new Map();
for (const cap of datos.capitulos ?? []) {
  for (const foto of cap.fotos ?? []) previos.set(foto.src, foto);
}
const titulosPrevios = new Map((datos.capitulos ?? []).map((c) => [c.id, c]));

function idDesdeCarpeta(nombre) {
  return nombre.replace(/^\d+[-_ ]*/, "");
}

function tituloDesdeId(id) {
  const limpio = id.replace(/[-_]+/g, " ").trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

const carpetas = (await readdir(dirFotos, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const capitulos = [];
let nuevas = 0;

for (const carpeta of carpetas) {
  const id = idDesdeCarpeta(carpeta);
  const archivos = (await readdir(path.join(dirFotos, carpeta)))
    .filter((f) => EXTENSIONES.has(path.extname(f).toLowerCase()))
    .sort();
  if (archivos.length === 0) continue;

  const previo = titulosPrevios.get(id);
  const fotos = archivos.map((archivo) => {
    const src = `photos/${carpeta}/${archivo}`;
    if (previos.has(src)) return previos.get(src);
    nuevas++;
    return { src, caption: "" };
  });

  capitulos.push({
    id,
    titulo: previo?.titulo ?? tituloDesdeId(id),
    texto: previo?.texto ?? "",
    fotos
  });
}

datos.capitulos = capitulos;
await writeFile(rutaDatos, JSON.stringify(datos, null, 2) + "\n");
console.log(
  `photos.json actualizado: ${capitulos.length} capítulos, ${nuevas} fotos nuevas (rellena sus captions en data/photos.json).`
);
