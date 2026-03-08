Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$slabDir  = "C:\Users\Serdar\Desktop\TezgahCode\Plakalar\Porselen\Neolith\slab"
$thumbDir = "C:\Users\Serdar\Desktop\TezgahCode\Plakalar\Porselen\Neolith"
$size = 200

$missing = @(
  "arena", "aspen-grey", "avorio", "barro", "basalt-black", "basalt-grey",
  "beton", "cement", "nero", "nero-zimbabwe-riverwashed", "phedra",
  "pietra-di-luna", "pietra-di-piombo", "pulpis-silk", "zaha-stone"
)

$ok = 0; $fail = 0
foreach ($slug in $missing) {
  # Try tif first, then jpg
  $slabPath = $null
  foreach ($ext in @("tif","jpg")) {
    $candidate = Join-Path $slabDir "$slug-slab.$ext"
    if (Test-Path $candidate) { $slabPath = $candidate; break }
  }
  if (-not $slabPath) { Write-Host "BULUNAMADI: $slug"; $fail++; continue }

  try {
    $uri = New-Object System.Uri($slabPath, [System.UriKind]::Absolute)
    $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
      $uri,
      [System.Windows.Media.Imaging.BitmapCreateOptions]::None,
      [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
    )
    $frame = $decoder.Frames[0]
    $w = $frame.PixelWidth; $h = $frame.PixelHeight

    # Kare kırpma: merkez
    $cropSize = [Math]::Min($w, $h)
    $x = [int](($w - $cropSize) / 2)
    $y = [int](($h - $cropSize) / 2)
    $cropped = New-Object System.Windows.Media.Imaging.CroppedBitmap($frame, [System.Windows.Int32Rect]::new($x, $y, $cropSize, $cropSize))

    $scaled = New-Object System.Windows.Media.Imaging.TransformedBitmap(
      $cropped,
      (New-Object System.Windows.Media.ScaleTransform(($size / $cropSize), ($size / $cropSize)))
    )

    $encoder = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
    $encoder.QualityLevel = 85
    $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($scaled))

    $outPath = Join-Path $thumbDir "$slug-thumb.jpg"
    $stream = New-Object System.IO.FileStream($outPath, [System.IO.FileMode]::Create)
    $encoder.Save($stream)
    $stream.Close()
    $ok++
    Write-Host "OK: $slug"
  } catch {
    $fail++
    Write-Host "FAIL: $slug - $_"
  }
}
Write-Host "WPF Thumbnail: $ok OK, $fail FAIL"
