# Start All Emerald Kingdom Services
Write-Host "🚀 Starting Emerald Kingdom Services..." -ForegroundColor Cyan

# Start Backend API (Port 3001)
Write-Host "`n📡 Starting Backend API on port 3001..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd apps/api; npm run dev"

Start-Sleep -Seconds 3

# Start Frontend Web (Port 3000)
Write-Host "`n🌐 Starting Frontend Web on port 3000..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd apps/web; npm run dev"

Start-Sleep -Seconds 3

# Start Admin Dashboard (Port 3002)
Write-Host "`n👨‍💼 Starting Admin Dashboard on port 3002..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd apps/admin; npm run dev"

Write-Host "`n✅ All services are starting..." -ForegroundColor Green
Write-Host "`nPlease wait 10-15 seconds for all services to be ready.`n" -ForegroundColor Cyan

Write-Host "URLs:" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  • Admin:    http://localhost:3002" -ForegroundColor Green
Write-Host "  • API:      http://localhost:3001/api/v1/health" -ForegroundColor Green
Write-Host "  • API Docs: http://localhost:3001/api/docs`n" -ForegroundColor Green
