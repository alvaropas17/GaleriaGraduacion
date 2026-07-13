# 🎓 Galería de graduación

Una galería de recuerdos hecha **por y para nosotros**: fotos en polaroid,
capítulos con anécdotas, mapa de los lugares, reacciones emoji y un muro de
dedicatorias. Todo estático, gratuito y pensado para verse perfecto en el
móvil.

## Cómo funciona

- **Sin frameworks**: HTML, CSS y JavaScript puros. Se sirve desde GitHub
  Pages (gratis).
- **Imágenes optimizadas**: en cada despliegue, un script genera versiones
  WebP de 400/800/1600 px y placeholders borrosos; cada dispositivo descarga
  solo el tamaño que necesita.
- **Librerías autoalojadas** (en `js/vendor/`, sin CDNs externos):
  [PhotoSwipe](https://photoswipe.com) para el lightbox táctil,
  [Leaflet](https://leafletjs.com) + OpenStreetMap para el mapa y
  [supabase-js](https://supabase.com) para dedicatorias/reacciones.

## Poner tus fotos

1. Borra las carpetas de ejemplo dentro de `photos/` y crea las tuyas.
   Cada carpeta es un **capítulo** y se ordenan por nombre:

   ```
   photos/
   ├── 01-el-primer-dia/
   │   ├── IMG_001.jpg
   │   └── IMG_002.jpg
   ├── 02-el-viaje/
   └── 03-la-graduacion/
   ```

2. Ejecuta `npm install` (solo la primera vez) y luego:

   ```bash
   npm run fotos        # actualiza data/photos.json con tus carpetas
   ```

3. Abre `data/photos.json` y personaliza: el título, la frase, la fecha, la
   foto de portada (`hero`), el texto de cada capítulo y el pie de cada foto
   (`caption`). Si añades `"lugar"` y `"coords": [latitud, longitud]` a una
   foto, aparecerá en el mapa de recuerdos. Para sacar coordenadas: clic
   derecho en Google Maps → copiar los dos números.

4. Para verla en local:

   ```bash
   npm run optimizar    # genera las imágenes optimizadas
   npm run servir       # ábrela en http://localhost:4173
   ```

## Publicarla gratis en GitHub Pages

1. Sube el repositorio a GitHub (rama `main`).
2. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
3. Con cada push a `main`, el workflow `.github/workflows/deploy.yml`
   optimiza las imágenes y publica la web.

La web lleva `noindex` y `robots.txt` para que los buscadores no la
indexen: solo la verá quien tenga el enlace.

> GitHub Pages admite webs de hasta ~1 GB. Con las imágenes optimizadas
> hay espacio de sobra para cientos de fotos.

## Dedicatorias y reacciones compartidas (opcional)

Sin configurar nada, las dedicatorias y reacciones se guardan solo en el
dispositivo de cada persona ("modo local"). Para que se compartan entre
todos:

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y un
   proyecto nuevo (el plan Free no pide tarjeta).
2. En el proyecto: **SQL Editor** → pega el contenido de
   `supabase/setup.sql` → **Run**.
3. En **Settings → API**, copia la *Project URL* y la clave *anon public*
   y pégalas en `js/config.js`.
4. Haz commit y push. Listo: todo el mundo ve las mismas dedicatorias y
   reacciones.

La clave `anon` es pública por diseño; las políticas de seguridad del SQL
solo permiten leer, añadir mensajes y sumar reacciones (nunca editar ni
borrar).

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run fotos` | Escanea `photos/` y actualiza `data/photos.json` |
| `npm run optimizar` | Genera las imágenes WebP responsive y el manifest |
| `npm run servir` | Sirve la web en local (puerto 4173) |
| `npm run placeholders` | Regenera las fotos de ejemplo |
