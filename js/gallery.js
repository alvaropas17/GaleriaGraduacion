/**
 * Renderiza los capítulos y las polaroids a partir de data/photos.json
 * y del manifest de imágenes optimizadas (data/manifest.json).
 */

const SIZES = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 94vw";
const EXTENSIONES_VIDEO = new Set(["mp4", "webm", "mov"]);
const COLORES_CAPITULO = ["azul", "amarillo", "rosa", "verde", "azul"];
const NOMBRES_NAVEGACION = {
  "donde-empezo-todo": "El principio",
  "entre-clase-y-clase": "Entre clases",
  "los-viajes": "Viajes",
  "la-gran-noche": "Graduación"
};
const CATEGORIAS_INFO = {
  juego: { emoji: "🎲", etiqueta: "Juego" },
  playa: { emoji: "🏖️", etiqueta: "Playa" },
  atardecer: { emoji: "🌅", etiqueta: "Atardecer" }
};

function renderNavegacion(capitulos) {
  const navegacion = document.getElementById("navegacion-capitulos");
  navegacion.replaceChildren();
  capitulos.forEach((capitulo, indice) => {
    const enlace = document.createElement("a");
    enlace.href = `#${capitulo.id}`;
    enlace.className = "negativo negativo-" + COLORES_CAPITULO[indice % COLORES_CAPITULO.length];
    enlace.innerHTML = `<span class="negativo-foto" aria-hidden="true"></span><span>${NOMBRES_NAVEGACION[capitulo.id] ?? capitulo.titulo}</span>`;
    navegacion.append(enlace);
  });
}

