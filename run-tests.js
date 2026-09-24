const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const env = fs.readFileSync(envPath, 'utf-8');
const url = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)/m)[1].trim();
const roleKey = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const supabase = createClient(url, roleKey);

async function check() {
  const { count: filas } = await supabase.from('piezas_media').select('*', { count: 'exact', head: true }).not('ruta_1200', 'is', null);
  async function countFiles(p = '') {
    const { data, error } = await supabase.storage.from('piezas').list(p, { limit: 1000 });
    if (error || !data) return 0;
    
    let c = 0;
    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue;
      if (item.id === null) {
        c += await countFiles(p ? `${p}/${item.name}` : item.name);
      } else {
        c++;
      }
    }
    return c;
  }
  const archivos = await countFiles();
  return `filas=${filas || 0}, archivos=${archivos}`;
}

(async () => {
  const browser = await chromium.launch();

  const pieceUrl = 'http://localhost:3000/admin/piezas/89e51b9b-1e4d-42b8-8e76-25abfbc0d5e2';

  const filesToTest = [
    'orient6-ok.jpg'
  ];

  for (const filename of filesToTest) {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'sfcq240788@gmail.com');
    await page.fill('input[name="password"]', 'TestAdminPassword123!');
    await Promise.all([
      page.waitForNavigation(),
      page.click('button:has-text("Entrar")')
    ]);

    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    await page.goto(pieceUrl);
    


    const filePath = path.join(__dirname, 'pruebas', filename);
    await page.setInputFiles('input[type="file"]', filePath);
    
    await page.click('form.bg-white button[type="submit"]');

    try {
      const msgLoc = page.locator('div[role="alert"].bg-red-50, div[role="status"].bg-green-50').first();
      await msgLoc.waitFor({ state: 'visible', timeout: 15000 });
      await page.screenshot({ path: `screenshot-${filename}.png` });
      const html = await msgLoc.evaluate(el => el.outerHTML);
      const msg = await msgLoc.textContent();
      
      const inv = await check();
      console.log(`Archivo: ${filename}\nMensaje: ${msg?.trim().replace(/\s+/g, ' ')}\nHTML: ${html}\nInvariante: ${inv}\n---`);
      
    } catch (e) {
      const html = await page.content();
      fs.writeFileSync(`error-dom-${filename}.html`, html);
      console.log(`Archivo: ${filename}\nError en test: timeout. Se guardó DOM en error-dom-${filename}.html\n---`);
    }
    await page.close();
  }

  await browser.close();
})();
