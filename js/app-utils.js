/*
 * Utilidades compartidas por la galería y el visor:
 *   · Favoritos persistidos en el navegador (localStorage), sin servidor.
 *   · Avisos flotantes (toasts) para dar feedback al usuario.
 * Se carga antes que lightbox.js y gallery.js.
 */
(function () {
  'use strict';

  /* ---------------- Favoritos ---------------- */

  const KEY = 'galeria:favoritos';
  const set = load();
  const listeners = new Set();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (_) {
      return new Set();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify([...set]));
    } catch (_) {
      /* Modo incógnito o almacenamiento lleno: los favoritos solo durarán
         esta sesión, pero la web sigue funcionando. */
    }
  }

  const Favorites = {
    has: (id) => set.has(id),
    count: () => set.size,
    toggle(id) {
      const active = !set.has(id);
      if (active) set.add(id);
      else set.delete(id);
      save();
      listeners.forEach((fn) => fn(id, active));
      return active;
    },
    /* Registra un callback (id, active) que se ejecuta al cambiar un favorito */
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  /* ---------------- Toast ---------------- */

  let toastEl = null;
  let toastTimer = null;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.getElementById('toast');
      if (!toastEl) return;
    }
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  window.Favorites = Favorites;
  window.toast = toast;
})();
