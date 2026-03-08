Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$slabDir = "C:\Users\Serdar\Desktop\TezgahCode\Plakalar\Porselen\Neolith\slab"

$ok = 0; $fail = 0
Get-ChildItem $slabDir -Filter "*.tif" | ForEach-Object {
  $tifPath = $_.FullName
  $jpgPath = [System.IO.Path]::ChangeExtension($tifPath, "jpg")
  $slug = $_.BaseName

  try {
    $uri = New-Object System.Uri($tifPath, [System.UriKind]::Absolute)
    $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
      $uri,
      [System.Windows.Media.Imaging.BitmapCreateOptions]::None,
      [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
    )
    $frame = $decoder.Frames[0]

    $encoder = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
    $encoder.QualityLevel = 92
    $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($frame))

    $stream = New-Object System.IO.FileStream($jpgPath, [System.IO.FileMode]::Create)
    $encoder.Save($stream)
    $stream.Close()

    # TIF sil
    Remove-Item $tifPath -Force
    $ok++
    Write-Host "OK: $slug"
  } catch {
    $fail++
    Write-Host "FAIL: $slug - $_"
  }
}
Write-Host "Donusturuldu: $ok OK, $fail FAIL"
