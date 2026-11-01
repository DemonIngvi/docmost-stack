# Запускает Docmost и держит WSL активным: без этого WSL гасит ВМ при простое и порт 3100 пропадает.
param([switch]$NoBrowser)

$distro = 'Ubuntu'
$dir = (wsl.exe -d $distro --exec wslpath -a ($PSScriptRoot -replace '\\','/')).Trim()
$url = 'http://localhost:3100'

$alive = Get-CimInstance Win32_Process -Filter "Name='wsl.exe'" |
    Where-Object { $_.CommandLine -match 'DOCMOST_KEEPALIVE' }
if (-not $alive) {
    Start-Process wsl.exe -WindowStyle Hidden -ArgumentList "-d $distro --exec /usr/bin/env DOCMOST_KEEPALIVE=1 sleep infinity"
}

wsl.exe -d $distro --cd $dir -- docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Error 'docker compose up завершился с ошибкой'; exit 1 }

$deadline = (Get-Date).AddSeconds(90)
while ((Get-Date) -lt $deadline) {
    try {
        $code = (Invoke-WebRequest -UseBasicParsing "$url/api/health" -TimeoutSec 3).StatusCode
        if ($code -eq 200) {
            Write-Output "Docmost готов: $url"
            if (-not $NoBrowser) { Start-Process $url }
            exit 0
        }
    } catch { Start-Sleep -Seconds 2 }
}
Write-Error "Docmost не ответил за 90 секунд. Логи: wsl -d $distro --cd $dir -- docker compose logs docmost"
exit 1
