$slabDir = "C:\Users\Serdar\Desktop\TezgahCode\Plakalar\Porselen\Neolith\slab"
$base = "https://www.porselentezgah.com/uploads/file"

$models = @(
  @{slug="abu-dhabi-white";        url="$base/abu-dhabi-white-adw-01.jpg"},
  @{slug="alexandra";              url="$base/alexandra.jpg"},
  @{slug="arabesque";              url="$base/arabesque.jpg"},
  @{slug="amazonico";              url="$base/amazonico.jpg"},
  @{slug="arena";                  url="$base/2018/arena.tif"},
  @{slug="avorio";                 url="$base/Avorio.tif"},
  @{slug="aspen-grey";             url="$base/2018/aspen_grey.tif"},
  @{slug="barro";                  url="$base/BARRO.tif"},
  @{slug="basalt-grey";            url="$base/BASALT_GREY.tif"},
  @{slug="basalt-black";           url="$base/BASALT_BLACK.tif"},
  @{slug="beton";                  url="$base/2018/beton.tif"},
  @{slug="calatorao";              url="$base/2018/calatorao.tif"},
  @{slug="calacatta-c01";          url="$base/calacatta-c01.tif"},
  @{slug="calacatta-c01r";         url="$base/calacatta-c01r.tif"},
  @{slug="calacatta-gold-cg01";    url="$base/2018/calacatta_gold_cg01.tif"},
  @{slug="calacatta-gold-cg01r";   url="$base/2018/calacatta_gold_cg01r.tif"},
  @{slug="calacatta-luxe-cl01";    url="$base/calacatta-cl01-2.jpg"},
  @{slug="calacatta-luxe-cl01r";   url="$base/7a20edd3-104d-44ea-8a88-6c0b4e6d7610.jpeg"},
  @{slug="calacatta-royale";       url="$base/calacatta-royale.jpg"},
  @{slug="calista";                url="$base/calista.jpg"},
  @{slug="cement";                 url="$base/CEMENT.tif"},
  @{slug="colorado-dunes";         url="$base/colorado-dunes.jpg"},
  @{slug="estatuario-e01";         url="$base/2018/estatuario_e01.tif"},
  @{slug="estatuario-e01r";        url="$base/estatuario-e01r.tif"},
  @{slug="himalaya-crystal";       url="$base/himalaya-crystal-hc-01.jpg"},
  @{slug="iron-frost";             url="$base/iron_frost.tif"},
  @{slug="iron-grey";              url="$base/IRON_GREY.tif"},
  @{slug="iron-copper";            url="$base/IRON_COPPER.tif"},
  @{slug="iron-corten";            url="$base/IRON_CORTEN.tif"},
  @{slug="just-white";             url="$base/just-white-test.jpg"},
  @{slug="krater";                 url="$base/2018/krater.tif"},
  @{slug="la-boheme-b01";          url="$base/boheme_b01.tif"},
  @{slug="layla";                  url="$base/layla.jpg"},
  @{slug="mar-del-plata";          url="$base/2018/mar_del_plata.tif"},
  @{slug="metropolitan";           url="$base/metropolitan-mt-01.jpg"},
  @{slug="mont-blanc";             url="$base/2018/mont_blanc.tif"},
  @{slug="nero";                   url="$base/Nero.tif"},
  @{slug="nero-zimbabwe-riverwashed"; url="$base/2018/nero_zimbabwe.tif"},
  @{slug="new-york-new-york";      url="$base/2018/new_york_new_york.tif"},
  @{slug="niagara";                url="$base/2018/niagara.jpg"},
  @{slug="pietra-di-luna";         url="$base/2018/pietra_di_luna.tif"},
  @{slug="pietra-di-osso";         url="$base/pietra-di-osso.tif"},
  @{slug="pietra-di-piombo";       url="$base/2018/pietra_di_piombo.tif"},
  @{slug="phedra";                 url="$base/2018/phedra.tif"},
  @{slug="pulpis-silk";            url="$base/2018/pulpis.tif"},
  @{slug="retrostone";             url="$base/2018/retrostone.tif"},
  @{slug="summer-dala";            url="$base/summerdala.jpg"},
  @{slug="strata-argentum-riverwashed"; url="$base/strata_argentum.tif"},
  @{slug="shilin";                 url="$base/shilin-sh-01.jpg"},
  @{slug="san-simone";             url="$base/san-simone.jpg"},
  @{slug="sofia-cuprum";           url="$base/2018/SOFIA_CUPRUM.tif"},
  @{slug="winter-dala";            url="$base/winterdala.jpg"},
  @{slug="whitehaven";             url="$base/whitehaven.jpg"},
  @{slug="wulong";                 url="$base/wulong-wl-01.jpg"},
  @{slug="zaha-stone";             url="$base/2018/zaha_stone.tif"}
)

$ok = 0; $fail = 0
foreach ($m in $models) {
  $ext = if ($m.url -match "\.tif$") { "tif" } elseif ($m.url -match "\.jpeg$") { "jpg" } else { "jpg" }
  $out = Join-Path $slabDir "$($m.slug)-slab.$ext"
  try {
    Invoke-WebRequest -Uri $m.url -OutFile $out -UseBasicParsing -TimeoutSec 60
    $ok++
    Write-Host "OK: $($m.slug)"
  } catch {
    $fail++
    Write-Host "FAIL: $($m.slug) - $_"
  }
}
Write-Host "Tamamlandi: $ok OK, $fail FAIL"
