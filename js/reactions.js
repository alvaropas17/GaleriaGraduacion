/**
 * Reacciones emoji por foto. Con Supabase configurado se comparten entre
 * todos; sin configurar, se guardan solo en este dispositivo (localStorage).
 */
import { hayNube, getCliente, leerLocal, guardarLocal } from "./db.js";

const EMOJIS = ["❤️", "😂", "🥹", "🎓"];
const CLAVE_LOCAL = "galeria-reacciones";

export async function initReacciones() {
  const barras = document.querySelectorAll(".reacciones[data-photo]");
  if (barras.length === 0) return;

  const conteos = await cargarConteos();

  for (const barra of barras) {
    const idFoto = barra.dataset.photo;
    for (const emoji of EMOJIS) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "reaccion";
      boton.setAttribute("aria-label", `Reaccionar con ${emoji}`);
      const cuantos = conteos[idFoto]?.[emoji] ?? 0;
      boton.innerHTML = `<span aria-hidden="true">${emoji}</span><span class="num">${cuantos || ""}</span>`;
      boton.addEventListener("click", () => reaccionar(boton, idFoto, emoji));
      barra.append(boton);
    }
  }
}

async function cargarConteos() {
  if (hayNube()) {
    try {
      const cliente = await getCliente();
      const { data, error } = await cliente.from("reactions").select("photo_id,emoji,count");
      if (error) throw error;
      const conteos = {};
      for (const fila of data) {
        (conteos[fila.photo_id] ??= {})[fila.emoji] = fila.count;
      }
      return conteos;
    } catch (err) {
      console.warn("Reacciones: no se pudo leer de Supabase, uso modo local.", err);
    }
  }
  return leerLocal(CLAVE_LOCAL, {});
}

async function reaccionar(boton, idFoto, emoji) {
  // respuesta inmediata en pantalla (optimista)
  const num = boton.querySelector(".num");
  num.textContent = String((parseInt(num.textContent, 10) || 0) + 1);
  boton.classList.remove("animada");
  void boton.offsetWidth; // reinicia la animación si se pulsa seguido
  boton.classList.add("animada");

  if (hayNube()) {
    try {
      const cliente = await getCliente();
      const { error } = await cliente.rpc("increment_reaction", {
        p_photo_id: idFoto,
        p_emoji: emoji
      });
      if (error) throw error;
      return;
    } catch (err) {
      console.warn("Reacciones: no se pudo guardar en Supabase, guardo en local.", err);
    }
  }
  const conteos = leerLocal(CLAVE_LOCAL, {});
  (conteos[idFoto] ??= {})[emoji] = (conteos[idFoto][emoji] ?? 0) + 1;
  guardarLocal(CLAVE_LOCAL, conteos);
}
