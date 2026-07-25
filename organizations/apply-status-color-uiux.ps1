param(
  [Parameter(Position=0)]
  [string]$ProjectPath
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$CssName = 'job-status-color-uiux.css'
$JsName = 'job-status-color-uiux.js'
$CssTag = '<link rel="stylesheet" href="./assets/job-status-color-uiux.css" data-status-color-uiux="css">'
$JsTag = '<script src="./assets/job-status-color-uiux.js" data-status-color-uiux="js"></script>'

function Resolve-ProjectRoot {
  param([string]$Requested)

  $Candidates = New-Object System.Collections.Generic.List[string]
  if ($Requested) { $Candidates.Add((Resolve-Path $Requested).Path) }
  $Candidates.Add((Get-Location).Path)
  $Candidates.Add((Join-Path (Get-Location).Path 'organizations'))
  $Candidates.Add($Here)
  $Candidates.Add((Join-Path $Here 'organizations'))
  $Candidates.Add((Join-Path (Split-Path -Parent $Here) 'organizations'))

  foreach ($Candidate in $Candidates) {
    if ($Candidate -and (Test-Path (Join-Path $Candidate 'index.html'))) {
      return (Resolve-Path $Candidate).Path
    }
  }

  throw "Could not find the organizations folder. Put this update beside it or pass its full path."
}

function Write-Utf8NoBom {
  param([string]$Path, [string]$Content)
  $Utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $Utf8)
}

$Root = Resolve-ProjectRoot $ProjectPath
$TargetAssets = Join-Path $Root 'assets'
New-Item -ItemType Directory -Path $TargetAssets -Force | Out-Null

foreach ($Name in @($CssName, $JsName)) {
  $Source = Join-Path (Join-Path $Here 'assets') $Name
  $Target = Join-Path $TargetAssets $Name
  if (-not (Test-Path $Source)) { throw "Missing update asset: $Source" }

  $SourceFull = [System.IO.Path]::GetFullPath($Source)
  $TargetFull = [System.IO.Path]::GetFullPath($Target)
  if ($SourceFull -ne $TargetFull) {
    if (Test-Path $Target) {
      $Backup = Join-Path $Root 'status-uiux-backup'
      New-Item -ItemType Directory -Path $Backup -Force | Out-Null
      $Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
      $Base = [System.IO.Path]::GetFileNameWithoutExtension($Name)
      $Ext = [System.IO.Path]::GetExtension($Name)
      Copy-Item $Target (Join-Path $Backup "$Base-$Stamp$Ext") -Force
    }
    Copy-Item $Source $Target -Force
  }
}

$HtmlFiles = @(Get-ChildItem -Path $Root -Filter '*.html' -File | Sort-Object Name)
if ($HtmlFiles.Count -eq 0) { throw "No HTML files found in $Root" }

$Changed = 0
foreach ($File in $HtmlFiles) {
  $Original = [System.IO.File]::ReadAllText($File.FullName)
  $Updated = $Original

  if ($Updated -notmatch [regex]::Escape("assets/$CssName")) {
    if ($Updated -match '(?i)</head>') {
      $Updated = [regex]::Replace($Updated, '(?i)</head>', "  $CssTag`r`n</head>", 1)
    } else {
      $Updated += "`r`n$CssTag`r`n"
    }
  }

  if ($Updated -notmatch [regex]::Escape("assets/$JsName")) {
    if ($Updated -match '(?i)</body>') {
      $Updated = [regex]::Replace($Updated, '(?i)</body>', "  $JsTag`r`n</body>", 1)
    } else {
      $Updated += "`r`n$JsTag`r`n"
    }
  }

  if ($Updated -ne $Original) {
    Write-Utf8NoBom -Path $File.FullName -Content $Updated
    $Changed++
  }
}

$Errors = New-Object System.Collections.Generic.List[string]
foreach ($File in $HtmlFiles) {
  $Text = [System.IO.File]::ReadAllText($File.FullName)
  if ($Text -notmatch [regex]::Escape("assets/$CssName")) { $Errors.Add("CSS missing: $($File.Name)") }
  if ($Text -notmatch [regex]::Escape("assets/$JsName")) { $Errors.Add("JS missing: $($File.Name)") }
  if ($Text -match '\.\./assets/job-status-color-uiux') { $Errors.Add("Invalid ../ path: $($File.Name)") }
}

Write-Host ('=' * 68)
Write-Host 'Job Status Color UI/UX Update'
Write-Host ('=' * 68)
Write-Host "Project folder : $Root"
Write-Host "HTML pages     : $($HtmlFiles.Count)"
Write-Host "Pages updated  : $Changed"
Write-Host "Pages unchanged: $($HtmlFiles.Count - $Changed)"

if ($Errors.Count -gt 0) {
  Write-Host "`nVALIDATION FAILED" -ForegroundColor Red
  foreach ($Message in $Errors) { Write-Host " - $Message" }
  exit 1
}

Write-Host "`nVALIDATION PASSED" -ForegroundColor Green
Write-Host 'All HTML pages load the accessible status-color layer.'
Write-Host 'Open index.html or jobs.html and change a status to test it.'
