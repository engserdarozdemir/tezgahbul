#!/usr/bin/env node
const https = require('https');
const API_KEY = "AIzaSyBnhDgvpWC7Y2KWZevvOlzF_Aty2gWvaKo";

const cities = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin",
  "Aydın","Balıkesir","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa",
  "Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Edirne","Elazığ","Erzincan",
  "Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Isparta",
  "Mersin","İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli","Kırşehir",
  "Kocaeli","Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla",
  "Muş","Nevşehir","Niğde","Ordu","Rize","Sakarya","Samsun","Siirt",
  "Sinop","Sivas","Tekirdağ","Tokat","Trabzon","Tunceli","Şanlıurfa","Uşak",
  "Van","Yozgat","Zonguldak","Aksaray","Bayburt","Karaman","Kırıkkale","Batman",
  "Şırnak","Bartın","Ardahan","Iğdır","Yalova","Karabük","Kilis","Osmaniye","Düzce"
];

function textSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=tr`;
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function placeDetails(placeId) {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,website,types&key=${API_KEY}&language=tr`;
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// İlçe bilgisini adresten çıkar
function extractIlce(address, city) {
  const parts = address.split(',').map(s => s.trim());
  for (const p of parts) {
    if (p.includes('/')) {
      const sub = p.split('/')[0].trim();
      if (sub !== city) return sub;
    }
  }
  return 'Merkez';
}

async function main() {
  const results = {};

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const query = `mutfak tezgahı mermer granit ${city}`;

    try {
      const searchResult = await textSearch(query);
      const places = (searchResult.results || []).slice(0, 5);

      // Her il için en iyi 2 firmayı detaylı al
      const cityResults = [];
      for (let j = 0; j < Math.min(places.length, 2); j++) {
        const p = places[j];
        try {
          const detail = await placeDetails(p.place_id);
          const d = detail.result || {};
          cityResults.push({
            ad: d.name || p.name,
            adres: d.formatted_address || p.formatted_address,
            ilce: extractIlce(d.formatted_address || p.formatted_address, city),
            tel: d.formatted_phone_number || '',
            puan: d.rating || p.rating || null,
            yorum: d.user_ratings_total || 0,
            maps: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
            lat: p.geometry?.location?.lat || null,
            lng: p.geometry?.location?.lng || null,
            website: d.website || ''
          });
          await sleep(50);
        } catch(e) {
          cityResults.push({
            ad: p.name,
            adres: p.formatted_address,
            ilce: extractIlce(p.formatted_address, city),
            tel: '',
            puan: p.rating || null,
            yorum: p.user_ratings_total || 0,
            maps: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
            lat: p.geometry?.location?.lat || null,
            lng: p.geometry?.location?.lng || null,
            website: ''
          });
        }
      }

      results[city] = cityResults;
      process.stderr.write(`[${i+1}/${cities.length}] ${city}: ${cityResults.length} firma\n`);
    } catch(err) {
      process.stderr.write(`[${i+1}/${cities.length}] ${city}: HATA - ${err.message}\n`);
      results[city] = [];
    }

    if (i < cities.length - 1) await sleep(100);
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
