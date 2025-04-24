#!/bin/bash

# Check if environment is specified
if [ "$1" != "local" ] && [ "$1" != "gcp" ]; then
  echo "Usage: ./test-connection.sh [local|gcp]"
  exit 1
fi

# Determine deployment target
if [ "$1" = "local" ]; then
  echo "Testing local PgBouncer connection..."
  DEPLOY_LOCAL=true
else
  if [ -z "$GCP_DATA_PROJECT_ID" ]; then
    echo "Error: GCP_DATA_PROJECT_ID must be set for GCP deployment"
    exit 1
  fi
  echo "Testing GCP PgBouncer connection..."
  DEPLOY_LOCAL=false
fi

# Parse DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set in environment"
  exit 1
fi

if [[ $DATABASE_URL =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
  POSTGRES_USER=${BASH_REMATCH[1]}
  POSTGRES_PASSWORD=${BASH_REMATCH[2]}
  POSTGRES_HOST=${BASH_REMATCH[3]}
  POSTGRES_PORT=${BASH_REMATCH[4]}
  POSTGRES_DB=${BASH_REMATCH[5]}
else
  echo "Error: Invalid DATABASE_URL format"
  exit 1
fi

if [ "$DEPLOY_LOCAL" = "true" ]; then
  # Test local PgBouncer container
  echo "Connecting to: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:6432/${POSTGRES_DB}"
  pgcli "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:6432/${POSTGRES_DB}"
else
  # Get the Cloud Run service URL
  SERVICE_URL=$(gcloud run services describe pgbouncer \
    --platform managed \
    --region us-central1 \
    --project ${GCP_DATA_PROJECT_ID} \
    --format 'value(status.url)')
    
  if [ -z "$SERVICE_URL" ]; then
    echo "Error: Could not get service URL for pgbouncer"
    exit 1
  fi
  
  # Extract host from URL (remove https://)
  HOST=${SERVICE_URL#https://}
  
  echo "Connecting to: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${HOST}:6432/${POSTGRES_DB}"
  pgcli "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${HOST}:6432/${POSTGRES_DB}"
fi 