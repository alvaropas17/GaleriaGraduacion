/**
 * Detalles que hacen especial la experiencia: aparición suave al hacer
 * scroll, contador de días desde la graduación y "recuerdo aleatorio".
 */

export function initRevelado() {
  const elementos = document.querySelectorAll(".revelar");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elementos.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  elementos.forEach((el) => observador.observe(el));
}

export function initContador(fechaGraduacion) {
  const elemento = document.getElementById("contador");
  if (!fechaGraduacion) {
    elemento.remove();
    return;
  }
  const fecha = new Date(`${fechaGraduacion}T00:00:00`);
  const dias = Math.floor((Date.now() - fecha.getTime()) / 86400000);
  if (dias > 0) {
    elemento.textContent = `Hace ${dias} ${dias === 1 ? "día" : "días"} que nos graduamos 🎓`;
  } else if (dias === 0) {
    elemento.textContent = "¡Hoy es el gran día! 🎓";
  } else {
    const faltan = -dias;
    elemento.textContent = `${faltan} ${faltan === 1 ? "día" : "días"} para la graduación 🎓`;
  }
}

export function initRecuerdoAleatorio(totalFotos, abrirFoto) {
  const boton = document.getElementById("recuerdo-aleatorio");
  if (totalFotos === 0) {
    boton.remove();
    return;
  }
  boton.addEventListener("click", () => {
    abrirFoto(Math.floor(Math.random() * totalFotos));
  });
}
