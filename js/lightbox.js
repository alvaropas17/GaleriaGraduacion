/**
 * Lightbox táctil con PhotoSwipe v5: pellizcar para hacer zoom, deslizar
 * entre fotos y cerrar arrastrando hacia abajo, como en las apps nativas.
 */
import PhotoSwipeLightbox from "./vendor/photoswipe/photoswipe-lightbox.esm.min.js";

let lightbox = null;
let medios = [];
let videoOverlay = null;
let videoActivo = null;
let videoCaption = null;

export function initLightbox(listaMedios = []) {
  medios = listaMedios;
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
  initVideoLightbox();
  return lightbox;
}

function initVideoLightbox() {
  document.querySelectorAll(".video-enlace").forEach((boton) => {
    boton.addEventListener("click", () => {
      const indice = Number(boton.dataset.mediaIndex);
      abrirRecuerdo(Number.isNaN(indice) ? medios.findIndex((m) => m.src === boton.dataset.videoSrc) : indice);
    });
  });
}

function crearVideoOverlay() {
  videoOverlay = document.createElement("div");
  videoOverlay.className = "video-lightbox";
  videoOverlay.hidden = true;
  videoOverlay.innerHTML = `
    <button class="video-lightbox-cerrar" type="button" aria-label="Cerrar vídeo">×</button>
    <div class="video-lightbox-contenido" role="dialog" aria-modal="true" aria-label="Vídeo del recuerdo">
      <video class="video-lightbox-media" controls playsinline></video>
      <p class="video-lightbox-caption"></p>
    </div>
  `;
  document.body.append(videoOverlay);

  videoActivo = videoOverlay.querySelector("video");
  videoCaption = videoOverlay.querySelector(".video-lightbox-caption");
  videoOverlay.querySelector(".video-lightbox-cerrar").addEventListener("click", cerrarVideo);
  videoOverlay.addEventListener("click", (evento) => {
    if (evento.target === videoOverlay) cerrarVideo();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !videoOverlay.hidden) cerrarVideo();
  });
}

function abrirVideo(media) {
  if (!videoOverlay) crearVideoOverlay();
  videoActivo.src = media.src;
  videoCaption.textContent = media.caption ?? "";
  videoCaption.hidden = !videoCaption.textContent;
  videoOverlay.hidden = false;
  document.body.classList.add("con-video-lightbox");
  videoActivo.focus();
  videoActivo.play().catch(() => {});
}

function cerrarVideo() {
  if (!videoOverlay) return;
  videoActivo.pause();
  videoActivo.removeAttribute("src");
  videoActivo.load();
  videoOverlay.hidden = true;
  document.body.classList.remove("con-video-lightbox");
}

export function abrirRecuerdo(indice) {
  const media = medios[indice];
  if (!media) return;
  if (media.tipo === "video") {
    abrirVideo(media);
    return;
  }
  lightbox?.loadAndOpen(media.indiceLightbox, { gallery: document.querySelector("#galeria") });
}

export function abrirFoto(indice) {
  lightbox?.loadAndOpen(indice, { gallery: document.querySelector("#galeria") });
}