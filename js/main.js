/**
 * Punto de entrada: carga los datos, monta la galería y activa cada módulo.
 */
import { renderHero, renderGaleria } from "./gallery.js";
import { initLightbox, abrirRecuerdo } from "./lightbox.js";
import { initReacciones } from "./reactions.js";
import { initDedicatorias } from "./guestbook.js";
import { initMapa } from "./map.js";
import { initRevelado, initContador, initRecuerdoAleatorio } from "./extras.js";
import { initZoomDensidad } from "./zoom.js";
import { initFondoTematico } from "./temas.js";

async function cargarJson(ruta, obligatorio) {
  try {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`${ruta}: ${respuesta.status}`);
    return await respuesta.json();
  } catch (err) {
    if (obligatorio) throw err;
    console.warn(`No se pudo cargar ${ruta} (¿falta ejecutar "npm run optimizar"?)`, err);
    return {};
  }
}

async function arrancar() {
  const [datos, manifest] = await Promise.all([
    cargarJson("data/photos.json", true),
    cargarJson("data/manifest.json", false)
  ]);

  renderHero(datos, manifest);
  const fotos = renderGaleria(datos, manifest);

  initLightbox(fotos);
  initRevelado();
  initContador(datos.fechaGraduacion);
  initRecuerdoAleatorio(fotos.length, abrirRecuerdo);
  initMapa(fotos, manifest);
  initReacciones();
  initDedicatorias();
  initZoomDensidad();
  initFondoTematico();
}

arrancar().catch((err) => {
  console.error(err);
  document.getElementById("galeria").innerHTML =
    '<p style="text-align:center;padding:3rem 1rem">No se pudieron cargar las fotos 😔 — revisa que <code>data/photos.json</code> exista y sea válido.</p>';
});
