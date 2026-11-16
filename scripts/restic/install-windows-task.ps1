# ==============================================================================
# HEUGLY & BLUDWORTH - Windows Scheduled Task Setup for Automated Daily Backup
# ==============================================================================

$taskName = "LegalPro-Restic-Daily-Backup"
$scriptPath = Resolve-Path "$PSScriptRoot\restic-backup.ps1"

Write-Host "Registering Scheduled Task '$taskName' to run daily at 02:00 AM UTC..." -ForegroundColor Cyan

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Automated Daily Restic Encrypted Backup for Heugly & Bludworth Legal Practice SaaS" -Force

Write-Host "✓ Scheduled Task '$taskName' registered successfully." -ForegroundColor Green
Get-ScheduledTask -TaskName $taskName
