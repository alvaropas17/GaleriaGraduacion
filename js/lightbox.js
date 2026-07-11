/*
 * Visor a pantalla completa: navegación (teclado, botones, swipe),
 * zoom (rueda, doble toque/clic, pellizco) con arrastre, precarga de
 * fotos vecinas y descarga del original.
 */
(function () {
  'use strict';

  const root = document.getElementById('lightbox');
  const stage = document.getElementById('lb-stage');
  const img = document.getElementById('lb-img');
  const spinner = document.getElementById('lb-spinner');
  const counter = document.getElementById('lb-counter');
  const downloadBtn = document.getElementById('lb-download');
  const closeBtn = document.getElementById('lb-close');
  const prevBtn = document.getElementById('lb-prev');
  const nextBtn = document.getElementById('lb-next');
  const hint = document.getElementById('lb-hint');

  const MAX_ZOOM = 5;
  let photos = [];
  let index = 0;
  let lastFocus = null;
  let hintShown = false;

  /* Estado de zoom/arrastre */
  let scale = 1;
  let tx = 0;
  let ty = 0;
  const pointers = new Map();
  let pinchStart = null;
  let dragStart = null;
  let lastTap = 0;

  window.Lightbox = { open, close };

  function open(list, i) {
    photos = list;
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    show(i);
    closeBtn.focus();
    if (!hintShown) {
      hintShown = true;
      hint.classList.remove('fade');
      setTimeout(() => hint.classList.add('fade'), 3500);
    } else {
      hint.classList.add('fade');
    }
  }

  function close() {
    root.hidden = true;
    document.body.style.overflow = '';
    img.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function show(i) {
    index = (i + photos.length) % photos.length;
    const photo = photos[index];
    resetZoom();
    spinner.hidden = false;
    img.style.opacity = '0.35';
    img.alt = photo.alt || '';
    img.src = photo.full;
    if (img.complete) onLoaded();
    else img.addEventListener('load', onLoaded, { once: true });

    counter.textContent = `${index + 1} / ${photos.length}`;
    downloadBtn.href = photo.download;
    downloadBtn.setAttribute('download', suggestFilename(photo));

    preload(index + 1);
    preload(index - 1);
  }

  function onLoaded() {
    spinner.hidden = true;
    img.style.opacity = '';
  }

  function preload(i) {
    const photo = photos[(i + photos.length) % photos.length];
    if (photo) new Image().src = photo.full;
  }

  function suggestFilename(photo) {
    try {
      const clean = new URL(photo.download, location.href).pathname.split('/').pop();
      if (clean && /\.[a-z0-9]+$/i.test(clean)) return decodeURIComponent(clean);
    } catch (_) { /* URL relativa rara: usamos el nombre genérico */ }
    return 'graduacion-' + (index + 1) + '.jpg';
  }

  /* ---------------- Navegación ---------------- */

  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  closeBtn.addEventListener('click', close);
  root.querySelector('[data-lb-close]').addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });

  /* ---------------- Zoom y gestos ---------------- */

  function applyTransform() {
    img.style.transform = scale === 1 && !tx && !ty
      ? ''
      : `translate(${tx}px, ${ty}px) scale(${scale})`;
    stage.style.cursor = scale > 1 ? 'grab' : '';
  }

  function resetZoom() {
    scale = 1; tx = 0; ty = 0;
    pointers.clear();
    pinchStart = null;
    dragStart = null;
    img.classList.remove('dragging');
    applyTransform();
  }

  function clampPan() {
    /* Evita que la imagen se pierda fuera de la pantalla al arrastrar */
    const limitX = (img.clientWidth * scale) / 2 + stage.clientWidth / 2 - 60;
    const limitY = (img.clientHeight * scale) / 2 + stage.clientHeight / 2 - 60;
    tx = Math.max(-limitX, Math.min(limitX, tx));
    ty = Math.max(-limitY, Math.min(limitY, ty));
  }

  function zoomAt(clientX, clientY, newScale) {
    newScale = Math.max(1, Math.min(MAX_ZOOM, newScale));
    if (newScale === 1) { scale = 1; tx = 0; ty = 0; applyTransform(); return; }
    const rect = stage.getBoundingClientRect();
    const cx = clientX - rect.left - rect.width / 2;
    const cy = clientY - rect.top - rect.height / 2;
    /* Mantiene el punto bajo el cursor fijo mientras cambia la escala */
    const ratio = newScale / scale;
    tx = cx - ratio * (cx - tx);
    ty = cy - ratio * (cy - ty);
    scale = newScale;
    clampPan();
    applyTransform();
  }

  stage.addEventListener('wheel', (e) => {
    if (root.hidden) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    zoomAt(e.clientX, e.clientY, scale * factor);
  }, { passive: false });

  stage.addEventListener('dblclick', (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, scale > 1 ? 1 : 2.5);
  });

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.lb-topbar, .lb-nav')) return;
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      };
      dragStart = null;
    } else if (pointers.size === 1) {
      dragStart = { x: e.clientX, y: e.clientY, tx, ty, time: Date.now(), moved: false };
      img.classList.add('dragging');
    }
  });

  stage.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(pinchStart.cx, pinchStart.cy, pinchStart.scale * (dist / pinchStart.dist));
    } else if (pointers.size === 1 && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) dragStart.moved = true;
      if (scale > 1) {
        tx = dragStart.tx + dx;
        ty = dragStart.ty + dy;
        clampPan();
        applyTransform();
      }
    }
  });

  function onPointerEnd(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    img.classList.remove('dragging');

    if (pointers.size < 2) pinchStart = null;

    if (pointers.size === 0 && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dt = Date.now() - dragStart.time;

      if (scale === 1 && dragStart.moved && Math.abs(dx) > 60 && dt < 600) {
        /* Swipe horizontal para cambiar de foto */
        show(dx < 0 ? index + 1 : index - 1);
      } else if (!dragStart.moved && e.pointerType === 'touch') {
        /* Doble toque para hacer zoom (dblclick no siempre llega en táctil) */
        const now = Date.now();
        if (now - lastTap < 320) {
          zoomAt(e.clientX, e.clientY, scale > 1 ? 1 : 2.5);
          lastTap = 0;
        } else {
          lastTap = now;
        }
      }
      dragStart = null;
    }
  }

  stage.addEventListener('pointerup', onPointerEnd);
  stage.addEventListener('pointercancel', onPointerEnd);
})();
