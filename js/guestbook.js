/**
 * Muro de dedicatorias: notas adhesivas que dejan los amigos.
 * Con Supabase se comparten entre todos; sin él, modo local (localStorage).
 */
import { hayNube, getCliente, leerLocal, guardarLocal } from "./db.js";

const CLAVE_LOCAL = "galeria-dedicatorias";
const COLORES = ["--nota-1", "--nota-2", "--nota-3", "--nota-4"];
const ROTACIONES = [-2.2, 1.6, -1.1, 2.4, -1.7, 1.2];

export async function initDedicatorias() {
  const formulario = document.getElementById("dedicatoria-form");
  const muro = document.getElementById("notas");

  if (!hayNube()) {
    document.getElementById("aviso-local").hidden = false;
  }

  const mensajes = await cargarMensajes();
  for (const mensaje of mensajes) muro.append(crearNota(mensaje, muro.children.length));

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const campos = new FormData(formulario);
    const mensaje = {
      name: String(campos.get("nombre")).trim().slice(0, 40),
      text: String(campos.get("texto")).trim().slice(0, 500),
      created_at: new Date().toISOString()
    };
    if (!mensaje.name || !mensaje.text) return;

    const boton = formulario.querySelector("button");
    boton.disabled = true;
    try {
      await guardarMensaje(mensaje);
      muro.prepend(crearNota(mensaje, muro.children.length));
      formulario.reset();
    } catch (err) {
      console.error("No se pudo guardar la dedicatoria", err);
      alert("No se pudo guardar la dedicatoria. Inténtalo otra vez 🙏");
    } finally {
      boton.disabled = false;
    }
  });
}

async function cargarMensajes() {
  if (hayNube()) {
    try {
      const cliente = await getCliente();
      const { data, error } = await cliente
        .from("messages")
        .select("name,text,created_at")
        .order("created_at", { ascending: false })
        .limit(150);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Dedicatorias: no se pudo leer de Supabase, uso modo local.", err);
      document.getElementById("aviso-local").hidden = false;
    }
  }
  return leerLocal(CLAVE_LOCAL, []);
}

async function guardarMensaje(mensaje) {
  if (hayNube()) {
    const cliente = await getCliente();
    const { error } = await cliente
      .from("messages")
      .insert({ name: mensaje.name, text: mensaje.text });
    if (error) throw error;
    return;
  }
  const mensajes = leerLocal(CLAVE_LOCAL, []);
  mensajes.unshift(mensaje);
  guardarLocal(CLAVE_LOCAL, mensajes.slice(0, 150));
}

function crearNota(mensaje, indice) {
  const nota = document.createElement("article");
  nota.className = "nota";
  if (indice % 3 === 2) nota.classList.add("nota-cinta", `washi-${(indice % 2) + 1}`);
  nota.style.setProperty("--nota-color", `var(${COLORES[indice % COLORES.length]})`);
  nota.style.setProperty("--rot", `${ROTACIONES[indice % ROTACIONES.length]}deg`);

  const texto = document.createElement("p");
  texto.className = "nota-texto";
  texto.textContent = mensaje.text;

  const firma = document.createElement("p");
  firma.className = "nota-firma";
  firma.textContent = `— ${mensaje.name} `;

  if (mensaje.created_at) {
    const fecha = document.createElement("span");
    fecha.className = "nota-fecha";
    fecha.textContent = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short"
    }).format(new Date(mensaje.created_at));
    firma.append(fecha);
  }

  nota.append(texto, firma);
  return nota;
}
