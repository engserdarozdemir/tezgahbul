Add-Type -AssemblyName System.Drawing

$slabDir  = "C:\Users\Serdar\Desktop\TezgahCode\Plakalar\Porselen\Neolith\slab"
$thumbDir = "C:\Users\Serdar\Desktop\TezgahCode\Plakalar\Porselen\Neolith"
$size = 200

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)

$ok = 0; $fail = 0
Get-ChildItem $slabDir -Include "*.jpg","*.tif","*.jpeg" -Recurse | ForEach-Object {
  try {
    $src = [System.Drawing.Image]::FromFile($_.FullName)
    $w = $src.Width; $h = $src.Height

    # Merkez kare kırpma
    $cropSize = [Math]::Min($w, $h)
    $x = [int](($w - $cropSize) / 2)
    $y = [int](($h - $cropSize) / 2)
    $rect = [System.Drawing.Rectangle]::new($x, $y, $cropSize, $cropSize)
    $cropped = $src.Clone($rect, $src.PixelFormat)

    $thumb = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($thumb)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($cropped, 0, 0, $size, $size)
    $g.Dispose(); $cropped.Dispose(); $src.Dispose()

    $slug = $_.BaseName -replace "-slab$", ""
    $outPath = Join-Path $thumbDir ($slug + "-thumb.jpg")
    $thumb.Save($outPath, $jpegEncoder, $encoderParams)
    $thumb.Dispose()
    $ok++
    Write-Host "OK: $slug"
  } catch {
    $fail++
    Write-Host "FAIL: $($_.BaseName) - $_"
  }
}
Write-Host "Thumbnail: $ok OK, $fail FAIL"
