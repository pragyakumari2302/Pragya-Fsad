<#
.SYNOPSIS
    CampusCore ERP — Stop All Services
    Kills all running backend, frontend, and cloudflare tunnel processes.
#>

Write-Host ""
Write-Host "[CampusCore] Stopping all services ..." -ForegroundColor Red

# Kill Java (Spring Boot backend)
Get-Process -Name "java" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Stopping Java (PID $($_.Id)) ..." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Kill cloudflared tunnel
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Stopping Cloudflared (PID $($_.Id)) ..." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Kill Node (Vite frontend)
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Stopping Node (PID $($_.Id)) ..." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Reset .env back to localhost
$EnvFile = Join-Path $PSScriptRoot "FSAD_PROJECT\.env"
$localEnv = @"
# Backend API URL — updated automatically by start-all.ps1 with Cloudflare tunnel URL
VITE_API_URL=http://localhost:9090/api
"@
Set-Content -Path $EnvFile -Value $localEnv -Encoding UTF8

# Clean up tunnel log
$tunnelLog = Join-Path $PSScriptRoot ".cloudflared-tunnel.log"
if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "[CampusCore] All services stopped. .env reset to localhost." -ForegroundColor Green
Write-Host ""
