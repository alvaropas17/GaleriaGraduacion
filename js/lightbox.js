/**
 * Lightbox táctil con PhotoSwipe v5: pellizcar para hacer zoom, deslizar
 * entre fotos y cerrar arrastrando hacia abajo, como en las apps nativas.
 */
import PhotoSwipeLightbox from "./vendor/photoswipe/photoswipe-lightbox.esm.min.js";

let lightbox = null;

export function initLightbox() {
  lightbox = new PhotoSwipeLightbox({
    gallery: "#galeria",
    children: "a.foto-enlace",
    pswpModule: () => import("./vendor/photoswipe/photoswipe.esm.min.js"),
    // textos en español
    closeTitle: "Cerrar",
    zoomTitle: "Zoom",
    arrowPrevTitle: "Anterior",
    arrowNextTitle: "Siguiente",
    errorMsg: "No se pudo cargar la foto",
    showHideAnimationType: "zoom",
    bgOpacity: 0.95
  });

  // Pie de foto manuscrito dentro del lightbox
  lightbox.on("uiRegister", () => {
    lightbox.pswp.ui.registerElement({
      name: "custom-caption",
      appendTo: "root",
      onInit: (elemento, pswp) => {
        pswp.on("change", () => {
          elemento.textContent = pswp.currSlide?.data?.element?.dataset.caption ?? "";
        });
      }
    });
  });

  lightbox.init();
  return lightbox;
}

export function abrirFoto(indice) {
  lightbox?.loadAndOpen(indice, { gallery: document.querySelector("#galeria") });
}
