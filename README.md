# 🎓 Galería de Graduación

Web estática con una galería de fotos para la graduación: portada animada, grid responsive con carga perezosa, visor a pantalla completa con zoom y descarga de originales. Tema azul marino + dorado.

**Funciones para quien la visita:**

- ♥ **Favoritos** — marca tus fotos preferidas con el corazón; se guardan en tu propio navegador (no requiere cuenta ni servidor) y puedes filtrar para ver solo esas.
- ▶ **Pase de diapositivas** — reproduce todas las fotos en automático con barra de progreso (tecla espacio para pausar/reanudar).
- 🔗 **Compartir** — comparte una foto con el menú nativo del móvil o copiando el enlace.
- ⬇ **Descargar** el original a máxima calidad, ↑ **volver arriba** y avisos discretos al interactuar.

**Lo importante:** para añadir fotos **no hace falta tocar el código**. Hay dos modos, y eliges cuál usar con una sola línea en `js/config.js`.

## Puesta en marcha (GitHub Pages)

1. En GitHub: **Settings → Pages → Source: "Deploy from a branch"**, elige la rama y la carpeta `/ (root)`. Guarda.
2. En un par de minutos la web estará en `https://<tu-usuario>.github.io/GaleriaGraduacion/`.
3. Personaliza los textos de la portada (nombre, fecha, frase) editando `js/config.js`.

> Las fotos de muestra (`images/muestra-*.jpg`) son solo para ver la web funcionando: bórralas cuando subas las tuyas (la automatización limpiará sus miniaturas sola).

## Modo 1 — Fotos en el repositorio (activado por defecto)

Tus fotos viven en la carpeta `images/` de este repositorio: control total, sin servicios externos.

**Para añadir fotos:**

1. En GitHub, entra en la carpeta `images/` → **Add file → Upload files**.
2. Arrastra tus fotos (JPG, PNG, WebP…) y confirma el commit.
3. Automáticamente, una GitHub Action genera miniaturas WebP optimizadas (400/800/1200 px) y actualiza el índice `images/manifest.json`. La web se redespliega sola.

La galería usa las miniaturas ligeras en el grid y **el archivo original a máxima calidad** en el visor y en el botón de descarga.

Para borrar una foto, elimina el archivo de `images/` desde GitHub; la Action limpia sus miniaturas.

> ⚠️ GitHub recomienda repos de menos de ~1 GB y rechaza archivos de más de 100 MB. Para cientos de fotos en calidad original, el modo Cloudinary escala mejor.

## Modo 2 — Cloudinary

Las fotos viven en tu cuenta gratuita de [Cloudinary](https://cloudinary.com) (25 GB), que las sirve optimizadas automáticamente. Incluye una página de subida desde el navegador (`subir.html`).

**Configuración (una sola vez):**

1. Crea una cuenta gratuita en Cloudinary y copia tu **Cloud name** (aparece en el Dashboard).
2. En **Settings → Upload → Upload presets → Add upload preset**: modo **Unsigned**, y en *Media analysis and AI / Tags* (o en el campo "Tags") pon `graduacion`. Guarda y copia el nombre del preset.
3. En **Settings → Security**, marca la casilla **Resource list** como permitida (por defecto está restringida; la galería la necesita para listar las fotos).
4. Edita `js/config.js`:
   ```js
   source: 'cloudinary',
   cloudinary: {
     cloudName: 'tu-cloud-name',
     tag: 'graduacion',
     uploadPreset: 'nombre-de-tu-preset',
     uploadKey: 'una-clave-que-solo-sepas-tu',
   },
   ```

**Para añadir fotos:** abre `https://<tu-web>/subir.html`, introduce tu clave y sube las fotos. Aparecen en la galería al instante (recarga la página).

> ⚠️ Sobre la clave: está en el código de la web, así que es solo **disuasoria**. La protección real es no compartir el enlace a `subir.html` (no está enlazado desde la galería) — y aunque alguien lo encontrara, solo podría subir fotos, nunca borrar ni modificar las tuyas. Puedes borrar fotos desde el panel de Cloudinary (Media Library).

## Desarrollo local

```bash
npm install          # solo la primera vez (instala sharp)
npm run manifest     # regenera miniaturas + manifest de images/
npm run serve        # sirve la web en http://localhost:8000
```

## Estructura

```
index.html                    Portada + galería
subir.html                    Página de subida (modo Cloudinary, no enlazada)
css/styles.css                Tema y responsive
js/config.js                  ⚙️ ÚNICO archivo a editar para personalizar
js/app-utils.js               Favoritos (localStorage) + avisos (toasts)
js/gallery.js                 Carga y pinta el grid, filtro y barra de herramientas
js/lightbox.js                Visor: zoom, gestos, favorito, compartir, slideshow
images/                       Originales (modo repositorio)
images/thumbs/ + manifest     Generados automáticamente — no editar a mano
scripts/generate-manifest.mjs Generador de miniaturas (sharp)
.github/workflows/            Action que automatiza las miniaturas
```
