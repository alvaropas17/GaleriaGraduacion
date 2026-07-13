/**
 * Acceso a Supabase (opcional). Si js/config.js no tiene credenciales,
 * la web funciona en "modo local" y cada módulo usa localStorage.
 * La librería solo se descarga si de verdad hay configuración.
 */
const config = window.GALERIA_CONFIG ?? {};

export function hayNube() {
  return Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
}

let clientePromesa = null;

export function getCliente() {
  if (!hayNube()) return Promise.resolve(null);
  clientePromesa ??= cargarScript("js/vendor/supabase.js").then(() =>
    window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
  );
  return clientePromesa;
}

export function cargarScript(src) {
  return new Promise((resolver, rechazar) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolver;
    script.onerror = () => rechazar(new Error(`No se pudo cargar ${src}`));
    document.head.append(script);
  });
}

export function leerLocal(clave, porDefecto) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardarLocal(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* almacenamiento lleno o bloqueado: no pasa nada */
  }
}
