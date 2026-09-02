# دانلود یک‌باره دیتای openfootball/football.json (فصول ۲۰۲۰ تا ۲۰۲۶)
# اجرا: powershell -ExecutionPolicy Bypass -File scripts\download-football.ps1  (فقط یک‌بار — با VPN)
$ErrorActionPreference = "Stop"

$leagues = @(
  @{ slug = "premier-league"; file = "en.1.json" },
  @{ slug = "bundesliga";     file = "de.1.json" },
  @{ slug = "la-liga";        file = "es.1.json" },
  @{ slug = "serie-a";        file = "it.1.json" },
  @{ slug = "ligue-1";        file = "fr.1.json" },
  @{ slug = "eredivisie";     file = "nl.1.json" },
  @{ slug = "primeira-liga";  file = "pt.1.json" },
  @{ slug = "super-lig";      file = "tr.1.json" }
)
$seasons = @("2020-21","2021-22","2022-23","2023-24","2024-25","2025-26","2026-27")

$out = Join-Path $PSScriptRoot "..\src\lib\football\data"
$base = "https://raw.githubusercontent.com/openfootball/football.json/master"

$ok = 0; $fail = 0
foreach ($lg in $leagues) {
  foreach ($s in $seasons) {
    $url = "$base/$s/$($lg.file)"
    $dest = Join-Path $out "$s\$($lg.file)"
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
      $dir = Split-Path $dest -Parent
      if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
      [System.IO.File]::WriteAllText($dest, $r.Content, (New-Object System.Text.UTF8Encoding($false)))
      Write-Output "OK  $s/$($lg.file)  ($([math]::Round($r.Content.Length/1024)) KB)"
      $ok++
    } catch {
      Write-Output "ERR $s/$($lg.file)  $($_.Exception.Message)"
      $fail++
    }
  }
}
Write-Output ""
Write-Output "Done: $ok ok, $fail fail -> $out"
