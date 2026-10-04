#!/usr/bin/env bash
# Deploy PaperLoom to Cloud Run (run in Google Cloud Shell or any machine with gcloud).
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-project-239daf46-b8f2-429e-96d}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="${GCP_SERVICE_NAME:-paperloom}"
REPO_NAME="${GCP_ARTIFACT_REPO:-paperloom}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/app:latest"

gcloud config set project "${PROJECT_ID}"

gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

if ! gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" --quiet >/dev/null 2>&1; then
  gcloud artifacts repositories create "${REPO_NAME}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="PaperLoom container images"
fi

gcloud builds submit --tag "${IMAGE}"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 3600 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 3 \
  --set-env-vars "TRACE_DATA_DIR=/tmp/trace"

gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --format='value(status.url)'
