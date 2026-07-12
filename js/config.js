/*
 * ⚙️ CONFIGURACIÓN DE LA GALERÍA
 * Este es el ÚNICO archivo que necesitas editar para personalizar la web.
 */
window.GALLERY_CONFIG = {
  /*
   * Fuente de las imágenes:
   *   'local'      → fotos subidas a la carpeta images/ del repositorio
   *   'cloudinary' → fotos alojadas en tu cuenta de Cloudinary
   */
  source: "cloudinary",

  /* Textos de la portada */
  hero: {
    name: "Álvaro",
    degree: "Graduación",
    date: "2026",
    tagline: "Un día para recordar siempre",
  },

  /* Título de la pestaña del navegador */
  pageTitle: "Galería de Graduación",

  /* Solo necesario si source: 'cloudinary' (ver README) */
  cloudinary: {
    cloudName: "z1t7v4xi",
    tag: "graduacion", // etiqueta que agrupa las fotos de la galería
    uploadPreset: "graduacion_web", // preset unsigned para la página de subida
    // Clave que se pide en subir.html. ⚠️ Es solo disuasoria (visible en el
    // código): no publiques el enlace a subir.html si quieres ser el único en subir.
    uploadKey: "graduacion_daw",
  },
};
