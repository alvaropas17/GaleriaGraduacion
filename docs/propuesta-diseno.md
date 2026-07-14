# Propuesta · La mesa de recuerdos

## 1. Idea y objetivo

La galería deja de ser una colección lineal de fotos de graduación y pasa a ser un lugar privado para que la pandilla vuelva a encontrarse con sus momentos. La metáfora es **una mesa de recuerdos**: una superficie continua de papel y lino donde las fotos, tickets, notas y mapas se van depositando mientras se hace scroll.

No es un libro digital. Un libro obliga a pasar páginas; aquí el scroll conecta escenas, permite que los objetos se solapen de verdad y hace que una historia pueda abrirse desde cualquier recuerdo. La artesanía queda en el papel, los marcos y las imperfecciones; la interfaz se mantiene contemporánea con tipografía limpia, espacio generoso y movimiento puntual.

El trabajo de la portada es invitar a explorar. El de una historia, dar contexto emocional a un evento. El del archivo, recuperar una foto concreta sin tener que recordar dónde estaba.

## 2. Arquitectura y navegación

| Ruta | Modo | Qué resuelve |
| --- | --- | --- |
| `/` | Explorar | Entrar por un objeto y descubrir historias. |
| `/historia/{id}` | Historias | Recorrer un evento como una secuencia de escenas. |
| `/archivo` | Archivo | Buscar todas las fotos por filtros combinables. |

Una barra discreta y persistente contiene el nombre del grupo, los tres modos y el botón **“Llévame a un recuerdo”**. En móvil la barra conserva el acceso al modo actual y abre los otros en un panel simple; no se convierte en un carrusel. El botón reutiliza `initRecuerdoAleatorio`: en Archivo abre una foto al azar; en una historia puede llevar a una escena o a una historia distinta.

La web aprovecha rutas ligeras, History API o enlaces HTML normales; no hace falta una SPA. Las View Transitions son una mejora progresiva para mantener visualmente el objeto que se abre, nunca un requisito de navegación.

## 3. Explorar: la mesa

En escritorio la portada es una mesa amplia: tres o cuatro polaroids, un ticket, una nota y una pequeña tarjeta de mapa descansan en posiciones asimétricas. Cada objeto es un enlace inequívoco a una historia, con un nombre y una pista al recibir foco o hover. El riesgo visual intencional es que la composición no sigue una cuadrícula: conserva el gesto físico de dejar cosas sobre una mesa, pero las zonas táctiles siguen siendo rectangulares, grandes y accesibles.

En móvil no se miniaturiza esa mesa. Se recompone como una pila de objetos con una foto dominante arriba y objetos secundarios alternando a izquierda y derecha. Al avanzar, los objetos entran en la superficie; no flotan por decoración.

Capacidades web-nativas: capas reales con `z-index`, enlaces directos a cada historia, estados hover/focus y una composición distinta por media query. No hay imitación de páginas ni física ornamental.

## 4. Historia ejemplo: Los Nietos

Los Nietos tiene 27 fotos y 2 vídeos en el material actual: es suficiente para demostrar una historia rica sin inventar contenido. La propuesta no obliga a mostrarlo todo; Archivo conserva el conjunto completo.

1. **Apertura:** fotografía a sangre con “Los Nietos”, fin de semana y el lugar. Un toque abre la foto a tamaño completo.
2. **Llegada:** collage de tres fotos y una frase corta. En escritorio se cruzan; en móvil se ordenan con un leve solape.
3. **La nota:** una nota de papel revela “¿Estamos en Hawái o en Los Nietos?” al pulsar/arrastrar su pestaña. También tiene un botón visible “Leer nota”.
4. **El momento en movimiento:** vídeo de la cucaracha con controles nativos, póster y transcripción plegable. Nunca inicia solo.
5. **Foto protagonista:** la imagen de vóley ocupa una escena entera, seguida de dos fotos de apoyo en tira de película.
6. **Cierre:** fecha, una cita breve y un enlace a la siguiente historia, por ejemplo “La gran noche”.

