/*
 * Carga la lista de fotos desde la fuente configurada (local o Cloudinary),
 * las normaliza a un formato común y pinta el grid con carga perezosa.
 */
(function () {
  'use strict';

  const cfg = window.GALLERY_CONFIG;
  const grid = document.getElementById('gallery');
  const status = document.getElementById('gallery-status');
  const countEl = document.getElementById('gallery-count');

  applyHeroTexts();
  loadPhotos()
    .then(renderGallery)
    .catch(showError);

  function applyHeroTexts() {
    const h = cfg.hero || {};
    setText('hero-name', h.name);
    setText('hero-degree', h.degree);
    setText('hero-tagline', h.tagline);
    setText('hero-date', h.date);
    if (cfg.pageTitle) document.title = cfg.pageTitle;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  /*
   * Devuelve una lista de fotos normalizadas:
   * { thumb, srcset, sizes, full, download, width, height, color, alt }
   */
  async function loadPhotos() {
    return cfg.source === 'cloudinary' ? loadFromCloudinary() : loadFromLocal();
  }

  async function loadFromLocal() {
    const res = await fetch('images/manifest.json', { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(
        'Aún no hay fotos. Sube tus imágenes a la carpeta images/ del repositorio ' +
        'y espera a que la automatización genere las miniaturas (ver README).'
      );
    }
    const manifest = await res.json();
    return manifest.images.map((img) => {
      const original = 'images/' + encodeURIComponent(img.file);
      const entries = Object.entries(img.thumbs || {});
      const srcset = entries
        .map(([w, path]) => `images/${encodePath(path)} ${w}w`)
        .join(', ');
      const mid = img.thumbs && (img.thumbs['800'] || entries[entries.length - 1][1]);
      return {
        thumb: mid ? 'images/' + encodePath(mid) : original,
        srcset,
        full: original,
        download: original,
        width: img.width,
        height: img.height,
        color: img.color || '#14263f',
        alt: prettyName(img.file),
      };
    });
  }

  async function loadFromCloudinary() {
    const { cloudName, tag } = cfg.cloudinary || {};
    if (!cloudName || cloudName === 'TU_CLOUD_NAME') {
      throw new Error(
        'Cloudinary no está configurado: edita js/config.js y pon tu cloudName (ver README).'
      );
    }
    const base = `https://res.cloudinary.com/${cloudName}`;
    const [images, videos] = await Promise.all([
      listResources(base, tag, 'image'),
      listResources(base, tag, 'video'),
    ]);
    if (!images && !videos) {
      throw new Error(
        'No se pudo obtener la lista de fotos de Cloudinary. Comprueba que el cloudName y la ' +
        'etiqueta son correctos y que "Resource list" está permitido en los ajustes de seguridad (ver README).'
      );
    }
    return [...(images || []).map(mapImage), ...(videos || []).map(mapVideo)];

    function mapImage(r) {
      const id = `v${r.version}/${r.public_id}.${r.format}`;
      const t = (tr) => `${base}/image/upload/${tr}/${id}`;
      return {
        type: 'image',
        thumb: t('f_auto,q_auto,c_limit,w_800'),
        srcset: [400, 800, 1200]
          .map((w) => `${t(`f_auto,q_auto,c_limit,w_${w}`)} ${w}w`)
          .join(', '),
        full: t('f_auto,q_auto:best'),
        download: t('fl_attachment'),
        width: r.width,
        height: r.height,
        color: '#14263f',
        alt: prettyName(r.public_id.split('/').pop()),
      };
    }

    function mapVideo(r) {
      const id = `v${r.version}/${r.public_id}`;
      const poster = (tr) => `${base}/video/upload/${tr}/${id}.jpg`;
      const t = (tr) => `${base}/video/upload/${tr}/${id}.${r.format}`;
      return {
        type: 'video',
        thumb: poster('so_0,f_jpg,q_auto,c_limit,w_800'),
        srcset: [400, 800, 1200]
          .map((w) => `${poster(`so_0,f_jpg,q_auto,c_limit,w_${w}`)} ${w}w`)
          .join(', '),
        poster: poster('so_0,f_jpg,q_auto,c_limit,w_1200'),
        full: t('f_auto,q_auto'),
        download: t('fl_attachment'),
        width: r.width,
        height: r.height,
        color: '#14263f',
        alt: prettyName(r.public_id.split('/').pop()),
      };
    }
  }

  /* Devuelve la lista de recursos de un tipo (image/video) o null si falla
     (por ejemplo si no hay recursos de ese tipo con la etiqueta). */
  async function listResources(base, tag, resourceType) {
    try {
      const res = await fetch(`${base}/${resourceType}/list/${encodeURIComponent(tag)}.json`, { cache: 'no-cache' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.resources || [];
    } catch (_) {
      return null;
    }
  }

  function renderGallery(photos) {
    if (!photos.length) {
      throw new Error('Todavía no hay fotos en la galería.');
    }
    status.hidden = true;
    countEl.textContent = photos.length + (photos.length === 1 ? ' foto' : ' fotos');

    const revealer = makeRevealer();

    photos.forEach((photo, i) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'gallery-item';
      item.setAttribute('aria-label', (photo.type === 'video' ? 'Reproducir vídeo: ' : 'Ampliar foto: ') + photo.alt);
      if (photo.color) item.style.backgroundColor = photo.color;
      if (photo.width && photo.height) {
        item.style.aspectRatio = `${photo.width} / ${photo.height}`;
      }

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = photo.alt;
      if (photo.srcset) {
        img.srcset = photo.srcset;
        img.sizes = '(max-width: 640px) 100vw, (max-width: 1000px) 50vw, (max-width: 1320px) 33vw, 25vw';
      }
      img.src = photo.thumb;
      if (img.complete) img.classList.add('loaded');
      else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });

      let hint;
      if (photo.type === 'video') {
        hint = document.createElement('span');
        hint.className = 'play-badge';
        hint.setAttribute('aria-hidden', 'true');
        hint.innerHTML =
          '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="11" fill="rgba(6,13,31,0.55)"/><path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor"/></svg>';
      } else {
        hint = document.createElement('span');
        hint.className = 'zoom-hint';
        hint.setAttribute('aria-hidden', 'true');
        hint.innerHTML =
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
      }

      item.append(img, hint);
      item.addEventListener('click', () => window.Lightbox.open(photos, i));
      grid.appendChild(item);
      revealer(item);
    });
  }

  /* Anima la aparición de cada foto al entrar en pantalla */
  function makeRevealer() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      return (el) => el.classList.add('visible');
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '80px 0px' }
    );
    return (el) => io.observe(el);
  }

  function showError(err) {
    status.hidden = false;
    status.classList.add('error');
    status.textContent = err.message || 'No se pudieron cargar las fotos.';
  }

  function encodePath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  function prettyName(file) {
    return String(file)
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim() || 'Foto de la graduación';
  }
})();