function renderFichaAlbum(capitulo, manifest) {
  const ficha = document.getElementById("ficha-album");
  if (!capitulo) {
    ficha.hidden = true;
    return;
  }

  const fotos = capitulo.fotos.filter((foto) => !esVideo(foto));
  const videos = capitulo.fotos.length - fotos.length;
  ficha.hidden = false;
  ficha.innerHTML = `
    <div class="ficha-copy">
      <p class="ficha-etiqueta">Índice del álbum</p>
      <h2 class="ficha-titulo"></h2>
      <p class="ficha-texto"></p>
      <ul class="ficha-datos" aria-label="Contenido del álbum">
        <li><strong>${fotos.length}</strong> fotos</li>
        <li><strong>${videos}</strong> vídeos</li>
        <li>Un finde para el recuerdo</li>
      </ul>
      <div class="ficha-acciones">
        <a class="boton boton-principal" href="#${capitulo.id}">Ver los recuerdos</a>
        <a class="boton boton-secundario" href="#dedicatorias">Ir a dedicatorias</a>
      </div>
    </div>
    <div class="ficha-miniaturas" aria-label="Tres recuerdos del álbum"></div>
  `;
  ficha.querySelector(".ficha-titulo").textContent = capitulo.titulo;
  ficha.querySelector(".ficha-texto").textContent = capitulo.texto || "Un álbum para volver a este finde cuando queramos.";
  const miniaturas = ficha.querySelector(".ficha-miniaturas");
  fotos.slice(0, 3).forEach((foto, indice) => {
    const imagen = atributosImagen(foto.src, manifest);
    const img = document.createElement("img");
    img.src = imagen.src;
    img.alt = foto.caption || `Recuerdo ${indice + 1} de ${capitulo.titulo}`;
    img.loading = "lazy";
    miniaturas.append(img);
  });
}
export function idFoto(src) {
  return src
    .replace(/^photos\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

function atributosImagen(src, manifest) {
  const info = manifest[src];
  if (!info) {
    // sin optimizar (falta ejecutar npm run optimizar): usa el original
    return { src, srcset: "", grande: src, ancho: 1200, alto: 900, lqip: "" };
  }
  const variantes = info.variantes;
  const srcset = Object.entries(variantes)
    .map(([w, ruta]) => `${ruta} ${w}w`)
    .join(", ");
  const anchoGrande = Math.min(1600, info.width);
  return {
    src: variantes[800] ?? variantes[400],
    srcset,
    grande: variantes[1600] ?? variantes[800],
    ancho: anchoGrande,
    alto: Math.round((info.height * anchoGrande) / info.width),
    anchoReal: info.width,
    altoReal: info.height,
    lqip: info.lqip
  };
}

function esVideo(item) {
  const extension = item.src.split(".").pop()?.toLowerCase();
  return item.tipo === "video" || EXTENSIONES_VIDEO.has(extension);
}

export function renderGaleria(datos, manifest) {
  const contenedor = document.getElementById("galeria");
  const fotosPlanas = [];
  let indiceLightbox = 0;

  const capitulosVisibles = datos.capitulos.filter((capitulo) => capitulo.id === "los-nietos");
  renderNavegacion(capitulosVisibles);
  renderFichaAlbum(capitulosVisibles[0], manifest);

  capitulosVisibles.forEach((capitulo, indiceCapitulo) => {
    const seccion = document.createElement("section");
    const color = COLORES_CAPITULO[indiceCapitulo % COLORES_CAPITULO.length];
    seccion.className = `capitulo capitulo-${color}`;
    seccion.id = capitulo.id;

    const numero = String(indiceCapitulo + 1).padStart(2, "0");
    seccion.innerHTML = `
      <header class="capitulo-cabecera revelar">
        <p class="capitulo-numero">Capítulo ${numero}</p>
        <h2 class="capitulo-titulo"></h2>
        <p class="capitulo-texto"></p>
      </header>
      <div class="masonry"></div>
    `;
    seccion.querySelector(".capitulo-titulo").textContent = capitulo.titulo;
    const parrafo = seccion.querySelector(".capitulo-texto");
    if (capitulo.texto) parrafo.textContent = capitulo.texto;
    else parrafo.remove();

    const masonry = seccion.querySelector(".masonry");

    capitulo.fotos.forEach((foto, indiceFoto) => {
      const figura = document.createElement("figure");
      figura.className = "polaroid revelar";
      if (indiceFoto === 0 || (capitulo.fotos.length > 8 && indiceFoto === 7)) figura.classList.add("polaroid-destacada");
      if (foto.categorias?.length) figura.dataset.categorias = foto.categorias.join(" ");
      const indiceGlobal = fotosPlanas.length;
      const mediaIndex = fotosPlanas.length;

      const caption = foto.caption || `${capitulo.titulo} · Recuerdo ${String(indiceFoto + 1).padStart(2, "0")}`;
      const alt = caption;
      let indiceFotoLightbox;

      if (esVideo(foto)) {
        figura.classList.add("polaroid-video");
        figura.innerHTML = `
          <button class="video-enlace" type="button" data-video-src="${foto.src}" data-caption="${caption}" data-media-index="${mediaIndex}" aria-label="Reproducir vídeo">
            <video class="video-miniatura" src="${foto.src}" muted playsinline preload="metadata"></video>
            <span class="video-play" aria-hidden="true"></span>
          </button>
          <figcaption class="pie"></figcaption>
          <div class="reacciones" data-photo="${idFoto(foto.src)}"></div>
        `;
      } else {
        const img = atributosImagen(foto.src, manifest);
        figura.innerHTML = `
          <a class="foto-enlace" href="${img.grande}"
             data-pswp-width="${img.ancho}" data-pswp-height="${img.alto}" data-media-index="${mediaIndex}">
            <img src="${img.src}" ${img.srcset ? `srcset="${img.srcset}" sizes="${SIZES}"` : ""}
                 ${img.anchoReal ? `width="${img.anchoReal}" height="${img.altoReal}"` : ""}
                 loading="lazy" decoding="async" alt="">
          </a>
          <figcaption class="pie"></figcaption>
          <div class="reacciones" data-photo="${idFoto(foto.src)}"></div>
        `;

        const imagen = figura.querySelector("img");
        imagen.alt = alt;
        if (img.lqip) imagen.style.backgroundImage = `url(${img.lqip})`;

        // el lightbox lee el pie desde el enlace
        figura.querySelector("a").dataset.caption = caption;
        indiceFotoLightbox = indiceLightbox;
        indiceLightbox++;
      }

      const pie = figura.querySelector(".pie");
      pie.textContent = caption;
      if (foto.lugar) {
        const lugar = document.createElement("span");
        lugar.className = "lugar";
        lugar.textContent = `📍 ${foto.lugar}`;
        pie.append(lugar);
      }
      masonry.append(figura);
      fotosPlanas.push({
        ...foto,
        caption,
        tipo: esVideo(foto) ? "video" : "imagen",
        capitulo: capitulo.titulo,
        indiceLightbox: indiceFotoLightbox
      });
    });

    contenedor.append(seccion);
  });

  renderFiltros(capitulosVisibles[0]);

  return fotosPlanas;
}

function renderFiltros(capitulo) {
  const contenedor = document.getElementById("filtros-categoria");
  if (!capitulo) {
    contenedor.hidden = true;
    return;
  }

  const categoriasPresentes = new Set();
  capitulo.fotos.forEach((foto) => foto.categorias?.forEach((c) => categoriasPresentes.add(c)));
  if (categoriasPresentes.size === 0) {
    contenedor.hidden = true;
    return;
  }

  const aplicarFiltro = (categoria) => {
    contenedor.querySelectorAll(".filtro-chip").forEach((chip) => {
      chip.setAttribute("aria-pressed", String(chip.dataset.categoria === categoria));
    });
    document.querySelectorAll(`#${capitulo.id} .polaroid`).forEach((figura) => {
      const categorias = figura.dataset.categorias?.split(" ") ?? [];
      const visible = categoria === "todas" || categorias.includes(categoria);
      figura.classList.toggle("filtro-oculto", !visible);
      if (visible) figura.classList.add("visible");
    });
  };

  const chips = [{ id: "todas", emoji: "✨", etiqueta: "Todas" }];
  for (const id of Object.keys(CATEGORIAS_INFO)) {
    if (categoriasPresentes.has(id)) chips.push({ id, ...CATEGORIAS_INFO[id] });
  }

  contenedor.replaceChildren();
  chips.forEach(({ id, emoji, etiqueta }) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "filtro-chip";
    boton.dataset.categoria = id;
    boton.setAttribute("aria-pressed", String(id === "todas"));
    boton.innerHTML = `<span aria-hidden="true">${emoji}</span><span>${etiqueta}</span>`;
    boton.addEventListener("click", () => aplicarFiltro(id));
    contenedor.append(boton);
  });
}

export function renderHero(datos, manifest) {
  document.title = `${datos.titulo} 🎓`;
  document.getElementById("hero-titulo").textContent = datos.titulo;
  document.getElementById("hero-subtitulo").textContent = datos.subtitulo ?? "";
  const capituloPortada = datos.capitulos?.find((capitulo) => capitulo.id === "los-nietos") ?? datos.capitulos?.[0];
  document.getElementById("hero-pie").textContent = capituloPortada
    ? `${capituloPortada.titulo} · ${capituloPortada.texto || "Un álbum para volver cuando queramos."}`
    : "";
  if (datos.fechaGraduacion) {
    const fecha = new Date(`${datos.fechaGraduacion}T12:00:00`);
    const anio = document.getElementById("anio-promo");
    const promocion = String(fecha.getFullYear());
    if (anio) anio.textContent = promocion;
  }

  const heroImg = document.getElementById("hero-foto");
  const src = datos.hero?.src;
  if (!src) return;
  const img = atributosImagen(src, manifest);
  heroImg.classList.remove("is-cargada");
  heroImg.classList.add("is-cargando");
  const mostrarHero = () => {
    heroImg.classList.remove("is-cargando");
    heroImg.classList.add("is-cargada");
  };
  heroImg.addEventListener("load", mostrarHero, { once: true });
  heroImg.addEventListener("error", mostrarHero, { once: true });
  heroImg.decoding = "async";
  heroImg.src = img.grande;
  if (img.srcset) {
    heroImg.srcset = img.srcset;
    heroImg.sizes = "100vw";
  }
  if (img.lqip) heroImg.style.backgroundImage = `url(${img.lqip})`;
  heroImg.alt = datos.hero.alt ?? "";
  heroImg.setAttribute("fetchpriority", "high");
  if (heroImg.complete) mostrarHero();
}