El scroll es la línea narrativa: cada escena ocupa el espacio que necesita. Las revelaciones aparecen al entrar en viewport, sin fijar el scroll ni hacer scroll-jacking.

## 5. Composición por pantalla

| Componente | Móvil | Tablet | Escritorio |
| --- | --- | --- | --- |
| Navegación | Marca + modo + menú | Tres modos visibles | Tres modos centrados, CTA a la derecha |
| Mesa Explorar | Pila vertical y orden de lectura | Dos zonas, objeto principal dominante | Objetos dispersos y superpuestos |
| Apertura historia | Foto vertical, título debajo | Foto + ficha lateral | Full-bleed, ficha flotante |
| Collage | Una foto ancla + dos debajo | Rejilla irregular | Capas con espacio negativo |
| Archivo | Dos columnas, filtros en panel | Tres columnas, filtros horizontales | Cuatro columnas, filtros persistentes |
| Nota y ticket | Botón y lámina completa | Caja lateral | Objeto sobre la escena |

La regla es recomponer, no escalar: se conserva contenido, jerarquía y control táctil en todas las dimensiones.

## 6. Componentes reutilizables

| Componente | Propósito y datos | Layout e interacción |
| --- | --- | --- |
| `MemoryHero` | `titulo`, `fecha`, `lugar`, `portada` | Full-bleed/columna; abre imagen. |
| `ScatteredPhotos` | `fotos[]`, `caption` | Capas en desktop, pila en móvil; cada foto es enlace. |
| `PhotoStack` | `fotos[]` | Grupo compacto; tap avanza con controles alternativos. |
| `HiddenNote` | `texto`, `color`, `autor?` | Pestaña arrastrable y botón “Leer nota”. |
| `FullBleedPhoto` | `src`, `alt`, `caption` | Escena completa; tap abre lightbox. |
| `FilmStrip` | `fotos[]` | Tira desplazable manual, sin avance automático. |
| `VoiceMessage` | `audio`, `transcripcion`, `duracion` | Reproductor nativo y transcripción. |
| `MapMoment` | `lugar`, `coords`, `texto` | Mapa estático/interactivo; enlace a la escena. |
| `TicketMemory` | `titulo`, `fecha`, `detalle` | Ticket como enlace, no adorno. |
| `QuoteScene` | `cita`, `autor?`, `foto?` | Pausa tipográfica entre imágenes. |
| `VideoMoment` | `src`, `poster`, `transcripcion` | Vídeo nativo con controles y texto alternativo. |
| `MemoryTimeline` | `eventos[]` | Índice de historias por fecha. |
| `RandomMemory` | `fotos[]`, `abrirFoto` | Reutiliza el aleatorio actual. |
| `MemoryEnding` | `siguiente`, `resumen` | Cierre y enlace claro a la siguiente historia. |

## 7. Interacciones y accesibilidad

- Tap/clic amplía fotos; las zonas pulsables no dependen de la rotación visual.
- Una polaroid puede arrastrarse para descubrir una nota, pero la misma acción existe como botón y funciona con teclado.
- Long-press muestra metadatos en táctil; también hay acción visible “Ver detalles”.
- Scroll-reveal únicamente orienta la atención; no bloquea ni modifica el desplazamiento del usuario.
- Audio y vídeo usan elementos HTML nativos, sin autoplay, con transcripción y subtítulos cuando existan.
- `prefers-reduced-motion: reduce` elimina entradas, rotaciones transitorias y View Transitions; el contenido queda igualmente completo.
- Foco visible, orden de tabulación lógico, contraste de texto y `alt` específico por imagen son requisitos de salida.

## 8. Sistema visual

Se conservan las familias actuales: **Fraunces** para títulos de historia, **Nunito** para lectura y controles, **Caveat** sólo para anotaciones humanas. Escala propuesta: `12 / 14 / 16 / 20 / 28 / 40 / 56 / 72px`, con `clamp()` en los cuatro últimos niveles.

