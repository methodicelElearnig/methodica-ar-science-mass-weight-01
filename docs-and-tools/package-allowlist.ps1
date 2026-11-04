#Requires -Version 7.0
<#
.SYNOPSIS
    THE ALLOWLIST: the single definition of what a deployment package contains.

.DESCRIPTION
    Dot-sourced by build-package.ps1 and verify-package.ps1. It is not runnable on
    its own and produces no output.

    ⚠️ This is an ALLOWLIST and must never become a denylist. A file ships only if a
    rule here says it does — so a new document, a key file or a dev page added to the
    repo simply does not match and does not ship.

    ⚠️ EDIT THIS FILE AND NOTHING ELSE when what ships changes. The builder and the
    verifier both read it, which is what stops a package from being built to one
    definition and checked against another.

        build-package.ps1   — copies exactly the files Test-Ships accepts
        verify-package.ps1  — asserts the package IS exactly those files

    This file never ships: docs-and-tools/ is excluded wholesale, and *.ps1 twice over.

.NOTES
    methodica-ar-science-mass-weight-01 (2026-09-24). build-package.ps1 and
    verify-package.ps1 are byte-identical to the mass-measure-03 / ratio-01 / ratio-02
    copies; only this file differs. The differences from mass-measure-03's copy, all
    forced by this unit's shape:

      1. $ComponentGlob names this unit's six parts.
      2. A part ships index.html, js/*.js and css/*.css — this unit keeps its code in
         js/ and css/ subfolders (mass-measure-03 ships script.js / styles.css at the
         part root). Handled by $ComponentCodeDirs.
      3. The Galileo applet in part 05 (assets/widgets/galileo-applet/) is an iframe
         site, but it lives under assets/, which ships at any depth — no sub-app rule.
      4. What must NOT ship, and is refused because no rule accepts it:
           - the legacy single-file build at the repo root: css/, js/, assets/,
             index-monolith-backup.html (66 MB, unused by production);
           - the QA/dev shell: qa-shell.html, unit-shell.js, unit-manifest.js,
             index_dev.html (root and per part);
           - translation/, docs/, docs-and-tools/, _test/, metadata-from/, every *.md.

    It ships NO root files (rule set 28.09.26 for all 720 units; Documentation/
    reporting-and-resume/ADDING-REPORTING-AND-RESUME.md §5.2). Platforms launch every component
    by its own .../<component>/index.html link — Kata's hostedContentRef — so a unit-level entry
    point is never used, and the MOE CDN serves a folder URL as 0 bytes (a folder-style redirect
    is a blank page). The root index.html stays in the repo for local browsing only.
#>

# ── Directories that never contribute a single file, whatever is inside them ──
$ExcludeTopLevel = @('_test', 'docs-and-tools', 'docs', 'metadata-from', 'translation', '.git', '.claude', '.agents')

# ── File names that never ship, wherever they appear ──
$ExcludeNames = @('index_dev.html', 'qa-shell.html', 'unit-shell.js', 'unit-manifest.js',
                  'index-monolith-backup.html', 'README.md', '.gitignore', '.gitattributes', '.DS_Store',
                  'ARCHITECTURE.md', 'PROJECT_BRIEF.md', 'CLAUDE.md', 'AGENTS.md')

# ── Extensions that never ship ──
$ExcludeExt = @('.ps1', '.log', '.md')

# ── Any path segment starting with an underscore is a SOURCE, not a deliverable. ──
$ExcludeUnderscoreSegment = $true

# ── Directory names that are source material wherever they appear, even inside assets/ ──
$ExcludeDirSegment = @('originals', 'originals-backup')

# ── Individual files that look shippable and are not (verify by grep first — never by eye) ──
$ExcludeRelPaths = @()

# ── What each shipped area contributes ──
$RootFiles = @()                         # none — the root index.html is not deployed (see .NOTES)

$UnitDirs = @{
    'metadata'    = '*.json'             # unit + per-component catalogue records
    'unit-js'     = '*.js'               # the shared layer
    'unit-css'    = '*.css'              # 25-report.css
    'unit-assets' = '*'                  # fonts / images / video shared by more than one part
}

# Inside a part folder: index.html, the code folders, and everything under assets/.
$ComponentFiles    = @('index.html')
$ComponentCodeDirs = @{ 'js' = '*.js'; 'css' = '*.css' }
$ComponentGlob     = 'methodica-ar-science-mass-weight-01-[0-9][0-9]'

# No iframe sub-app outside assets/ in this unit (kept for the shared verifier's interface).
$ComponentSubApps = @()
$SubAppFiles      = @('index.html', 'script.js', 'style.css')

# ── Hygiene: if any of these turn up INSIDE a package, it is unsafe to upload ──
$SecretPatterns = @('*key*', '*.ps1', '*.log', 'index_dev.html', 'qa-shell.html', 'unit-shell.js',
                    'unit-manifest.js', 'README.md', '.git*', '_*')

# ── Files a package may contain that are NOT copied from the tree ──
$PackageOnlyFiles = @('DEPLOY.md')

<#
.SYNOPSIS
    Does this repo-relative path (forward slashes) belong in a deployment package?
#>
function Test-Ships([string] $rel) {
    $segs = $rel.Split('/')
    if ($rel -in $ExcludeRelPaths)                     { return $false }
    if ($segs[0] -in $ExcludeTopLevel)                 { return $false }
    if ($segs[-1] -in $ExcludeNames)                   { return $false }
    if ([IO.Path]::GetExtension($rel) -in $ExcludeExt) { return $false }
    if ($ExcludeUnderscoreSegment -and ($segs | Where-Object { $_.StartsWith('_') })) { return $false }
    if ($segs | Where-Object { $_ -in $ExcludeDirSegment }) { return $false }

    if ($segs.Count -eq 1) { return $segs[0] -in $RootFiles }

    if ($UnitDirs.ContainsKey($segs[0])) {
        $glob = $UnitDirs[$segs[0]]
        if ($glob -eq '*') { return $true }              # unit-assets/: everything, at any depth
        return ($segs.Count -eq 2 -and $segs[1] -like $glob)
    }

    if ($segs[0] -like $ComponentGlob) {
        if ($segs.Count -eq 2) { return $segs[1] -in $ComponentFiles }
        if ($segs[1] -eq 'assets') { return $true }      # assets/ at any depth (the applet too)
        if ($ComponentCodeDirs.ContainsKey($segs[1])) {
            return ($segs.Count -eq 3 -and $segs[2] -like $ComponentCodeDirs[$segs[1]])
        }
        if ($segs[1] -in $ComponentSubApps) {
            if ($segs.Count -eq 3) { return $segs[2] -in $SubAppFiles }
            return ($segs[2] -eq 'assets')
        }
        return $false
    }
    return $false
}

<#
.SYNOPSIS
    Every repo-relative path in $root that ships, sorted.
#>
function Get-ShippableFiles([string] $root) {
    Get-ChildItem -LiteralPath $root -Recurse -File -Force |
        ForEach-Object { [IO.Path]::GetRelativePath($root, $_.FullName).Replace('\', '/') } |
        Where-Object { Test-Ships $_ } |
        Sort-Object
}

<#
.SYNOPSIS
    Secret/dev files present in a package. Anything returned makes it unsafe to upload.
#>
function Get-HygieneHits([string[]] $rels) {
    $hits = @()
    foreach ($pat in $SecretPatterns) {
        $hits += @($rels | Where-Object {
            $_.Split('/')[-1] -like $pat -or ($_.Split('/') | Where-Object { $_ -like $pat })
        })
    }
    @($hits | Sort-Object -Unique | Where-Object { $_ -notin $PackageOnlyFiles })
}
