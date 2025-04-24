#!/bin/bash

# Check for valid deployment target
if [ "$1" != "local" ] && [ "$1" != "gcp" ]; then
  echo "Usage: pnpm -F pgbouncer deploy [local|gcp]"
  exit 1
fi

# Determine deployment target
if [ "$1" = "local" ]; then
  echo "Local deployment requested"
  DEPLOY_LOCAL=true
else
  if [ -z "$GCP_DATA_PROJECT_ID" ]; then
    echo "Error: GCP_DATA_PROJECT_ID must be set for GCP deployment"
    exit 1
  fi
  echo "GCP deployment requested"
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

echo "Creating configuration files..."
echo "Using user: ${POSTGRES_USER}"
echo "Using database: ${POSTGRES_DB}"

# Generate SCRAM password hash
SCRAM_PASSWORD=$(echo -n "${POSTGRES_PASSWORD}" | openssl dgst -sha256 -binary | base64)
echo "Created SCRAM password hash"

# Create a temporary userlist.txt with the correct password
# For SCRAM, we need to use the plain password as PgBouncer will handle the SCRAM protocol
echo "\"${POSTGRES_USER}\" \"${POSTGRES_PASSWORD}\"" > userlist.txt
echo "Created userlist.txt with plain password for SCRAM authentication"
cat userlist.txt

# Create a temporary pgbouncer.ini with the correct settings
cat > pgbouncer.ini << EOF
[databases]
* = host=${POSTGRES_HOST} port=${POSTGRES_PORT} dbname=${POSTGRES_DB}

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
admin_users = ${POSTGRES_USER}
stats_users = ${POSTGRES_USER}
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 10
reserve_pool_timeout = 5.0
server_reset_query = DISCARD ALL
server_check_query = SELECT 1
server_check_delay = 30
log_connections = 1
log_disconnections = 1
application_name_add_host = 1
ignore_startup_parameters = extra_float_digits
EOF

echo "Created pgbouncer.ini"

# Check if we're deploying to GCP
if [ "$DEPLOY_LOCAL" = "false" ]; then
  echo "Deploying to Google Cloud Run..."
  
  # Get Doppler token
  if [ -z "$DOPPLER_TOKEN" ]; then
    echo "Error: DOPPLER_TOKEN is not set in environment"
    exit 1
  fi
  
  # Build and push to Container Registry
  docker build -t gcr.io/${GCP_DATA_PROJECT_ID}/pgbouncer .
  docker push gcr.io/${GCP_DATA_PROJECT_ID}/pgbouncer

  # Deploy to Cloud Run
  gcloud run deploy pgbouncer \
    --image gcr.io/${GCP_DATA_PROJECT_ID}/pgbouncer \
    --platform managed \
    --allow-unauthenticated \
    --port 6432 \
    --set-env-vars "DOPPLER_TOKEN=${DOPPLER_TOKEN}" \
    --region us-central1 \
    --project ${GCP_DATA_PROJECT_ID}

  echo "Deployment to Cloud Run complete"
else
  echo "Running locally..."
  
  # Stop any existing containers
  docker ps | grep pgbouncer-local && docker stop $(docker ps | grep pgbouncer-local | awk '{print $1}')
  
  # Build and run locally
  docker build -t pgbouncer-local .
  docker run --rm -p 6432:6432 pgbouncer-local
fi 