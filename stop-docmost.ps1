# Останавливает контейнеры Docmost (данные сохраняются) и снимает удержание WSL.
$dir = (wsl.exe -d Ubuntu --exec wslpath -a ($PSScriptRoot -replace '\\','/')).Trim()
wsl.exe -d Ubuntu --cd $dir -- docker compose stop
Get-CimInstance Win32_Process -Filter "Name='wsl.exe'" |
    Where-Object { $_.CommandLine -match 'DOCMOST_KEEPALIVE' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
