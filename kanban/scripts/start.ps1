Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location "$PSScriptRoot\.."
try {
    docker compose up --build -d
    Write-Host "Kanban running at http://localhost:8080"
} finally {
    Pop-Location
}
