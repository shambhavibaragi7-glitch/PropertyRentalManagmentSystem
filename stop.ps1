# PowerShell script to stop Node.js Express Web Application

Write-Host "Stopping services..." -ForegroundColor Cyan
$portProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Where-Object { $_ -ne 0 } | Select-Object -First 1
if ($portProcess) {
    Stop-Process -Id $portProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1
Write-Host "Node.js Web Application has been stopped." -ForegroundColor Green
