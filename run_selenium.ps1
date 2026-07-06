# PowerShell script to download Maven locally and run Selenium Java tests

$MavenVersion = "3.9.6"
$MavenDir = "$PSScriptRoot\.maven"
$MvnPath = "$MavenDir\apache-maven-$MavenVersion\bin\mvn.cmd"

if (-not (Test-Path $MvnPath)) {
    Write-Host "=== 1. Downloading Maven $MavenVersion ===" -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $MavenDir | Out-Null
    $Url = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
    $ZipPath = "$MavenDir\maven.zip"
    
    # Download using PowerShell
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $Url -OutFile $ZipPath
    
    Write-Host "=== 2. Extracting Maven ===" -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath $MavenDir -Force
    Remove-Item $ZipPath
}

Write-Host "=== 3. Starting local web server in background ===" -ForegroundColor Cyan
# Free port 8000 if occupied
$portProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Where-Object { $_ -ne 0 } | Select-Object -First 1
if ($portProcess) {
    Stop-Process -Id $portProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# Start the Express server in the background
Start-Process -FilePath "node" -ArgumentList "server.js" -NoNewWindow -RedirectStandardOutput "node_out.log" -RedirectStandardError "node_err.log"
Start-Sleep -Seconds 3 # Give server some time to start

Write-Host "=== 4. Running Selenium Java Tests ===" -ForegroundColor Green
$oldLocation = Get-Location
Set-Location "$PSScriptRoot\selenium-tests"

try {
    # Run Maven clean test
    & $MvnPath clean test
    $exitCode = $LASTEXITCODE
} finally {
    Set-Location $oldLocation
    
    Write-Host "=== 5. Cleaning up web server ===" -ForegroundColor Cyan
    $portProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Where-Object { $_ -ne 0 } | Select-Object -First 1
    if ($portProcess) {
        Stop-Process -Id $portProcess -Force -ErrorAction SilentlyContinue
    }
}

if ($exitCode -ne 0) {
    Write-Error "Selenium Java tests failed!"
    exit 1
} else {
    Write-Host "Selenium Java tests completed successfully!" -ForegroundColor Green
    exit 0
}
