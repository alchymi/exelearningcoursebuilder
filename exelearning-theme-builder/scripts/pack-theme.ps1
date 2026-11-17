param(
    [Parameter(Mandatory=$true)][string]$ThemeDir,
    [Parameter(Mandatory=$true)][string]$OutZip
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$themeRoot = (Resolve-Path -LiteralPath $ThemeDir).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
$outputPath = [IO.Path]::GetFullPath($OutZip)
if ($outputPath.StartsWith($themeRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Output ZIP must be outside the theme directory.'
}
foreach ($required in @('config.xml','style.css','screenshot.png')) {
    if (-not (Test-Path -LiteralPath (Join-Path $themeRoot $required) -PathType Leaf)) { throw "Missing $required" }
}
[xml]$config = [IO.File]::ReadAllText((Join-Path $themeRoot 'config.xml'), [Text.Encoding]::UTF8)
$name = [string]$config.theme.name
if ($name -notmatch '^[a-z0-9][a-z0-9_-]*$') { throw 'Invalid theme name.' }
if ((Split-Path $themeRoot -Leaf) -cne $name) { throw 'Theme directory must match config.xml name.' }
if ([IO.Path]::GetFileName($outputPath) -cne ($name + '.zip')) { throw 'ZIP filename must match theme name.' }
if (-not $config.theme.title) { throw 'Missing theme title.' }
$allEntries = @(Get-ChildItem -LiteralPath $themeRoot -Force -Recurse)
if ($allEntries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) { throw 'Theme must not contain symbolic links or reparse points.' }
$files = @($allEntries | Where-Object { -not $_.PSIsContainer })
foreach ($css in ($files | Where-Object { $_.Extension -eq '.css' })) {
    $text = [IO.File]::ReadAllText($css.FullName, [Text.Encoding]::UTF8)
    foreach ($match in [regex]::Matches($text, 'url\(\s*[''" ]?([^''"\)\s]+)')) {
        $url = $match.Groups[1].Value
        if ($url -match '^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|//|#)') { continue }
        if ($url.StartsWith('/')) { throw "Non-portable root-relative CSS resource: $url" }
        $relative = [Uri]::UnescapeDataString(($url -split '[?#]',2)[0])
        $resource = [IO.Path]::GetFullPath((Join-Path $css.DirectoryName $relative))
        if (-not $resource.StartsWith($themeRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "CSS resource escapes theme: $url" }
        if (-not (Test-Path -LiteralPath $resource -PathType Leaf)) { throw "Missing CSS resource: $url" }
    }
}
$parent = Split-Path $outputPath -Parent
[IO.Directory]::CreateDirectory($parent) | Out-Null
$tempPath = Join-Path $parent ('.theme-pack-' + [guid]::NewGuid().ToString('N') + '.zip')
try {
    $archive = [IO.Compression.ZipFile]::Open($tempPath, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $entry = $file.FullName.Substring($themeRoot.Length + 1).Replace('\','/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file.FullName,$entry,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $archive.Dispose() }
    Move-Item -LiteralPath $tempPath -Destination $outputPath -Force
    Write-Output "OK $outputPath ($($files.Count) files)"
} finally {
    if (Test-Path -LiteralPath $tempPath) { Remove-Item -LiteralPath $tempPath }
}
