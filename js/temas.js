/**
 * Cambia el fondo ilustrado de la página según el tema (playa/voley/noche)
 * de las fotos que están en el viewport, usando el mismo patrón de
 * IntersectionObserver que initRevelado() en extras.js.
 */

export function initFondoTematico() {
  const capa = document.querySelector(".fondo-tematico");
  const polaroids = document.querySelectorAll(".polaroid[data-tema]");
  if (!capa || polaroids.length === 0) return;

  const fondos = new Map();
  capa.querySelectorAll("[data-fondo-tema]").forEach((fondo) => {
    fondos.set(fondo.dataset.fondoTema, fondo);
  });

  const visibles = new Map();

  function activarTema(tema) {
    if (!fondos.has(tema)) return;
    fondos.forEach((fondo, nombre) => {
      fondo.classList.toggle("fondo-tema-activo", nombre === tema);
    });
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        const tema = entrada.target.dataset.tema;
        if (entrada.isIntersecting) visibles.set(entrada.target, tema);
        else visibles.delete(entrada.target);
      }
      if (visibles.size === 0) return;

      // La "playa" es el tema ambiental por defecto: cualquier tema distinto
      // (voley, noche…) presente en el viewport tiene prioridad, aunque sean
      // minoría en la fila (si hay varios, gana el más repetido).
      const conteo = new Map();
      for (const tema of visibles.values()) conteo.set(tema, (conteo.get(tema) ?? 0) + 1);
      conteo.delete("playa");
      const temaDominante = conteo.size > 0 ? [...conteo.entries()].sort((a, b) => b[1] - a[1])[0][0] : "playa";
      activarTema(temaDominante);
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
  );

  polaroids.forEach((polaroid) => observador.observe(polaroid));
}
