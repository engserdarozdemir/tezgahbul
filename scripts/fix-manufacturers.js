const fs = require('fs');
const d = JSON.parse(fs.readFileSync('data/manufacturers.json', 'utf-8'));

// 1. Adıyaman'dan Artaş'ı kaldır (Ankara firması)
d.manufacturers = d.manufacturers.filter(m => {
  if (m.sehir === 'Adıyaman' && m.ad.includes('Artaş')) return false;
  return true;
});

// 2. Ankara - kötü ismi düzelt
const ankaraFirma = d.manufacturers.find(m => m.sehir === 'Ankara' && m.ad.includes('Yapan'));
if (ankaraFirma) {
  ankaraFirma.ad = 'Ankara Mermerciler';
  ankaraFirma.aciklama = "Ankara Yenimahalle'de mutfak tezgahı üretimi ve montajı.";
}

// 3. Ordu Hisar Mermer Mobilya ekle
const hasHisar = d.manufacturers.find(m => m.ad.includes('Hisar'));
if (!hasHisar) {
  const orduIdx = d.manufacturers.findIndex(m => m.sehir === 'Ordu');
  if (orduIdx >= 0) {
    d.manufacturers.splice(orduIdx + 2, 0, {
      ad: 'Ordu Hisar Mermer Mobilya',
      sehir: 'Ordu',
      ilce: 'Altınordu',
      tel: '',
      maps: 'https://maps.app.goo.gl/W9rQV2H2VWuwv74m8',
      uzmanlik: ['Mermer', 'Granit'],
      markalar: ['Doğal Granit', 'Mermer'],
      aciklama: "Eskipazar'da mermer tedarik ve mutfak tezgahı hizmeti. 24 saat açık.",
      puan: 5.0,
      yorum: 4,
      onayli: false
    });
  }
}

// 4. İlçe bilgilerini düzelt
d.manufacturers.forEach(m => {
  if (m.ilce) {
    m.ilce = m.ilce.replace(/^\d{5}\s*/, '').replace(/\/$/, '').trim();
    if (m.ilce === '') m.ilce = 'Merkez';
  }
});

// 5. Firma isimlerini temizle
d.manufacturers.forEach(m => {
  if (m.ad.includes('|')) m.ad = m.ad.split('|')[0].trim();
  if (m.ad.length > 60) {
    const parts = m.ad.split(/[-,]/);
    if (parts[0].trim().length > 5) m.ad = parts[0].trim();
  }
});

d.version = '6.1';
fs.writeFileSync('data/manufacturers.json', JSON.stringify(d, null, 2), 'utf-8');

const cities = new Set(d.manufacturers.map(m => m.sehir));
console.log('Toplam:', d.manufacturers.length);
console.log('Şehir:', cities.size);
console.log('Palmira:', d.manufacturers[0].ad, '- onayli:', d.manufacturers[0].onayli);
const ordu = d.manufacturers.filter(m => m.sehir === 'Ordu');
console.log('Ordu:', ordu.map(o => o.ad).join(', '));
const adiy = d.manufacturers.filter(m => m.sehir === 'Adıyaman');
console.log('Adıyaman:', adiy.map(a => a.ad).join(', '));