| Token | Valor | Uso |
| --- | --- | --- |
| `--papel` | `#f3eddf` | Superficie continua |
| `--papel-suave` | `#eadfc9` | Zonas separadas |
| `--tinta` | `#223447` | Texto principal |
| `--azul` | `#3a7bd5` | Acción y orientación |
| `--mostaza` | `#e8b84b` | Pistas y fechas |
| `--sello` | `#c25b4e` | Detalles puntuales |

Las rotaciones son una escala limitada de `-3°, -1°, 0°, 1°, 3°`; jamás se acumulan arbitrariamente. Sombras: baja `0 3px 10px rgba(59,47,35,.14)`, media (token actual `--sombra`) y elevada (token actual `--sombra-alta`). Marcos: polaroid blanco con pie ancho, foto con borde fino de papel, ticket con borde perforado. No se aplican filtros vintage falsos: el papel, el marco y la luz del layout hacen el trabajo.

Modo oscuro reutiliza los tokens oscuros ya presentes: papel profundo, tinta clara y fotografías sin teñir. La textura se reduce para proteger la legibilidad.

## 9. Wireframes incluidos

`docs/mockups/index.html` es un prototipo autocontenido. Muestra Explorar, Historia, Archivo y navegación/azar en versiones de escritorio y móvil. Tiene un control claro/oscuro, una previsualización responsive real y pequeños estados interactivos para la nota, filtros y el recuerdo aleatorio. Las fotos son bloques de dirección artística: no incorpora ni duplica imágenes reales.

## 10. Datos, stack y despliegue

### Evolución retrocompatible de datos

Se puede mantener `capitulos` mientras se introduce `eventos`; el lector nuevo prefiere `eventos ?? capitulos`. El escáner `scripts/scan-photos.mjs` continúa generando fotos básicas y los metadatos narrativos se completan opcionalmente:

```json
{
  "eventos": [{
    "id": "los-nietos",
    "titulo": "Los Nietos",
    "fecha": "2026-06-28",
    "lugar": "Los Nietos",
    "portada": "photos/LosNietos/los-nietos-finde-01.jpg",
    "escenas": [
      { "tipo": "hero", "foto": "photos/LosNietos/los-nietos-finde-01.jpg" },
      { "tipo": "video", "foto": "photos/LosNietos/VID-20260628-WA0016.mp4" }
    ],
    "fotos": [{ "src": "…", "fecha": "2026-06-28", "personas": ["Eduardo"], "tipoRecuerdo": "foto" }]
  }]
}
```

`fecha`, `personas[]` y `tipoRecuerdo` son opcionales. Las rutas, captions, `tipo`, `tema`, `lugar` y coordenadas actuales siguen siendo válidas.

### Recomendación técnica

Quedarse en HTML/CSS/JS estático es la opción apropiada ahora: no añade build, conserva el pipeline de imágenes y los módulos actuales, y cabe directamente en GitHub Pages. Astro sólo merece la pena cuando haya muchas historias, plantillas repetidas y contenido editado con frecuencia; puede generar las mismas páginas estáticas sin sacrificar el despliegue gratuito.

El workflow actual puede seguir publicando la carpeta del repositorio en GitHub Pages. Como alternativas gratuitas, Cloudflare Pages y Netlify publican el mismo sitio estático; si se adopta Astro, el comando de build produciría `dist/` para cualquiera de las tres. Conviene revisar límites y condiciones vigentes antes de elegir proveedor.

## Hoja de ruta cuando se apruebe

1. **F1 — datos y Archivo:** esquema opcional, lector compatible y filtros.
2. **F2 — Historias:** rutas y `MemoryHero`, `FullBleedPhoto`, `ScatteredPhotos`.
3. **F3 — Explorar:** mesa responsive, navegación y acceso aleatorio.
4. **F4 — momentos ricos:** notas, tickets, audio, mapa y pulido de transiciones.

## Límites de esta fase

Esta propuesta evita un libro literal, carruseles globales, estética infantil o romántica y animación automática. No modifica `index.html`, `css/`, `js/` ni `data/`; sólo documenta el diseño y presenta un mockup aislado.
