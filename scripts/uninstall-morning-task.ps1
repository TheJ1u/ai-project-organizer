param(
  [string]$TaskName = "OmniAI-MorningBriefing"
)

try {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
  Write-Host "✅ Scheduled Task '$TaskName' removed successfully." -ForegroundColor Green
} catch {
  Write-Warning "Task '$TaskName' not found or could not be removed."
}
