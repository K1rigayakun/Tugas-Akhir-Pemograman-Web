# Concurrent Load Test Script for Windows
# Run: powershell -ExecutionPolicy Bypass -File test-concurrent-load.ps1

param(
    [int]$RequestCount = 20,
    [string]$Endpoint = "http://localhost:3001/api/v1/auctions"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Concurrent Load Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Requests: $RequestCount" -ForegroundColor Gray
Write-Host "  Endpoint: $Endpoint" -ForegroundColor Gray
Write-Host ""

# Start timer
$startTime = Get-Date

Write-Host "🚀 Starting $RequestCount concurrent requests..." -ForegroundColor Yellow
Write-Host ""

# Create concurrent jobs
$jobs = 1..$RequestCount | ForEach-Object {
    $jobNum = $_
    Start-Job -ScriptBlock {
        param($url, $num)
        try {
            $start = Get-Date
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
            $duration = ((Get-Date) - $start).TotalMilliseconds
            
            return @{
                JobNum = $num
                StatusCode = $response.StatusCode
                Duration = $duration
                Success = $true
            }
        } catch {
            $duration = ((Get-Date) - $start).TotalMilliseconds
            return @{
                JobNum = $num
                StatusCode = $_.Exception.Response.StatusCode.value__
                Duration = $duration
                Success = $false
                Error = $_.Exception.Message
            }
        }
    } -ArgumentList $Endpoint, $jobNum
}

# Wait for all jobs to complete
Write-Host "⏳ Waiting for all requests to complete..." -ForegroundColor Yellow
$jobs | Wait-Job | Out-Null

# Collect results
$results = $jobs | Receive-Job

# Calculate statistics
$totalDuration = ((Get-Date) - $startTime).TotalSeconds
$successCount = ($results | Where-Object { $_.Success -eq $true }).Count
$failCount = $RequestCount - $successCount
$status200 = ($results | Where-Object { $_.StatusCode -eq 200 }).Count
$status500 = ($results | Where-Object { $_.StatusCode -ge 500 }).Count
$avgDuration = ($results | Measure-Object -Property Duration -Average).Average
$maxDuration = ($results | Measure-Object -Property Duration -Maximum).Maximum
$minDuration = ($results | Measure-Object -Property Duration -Minimum).Minimum

# Cleanup jobs
$jobs | Remove-Job

# Display results
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Requests:  $RequestCount" -ForegroundColor White
Write-Host "Successful:      $successCount" -ForegroundColor Green
Write-Host "Failed:          $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Status Codes:" -ForegroundColor Yellow
Write-Host "  200 OK:        $status200" -ForegroundColor $(if ($status200 -eq $RequestCount) { "Green" } else { "Yellow" })
Write-Host "  5xx Errors:    $status500" -ForegroundColor $(if ($status500 -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Timing:" -ForegroundColor Yellow
Write-Host "  Total Time:    $([math]::Round($totalDuration, 2))s" -ForegroundColor Gray
Write-Host "  Avg Response:  $([math]::Round($avgDuration, 0))ms" -ForegroundColor Gray
Write-Host "  Min Response:  $([math]::Round($minDuration, 0))ms" -ForegroundColor Gray
Write-Host "  Max Response:  $([math]::Round($maxDuration, 0))ms" -ForegroundColor Gray
Write-Host ""

# Pass/Fail assessment
$successRate = ($successCount / $RequestCount) * 100
Write-Host "Success Rate:    $([math]::Round($successRate, 1))%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } else { "Red" })
Write-Host ""

if ($successRate -ge 90 -and $status500 -eq 0 -and $totalDuration -lt 10) {
    Write-Host "✅ TEST PASSED" -ForegroundColor Green
    Write-Host "   - Success rate > 90%" -ForegroundColor Green
    Write-Host "   - No 500 errors" -ForegroundColor Green
    Write-Host "   - Completed in < 10 seconds" -ForegroundColor Green
} else {
    Write-Host "❌ TEST FAILED" -ForegroundColor Red
    if ($successRate -lt 90) {
        Write-Host "   - Success rate < 90%" -ForegroundColor Red
    }
    if ($status500 -gt 0) {
        Write-Host "   - Connection pool errors detected" -ForegroundColor Red
    }
    if ($totalDuration -ge 10) {
        Write-Host "   - Took too long (>= 10 seconds)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
