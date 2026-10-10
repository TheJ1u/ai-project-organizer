$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$worker = Join-Path $PSScriptRoot 'codex-sync-omniai.js'
$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source
if (-not (Test-Path -LiteralPath $worker)) { throw "Worker missing: $worker" }
$action = New-ScheduledTaskAction -Execute $nodeExe -Argument "`"$worker`"" -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Daily -At '7:00AM'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 20)
# Interactive runs without saved credentials; Jordan must be signed in.
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'OmniAI-Codex-Sync' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Sync Codex tasks to OmniAI Hub' -Force
Get-ScheduledTaskInfo -TaskName 'OmniAI-Codex-Sync'
