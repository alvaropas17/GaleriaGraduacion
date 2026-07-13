/**
 * Renderiza los capítulos y las polaroids a partir de data/photos.json
 * y del manifest de imágenes optimizadas (data/manifest.json).
 */

const ROTACIONES = [-2.4, 1.6, -1.2, 2.6, -1.9, 1.1, 2.2, -2.8];
const SIZES = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 94vw";

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

export function renderGaleria(datos, manifest) {
  const contenedor = document.getElementById("galeria");
  const fotosPlanas = [];

  datos.capitulos.forEach((capitulo, indiceCapitulo) => {
    const seccion = document.createElement("section");
    seccion.className = "capitulo";
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
      const img = atributosImagen(foto.src, manifest);
      const figura = document.createElement("figure");
      figura.className = "polaroid revelar";
      const indiceGlobal = fotosPlanas.length;
      figura.style.setProperty("--rot", `${ROTACIONES[indiceGlobal % ROTACIONES.length]}deg`);
      figura.style.setProperty("--rot-cinta", `${indiceGlobal % 2 ? 4 : -3}deg`);

      const alt = foto.caption || `Foto ${indiceFoto + 1} del capítulo ${capitulo.titulo}`;
      figura.innerHTML = `
        <a class="foto-enlace" href="${img.grande}"
           data-pswp-width="${img.ancho}" data-pswp-height="${img.alto}">
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

      const pie = figura.querySelector(".pie");
      pie.textContent = foto.caption ?? "";
      if (foto.lugar) {
        const lugar = document.createElement("span");
        lugar.className = "lugar";
        lugar.textContent = `📍 ${foto.lugar}`;
        pie.append(lugar);
      }
      // el lightbox lee el pie desde el enlace
      figura.querySelector("a").dataset.caption = foto.caption ?? "";

      masonry.append(figura);
      fotosPlanas.push({ ...foto, capitulo: capitulo.titulo });
    });

    contenedor.append(seccion);
  });

  return fotosPlanas;
}

export function renderHero(datos, manifest) {
  document.title = `${datos.titulo} 🎓`;
  document.getElementById("hero-titulo").textContent = datos.titulo;
  document.getElementById("hero-subtitulo").textContent = datos.subtitulo ?? "";
  document.getElementById("hero-frase").textContent = datos.frase ?? "";

  if (datos.fechaGraduacion) {
    const fecha = new Date(`${datos.fechaGraduacion}T12:00:00`);
    document.getElementById("hero-fecha").textContent = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(fecha);
    const anio = document.getElementById("anio-promo");
    if (anio) anio.textContent = String(fecha.getFullYear());
  }

  const heroImg = document.getElementById("hero-foto");
  const src = datos.hero?.src;
  if (!src) return;
  const img = atributosImagen(src, manifest);
  heroImg.src = img.grande;
  if (img.srcset) {
    heroImg.srcset = img.srcset;
    heroImg.sizes = "100vw";
  }
  if (img.lqip) heroImg.style.backgroundImage = `url(${img.lqip})`;
  heroImg.alt = datos.hero.alt ?? "";
  heroImg.setAttribute("fetchpriority", "high");
}
