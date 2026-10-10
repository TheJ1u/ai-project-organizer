<#
.SYNOPSIS
  Uninstalls the OmniAI-Claude-Sync task from Windows Task Scheduler.
#>

$TaskName = "OmniAI-Claude-Sync"

try {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
  Write-Host "✅ Scheduled Task '$TaskName' has been removed." -ForegroundColor Green
} catch {
  schtasks /Delete /TN "$TaskName" /F
  Write-Host "✅ Removed '$TaskName' via schtasks." -ForegroundColor Green
}
