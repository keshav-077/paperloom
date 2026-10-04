# Deploy PaperLoom to Cloud Run (Windows / PowerShell).
$ErrorActionPreference = "Stop"

$GcloudCandidates = @(
  "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
  "$env:ProgramFiles\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
)
$Gcloud = $GcloudCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $Gcloud) {
  throw "gcloud not found. Install Google Cloud SDK or open a new terminal after install."
}

$ProjectId = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { "project-239daf46-b8f2-429e-96d" }
$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$ServiceName = if ($env:GCP_SERVICE_NAME) { $env:GCP_SERVICE_NAME } else { "paperloom" }
$RepoName = if ($env:GCP_ARTIFACT_REPO) { $env:GCP_ARTIFACT_REPO } else { "paperloom" }
$Image = "${Region}-docker.pkg.dev/${ProjectId}/${RepoName}/app:latest"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $RepoRoot
try {
  & $Gcloud config set project $ProjectId
  if ($LASTEXITCODE -ne 0) { throw "gcloud config set project failed." }
  & $Gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
  if ($LASTEXITCODE -ne 0) { throw "gcloud services enable failed." }

  $ErrorActionPreference = "Continue"
  & $Gcloud artifacts repositories describe $RepoName --location=$Region 2>&1 | Out-Null
  $repoMissing = $LASTEXITCODE -ne 0
  $ErrorActionPreference = "Stop"
  if ($repoMissing) {
    & $Gcloud artifacts repositories create $RepoName `
      --repository-format=docker `
      --location=$Region `
      --description="PaperLoom container images"
    if ($LASTEXITCODE -ne 0) { throw "Artifact Registry create failed." }
  }

  & $Gcloud builds submit --tag $Image
  if ($LASTEXITCODE -ne 0) { throw "Cloud Build failed." }
  & $Gcloud run deploy $ServiceName `
    --image $Image `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --timeout 3600 `
    --memory 2Gi `
    --cpu 2 `
    --max-instances 3 `
    --set-env-vars "TRACE_DATA_DIR=/tmp/trace"
  if ($LASTEXITCODE -ne 0) { throw "Cloud Run deploy failed." }

  & $Gcloud run services describe $ServiceName --region $Region --format="value(status.url)"
  if ($LASTEXITCODE -ne 0) { throw "Could not read Cloud Run service URL." }
}
finally {
  Pop-Location
}
