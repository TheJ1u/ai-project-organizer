<#
.SYNOPSIS
  Registers the OmniAI-Claude-Sync task in Windows Task Scheduler.
.DESCRIPTION
  Schedules scripts/claude-sync-omniai.js to run daily at 7:15 AM.
  Discovers projects and populates Claude tasks in OmniAI Hub before the 7:30 AM morning briefing.
#>

param(
  [string]$DailyTime = "07:15AM",
  [string]$TaskName = "OmniAI-Claude-Sync"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$nodeScript = Join-Path $scriptDir "claude-sync-omniai.js"

$nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeExe) {
  Write-Error "Node.js was not found in your PATH. Please ensure Node is installed."
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "⚡ Registering OmniAI-Claude-Sync Windows Scheduled Task" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Task Name:       $TaskName"
Write-Host "Schedule:        Daily at $DailyTime"
Write-Host "Node Executable: $nodeExe"
Write-Host "Target Script:   $nodeScript"
Write-Host ""

$action = New-ScheduledTaskAction -Execute $nodeExe -Argument "`"$nodeScript`"" -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Daily -At $DailyTime
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Daily sync of Claude project workspaces and generated task backlog into OmniAI Hub" -Force | Out-Null
  Write-Host "✅ Scheduled Task '$TaskName' registered successfully!" -ForegroundColor Green
  Write-Host "👉 It will run automatically every morning at $DailyTime."
  Write-Host "👉 To trigger it manually: Start-ScheduledTask -TaskName '$TaskName'"
  Write-Host "👉 To uninstall anytime: .\scripts\uninstall-claude-sync-task.ps1"
} catch {
  Write-Warning "PowerShell Register-ScheduledTask encountered: $_"
  Write-Host "Falling back to schtasks.exe..."
  $cmd = "schtasks /Create /SC DAILY /TN `"$TaskName`" /TR `"`"$nodeExe`" `"$nodeScript`"`" /ST 07:15 /F"
  Invoke-Expression $cmd
  Write-Host "✅ Registered via schtasks.exe fallback!" -ForegroundColor Green
}
