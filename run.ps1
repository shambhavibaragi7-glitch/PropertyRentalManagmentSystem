# PowerShell script to run the Node.js Express Web Application

Write-Host "=== 1. Installing Node.js dependencies ===" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install npm dependencies! Please check that Node.js is installed."
    exit 1
}

# Stop any running instances to free ports
Write-Host "=== 2. Stopping existing instances on port 8000 ===" -ForegroundColor Cyan
$portProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Where-Object { $_ -ne 0 } | Select-Object -First 1
if ($portProcess) {
    Stop-Process -Id $portProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

Write-Host "=== 3. Launching Node.js Express Web Application ===" -ForegroundColor Cyan
cmd.exe /c "start /b node server.js > node_out.log 2> node_err.log"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  RentArena Zero Brokerage Rental System is running!" -ForegroundColor Green
Write-Host "  Web application URL: http://localhost:8000" -ForegroundColor Yellow
Write-Host "  To stop the application, run: ./stop.ps1" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
