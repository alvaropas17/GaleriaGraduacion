/**
 * Configuración de la galería.
 *
 * Para que las dedicatorias y reacciones se compartan entre todos tus
 * amigos necesitas un proyecto gratuito de Supabase (https://supabase.com):
 *
 *   1. Crea una cuenta y un proyecto (plan Free, no pide tarjeta).
 *   2. En el editor SQL del proyecto, pega y ejecuta supabase/setup.sql.
 *   3. En Settings → API copia la "Project URL" y la clave "anon public"
 *      y pégalas aquí abajo.
 *
 * La clave anon es pública por diseño (va en el navegador de cada visita);
 * las políticas RLS de setup.sql limitan lo que se puede hacer con ella.
 *
 * Si dejas los campos vacíos, la web funciona igual pero las dedicatorias
 * y reacciones solo se guardan en el dispositivo de cada persona.
 */
window.GALERIA_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};
