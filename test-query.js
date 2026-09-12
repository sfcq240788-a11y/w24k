const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase
    .from("piezas")
    .select(`
      id, 
      slug, 
      nombre, 
      descripcion, 
      precio, 
      peso_gramos, 
      metal_id,
      metales ( nombre ),
      piezas_piedras (
        cantidad,
        kilataje_piedra,
        piedras ( nombre ),
        cortes ( nombre )
      ),
      piezas_media ( url, orden )
    `)
    .eq("slug", 'anillo-solitario-aurora')
    .eq("estado_publicacion", "publicada")
    .single();
  console.log(JSON.stringify(data, null, 2));
}
test();
