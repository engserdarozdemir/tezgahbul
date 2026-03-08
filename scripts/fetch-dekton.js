/**
 * fetch-dekton.js
 * Cosentino Dekton modellerini çeker ve data/dekton-models.json'ı günceller.
 * Çalıştırma: node scripts/fetch-dekton.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '../data/dekton-models.json');
const BASE_URL = 'https://www.cosentino.com';
const LIST_URL = `${BASE_URL}/tr-tr/renkler/dekton/`;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getModelSlugs(html) {
  // href="/tr-tr/renkler/dekton/SLUG/" formatındaki linkleri çek
  const re = /href="\/tr-tr\/renkler\/dekton\/([a-z0-9-]+)\/"/gi;
  const slugs = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const slug = m[1];
    if (slug !== 'dekton' && slug.length > 1) slugs.add(slug);
  }
  return [...slugs];
}

async function parseModelPage(slug, html) {
  // Thumbnail kodu — assetstools URL'inden çek
  const codeMatch = html.match(/bynder\/color\/([A-Z0-9]{2,4})\/detalle/);
  const code = codeMatch?.[1] || '';

  // Model adı
  const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const name = nameMatch ? nameMatch[1].trim() : slug.charAt(0).toUpperCase() + slug.slice(1);

  // Yüzey tipi
  let finish = 'Mat';
  if (/parlak|polished|xgloss/i.test(html)) finish = 'Parlak';
  else if (/velvet/i.test(html)) finish = 'Velvet';
  else if (/suede/i.test(html)) finish = 'Suede';

  // Koleksiyon — data-collection veya breadcrumb
  let collection = '';
  const colMatch = html.match(/collection["\s:]+["']?([A-Za-z\s]+)["']?/i)
    || html.match(/Stonika|Silverkoast|Onirika|DK Natural|DK Xgloss|DK Industrial|DK Tech|Kraftizen|Pietra Edition|Pietra Kode|Nomak|Amazonik/i);
  if (colMatch) collection = colMatch[0].replace(/collection["\s:]+/i, '').replace(/['"]/g, '').trim();

  return { name, finish, code, collection, slug };
}

async function main() {
  console.log('Dekton model listesi çekiliyor...');
  let listHtml;
  try {
    listHtml = await get(LIST_URL);
  } catch (e) {
    console.error('Liste sayfası çekilemedi:', e.message);
    process.exit(1);
  }

  const slugs = await getModelSlugs(listHtml);
  console.log(`${slugs.length} model bulundu.`);

  const models = [];
  for (const slug of slugs) {
    try {
      await sleep(300); // Rate limiting
      const html = await get(`${BASE_URL}/tr-tr/renkler/dekton/${slug}/`);
      const model = await parseModelPage(slug, html);
      if (model.code) {
        models.push(model);
        process.stdout.write(`  ✓ ${model.name} (${model.code}) — ${model.finish}\n`);
      } else {
        process.stdout.write(`  ✗ ${slug} — kod bulunamadı\n`);
      }
    } catch (e) {
      console.error(`  ✗ ${slug}: ${e.message}`);
    }
  }

  const output = {
    updated: new Date().toISOString(),
    source: LIST_URL,
    models: models.sort((a, b) => a.collection.localeCompare(b.collection) || a.name.localeCompare(b.name))
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n✅ ${models.length} model kaydedildi → data/dekton-models.json`);
  console.log(`   Güncelleme: ${output.updated}`);
}

main().catch(console.error);
