# Database Backup Script for Windows
# Run: powershell -ExecutionPolicy Bypass -File backup-database.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Database Backup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create backups directory if not exists
$backupDir = "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "✅ Created backups directory" -ForegroundColor Green
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir/emerald_kingdom_backup_$timestamp.sql"

Write-Host "📦 Starting database backup..." -ForegroundColor Yellow
Write-Host "   Target: $backupFile" -ForegroundColor Gray
Write-Host ""

# Get DATABASE_URL from .env file
$envFile = "..\..\..\.env"
if (Test-Path $envFile) {
    $databaseUrl = Get-Content $envFile | Where-Object { $_ -match "^DATABASE_URL=" } | ForEach-Object { $_ -replace "DATABASE_URL=", "" } | ForEach-Object { $_.Trim('"') }
    
    if ($databaseUrl) {
        Write-Host "✅ Found DATABASE_URL in .env" -ForegroundColor Green
        
        # Execute pg_dump
        try {
            $env:PGPASSWORD = "" # Will use connection string
            & pg_dump $databaseUrl > $backupFile 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                $fileSize = (Get-Item $backupFile).Length / 1MB
                Write-Host ""
                Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
                Write-Host "   File: $backupFile" -ForegroundColor Gray
                Write-Host "   Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
                Write-Host ""
                Write-Host "📝 To restore this backup, run:" -ForegroundColor Yellow
                Write-Host "   psql `$DATABASE_URL < $backupFile" -ForegroundColor Gray
            } else {
                Write-Host ""
                Write-Host "❌ Backup failed!" -ForegroundColor Red
                Write-Host "   Error code: $LASTEXITCODE" -ForegroundColor Red
                exit 1
            }
        } catch {
            Write-Host ""
            Write-Host "❌ Error during backup: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ DATABASE_URL not found in .env file" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ .env file not found at: $envFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Backup Process Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
