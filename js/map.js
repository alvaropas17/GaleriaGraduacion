/**
 * Mapa de recuerdos con Leaflet + OpenStreetMap (gratuito).
 * Solo se carga la librería cuando la sección entra en pantalla,
 * y solo si hay fotos con coordenadas en photos.json.
 */
import { cargarScript } from "./db.js";

export function initMapa(fotos, manifest) {
  const conCoordenadas = fotos.filter((f) => Array.isArray(f.coords) && f.coords.length === 2);
  if (conCoordenadas.length === 0) return; // la sección queda oculta

  const seccion = document.getElementById("mapa-seccion");
  seccion.hidden = false;

  const observador = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      observador.disconnect();
      montarMapa(conCoordenadas, manifest).catch((err) =>
        console.warn("No se pudo cargar el mapa", err)
      );
    },
    { rootMargin: "400px" }
  );
  observador.observe(seccion);
}

async function montarMapa(fotos, manifest) {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "js/vendor/leaflet/leaflet.css";
  document.head.append(css);
  await cargarScript("js/vendor/leaflet/leaflet.js");

  const L = window.L;
  L.Icon.Default.prototype.options.imagePath = "js/vendor/leaflet/images/";

  const mapa = L.map("mapa", { scrollWheelZoom: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mapa);

  const grupo = L.featureGroup();
  for (const foto of fotos) {
    const marcador = L.marker(foto.coords);
    const miniatura = manifest[foto.src]?.variantes?.[400] ?? foto.src;
    const div = document.createElement("div");
    div.className = "mapa-popup";
    const img = document.createElement("img");
    img.src = miniatura;
    img.alt = foto.caption ?? "";
    const pie = document.createElement("p");
    pie.className = "mapa-caption";
    pie.textContent = foto.lugar ? `📍 ${foto.lugar}` : foto.caption ?? "";
    div.append(img, pie);
    marcador.bindPopup(div);
    grupo.addLayer(marcador);
  }
  grupo.addTo(mapa);
  mapa.fitBounds(grupo.getBounds().pad(0.25));
}
