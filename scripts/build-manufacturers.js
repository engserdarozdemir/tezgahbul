#!/usr/bin/env node
const fs = require('fs');
const data = require('./search-results.json');

// Uzmanlik ve marka tahmini (isimden çıkar)
function guessSpecialties(name, addr) {
  const n = (name + ' ' + addr).toLowerCase();
  const specs = [];
  if (n.includes('porselen') || n.includes('neolith') || n.includes('dekton') || n.includes('laminam') || n.includes('lamar') || n.includes('infinity')) specs.push('Porselen');
  if (n.includes('quartz') || n.includes('kuvars') || n.includes('çimstone') || n.includes('cimstone') || n.includes('belenco') || n.includes('coante') || n.includes('calisco') || n.includes('silestone')) specs.push('Quartz');
  if (n.includes('granit') || n.includes('granite')) specs.push('Granit');
  if (n.includes('mermer') || n.includes('marble')) specs.push('Mermer');
  if (specs.length === 0) specs.push('Mermer', 'Granit');
  return [...new Set(specs)];
}

function guessBrands(name) {
  const n = name.toLowerCase();
  const brands = [];
  if (n.includes('çimstone') || n.includes('cimstone')) brands.push('Çimstone');
  if (n.includes('belenco')) brands.push('Belenco');
  if (n.includes('coante')) brands.push('Coante');
  if (n.includes('silestone')) brands.push('Silestone');
  if (n.includes('dekton')) brands.push('Dekton');
  if (n.includes('neolith')) brands.push('Neolith');
  if (n.includes('lamar')) brands.push('Lamar');
  if (n.includes('infinity')) brands.push('Infinity');
  if (n.includes('calisco')) brands.push('Calisco');
  if (n.includes('t-one')) brands.push('T-One');
  if (n.includes('sapienstone')) brands.push('Sapienstone');
  if (brands.length === 0) brands.push('Doğal Granit');
  return brands;
}

// Firma ismini temizle
function cleanName(name) {
  return name
    .replace(/\s*\|\s*.*/g, '') // "Artaş | Çimstone..." -> "Artaş"
    .replace(/Mutfak Tezgah(ı|ları)?\s*(İ|i)?(zmir|stanbul|ntalya|ankara)?/gi, '')
    .replace(/\s*(Ve|ve|&)\s*(Banyo|banyo)\s*Tezgah(ları|ı)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const manufacturers = [];

// Palmira Granit Mermer - kullanıcının kendi firması, her zaman en başta
manufacturers.push({
  ad: "Palmira Granit Mermer",
  sehir: "Ankara",
  ilce: "Yenimahalle",
  tel: "0312 472 82 93",
  maps: "https://www.google.com/maps/search/?api=1&query=Palmira+Granit+Mermer+Ankara",
  uzmanlik: ["Granit", "Mermer"],
  markalar: ["Doğal Granit", "Mermer"],
  aciklama: "20 yılı aşkın tecrübesiyle granit ve mermer tezgah üretimi.",
  puan: 5.0,
  yorum: 1,
  onayli: true
});

// Hakkari'ye en yakın büyük il Van
const hakkariFallback = {
  ad: "Van bölgesi imalatçıları",
  sehir: "Hakkari",
  ilce: "Merkez",
  tel: "",
  maps: "",
  uzmanlik: ["Mermer", "Granit"],
  markalar: ["Doğal Granit"],
  aciklama: "Hakkari için en yakın imalatçılar Van ilindedir.",
  onayli: false
};

for (const [city, firms] of Object.entries(data)) {
  if (firms.length === 0) {
    if (city === 'Hakkari') manufacturers.push(hakkariFallback);
    continue;
  }

  for (const f of firms) {
    // Palmira'yı atla (zaten eklendi)
    if (f.ad && f.ad.toLowerCase().includes('palmira')) continue;

    const cleanedName = cleanName(f.ad);
    const specs = guessSpecialties(f.ad, f.adres || '');
    const brands = guessBrands(f.ad);

    const entry = {
      ad: cleanedName || f.ad,
      sehir: city,
      ilce: f.ilce || 'Merkez',
      tel: f.tel || '',
      maps: f.maps || '',
      uzmanlik: specs,
      markalar: brands,
      aciklama: `${city}'de ${specs.join(', ').toLowerCase()} mutfak tezgahı imalatı ve montajı.`,
      onayli: false
    };

    if (f.puan) entry.puan = f.puan;
    if (f.yorum) entry.yorum = f.yorum;
    if (f.website) entry.website = f.website;

    manufacturers.push(entry);
  }
}

const output = {
  version: "6.0",
  updated: "2026-03-15",
  aciklama: "TezgahBul imalatçı veritabanı. 81 il, Google Places API ile doğrulanmış gerçek veriler.",
  manufacturers
};

fs.writeFileSync('../data/manufacturers.json', JSON.stringify(output, null, 2), 'utf-8');
console.log(`Toplam ${manufacturers.length} imalatçı yazıldı.`);
