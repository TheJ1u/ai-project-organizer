<#
.SYNOPSIS
  Installs the OmniAI Hub Morning Grounded Intelligence script as a daily Windows Scheduled Task.
.DESCRIPTION
  Schedules scripts/morning-briefing.js to run every day at 7:30 AM.
  Gathers real git commits, checks active AI sessions, and pushes the briefing to your phone.
#>

param(
  [string]$DailyTime = "07:30AM",
  [string]$TaskName = "OmniAI-MorningBriefing"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$nodeScript = Join-Path $scriptDir "morning-briefing.js"

$nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeExe) {
  Write-Error "Node.js was not found in your PATH. Please ensure Node is installed."
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "⚡ Installing OmniAI Hub Morning Scheduled Task" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Task Name:     $TaskName"
Write-Host "Run Time:      $DailyTime daily"
Write-Host "Node Executable: $nodeExe"
Write-Host "Script:        $nodeScript"
Write-Host ""

$action = New-ScheduledTaskAction -Execute $nodeExe -Argument "`"$nodeScript`"" -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Daily -At $DailyTime
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

try {
  # Register the task for current user
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Daily morning AI mission telemetry scan and phone notification for OmniAI Hub" -Force | Out-Null
  Write-Host "✅ Scheduled Task '$TaskName' installed successfully!" -ForegroundColor Green
  Write-Host "👉 It will run every morning at $DailyTime."
  Write-Host "👉 To run it manually right now: Start-ScheduledTask -TaskName '$TaskName'"
  Write-Host "👉 To uninstall anytime: .\scripts\uninstall-morning-task.ps1"
} catch {
  Write-Warning "Could not register scheduled task: $_"
  Write-Host "Alternative fallback using schtasks.exe:"
  $cmd = "schtasks /Create /SC DAILY /TN `"$TaskName`" /TR `"`"$nodeExe`" `"$nodeScript`"`" /ST 07:30 /F"
  Invoke-Expression $cmd
}
