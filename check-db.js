const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const env = fs.readFileSync(envPath, 'utf-8');
const url = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)/m)[1].trim();
const roleKey = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const supabase = createClient(url, roleKey);

async function check() {
  const { count: filas, error: e1 } = await supabase.from('piezas_media').select('*', { count: 'exact', head: true }).not('ruta_1200', 'is', null);
  async function countFiles(path = '') {
    const { data, error } = await supabase.storage.from('piezas').list(path, { limit: 1000 });
    if (error || !data) return 0;
    
    let count = 0;
    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue;
      if (item.id === null) {
        // It's a folder
        count += await countFiles(path ? `${path}/${item.name}` : item.name);
      } else {
        count++;
      }
    }
    return count;
  }
  
  const archivos = await countFiles();
  console.log(`filas=${filas || 0}, archivos=${archivos}`);
}
check();
