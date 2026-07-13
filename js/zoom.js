/**
 * Zoom de densidad: cambia cuántas fotos caben por fila en la galería.
 * Nivel 1 = fotos grandes (menos por fila), nivel 3 = fotos pequeñas
 * (más por fila). Se controla con los botones +/-, con Ctrl/Cmd+rueda
 * y con el gesto de pellizco en pantallas táctiles.
 */

const NIVEL_MINIMO = 1;
const NIVEL_MAXIMO = 3;
const NIVEL_INICIAL = 2;

export function initZoomDensidad() {
  const galeria = document.getElementById("galeria");
  const control = document.getElementById("zoom-densidad");
  if (!galeria || !control) return;

  const botonMenos = document.getElementById("zoom-menos");
  const botonMas = document.getElementById("zoom-mas");
  const anuncio = document.getElementById("zoom-anuncio");
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let nivel = NIVEL_INICIAL;

  function aplicarNivel(nuevoNivel) {
    nuevoNivel = Math.min(NIVEL_MAXIMO, Math.max(NIVEL_MINIMO, nuevoNivel));
    if (nuevoNivel === nivel) return;
    nivel = nuevoNivel;
    galeria.dataset.densidad = String(nivel);
    botonMenos.disabled = nivel === NIVEL_MINIMO;
    botonMas.disabled = nivel === NIVEL_MAXIMO;
    const etiquetas = { 1: "Fotos grandes", 2: "Tamaño medio", 3: "Fotos pequeñas" };
    anuncio.textContent = etiquetas[nivel];

    if (!reducido) {
      galeria.classList.add("cambiando-densidad");
      window.setTimeout(() => galeria.classList.remove("cambiando-densidad"), 220);
    }
  }

  galeria.dataset.densidad = String(nivel);
  botonMenos.addEventListener("click", () => aplicarNivel(nivel - 1));
  botonMas.addEventListener("click", () => aplicarNivel(nivel + 1));

  let ultimoWheel = 0;
  galeria.addEventListener(
    "wheel",
    (evento) => {
      if (!evento.ctrlKey && !evento.metaKey) return;
      evento.preventDefault();
      const ahora = Date.now();
      if (ahora - ultimoWheel < 300) return;
      ultimoWheel = ahora;
      aplicarNivel(nivel + (evento.deltaY < 0 ? -1 : 1));
    },
    { passive: false }
  );

  const punteros = new Map();
  let distanciaInicial = null;

  function distanciaEntrePunteros() {
    const [a, b] = [...punteros.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  galeria.addEventListener("pointerdown", (evento) => {
    if (evento.pointerType !== "touch") return;
    punteros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (punteros.size === 2) distanciaInicial = distanciaEntrePunteros();
  });

  galeria.addEventListener("pointermove", (evento) => {
    if (!punteros.has(evento.pointerId)) return;
    punteros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (punteros.size !== 2 || distanciaInicial === null) return;
    const distanciaActual = distanciaEntrePunteros();
    const diferencia = distanciaActual - distanciaInicial;
    if (Math.abs(diferencia) < 45) return;
    aplicarNivel(nivel + (diferencia > 0 ? -1 : 1));
    distanciaInicial = distanciaActual;
  });

  function soltarPuntero(evento) {
    punteros.delete(evento.pointerId);
    if (punteros.size < 2) distanciaInicial = null;
  }
  galeria.addEventListener("pointerup", soltarPuntero);
  galeria.addEventListener("pointercancel", soltarPuntero);

  botonMenos.disabled = nivel === NIVEL_MINIMO;
  botonMas.disabled = nivel === NIVEL_MAXIMO;
}
