# PgBouncer Connection Pooler

This is a PgBouncer connection pooler deployed on Google Cloud Run to manage connections to Google Cloud SQL.

## Prerequisites

- Docker installed and running
- Google Cloud SDK installed and configured
- pnpm installed
- Make sure you have the following environment variables in your root `.env` file:
  ```bash
  DATABASE_URL="postgres://map:password@your-db-host:5432/your-database"
  GCP_DATA_PROJECT_ID=f3data
  ```

## Setup

1. Make the scripts executable:

   ```bash
   chmod +x apps/pgbouncer/deploy.sh
   chmod +x apps/pgbouncer/dev.sh
   chmod +x apps/pgbouncer/test-connection.sh
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Local Development

To run PgBouncer locally for testing:

```bash
pnpm dev
```

This will:

- Build a local Docker container
- Start PgBouncer on port 6432
- Proxy connections to your actual database

To test the local connection:

```bash
pnpm test:local
```

## Deployment

1. Build the Docker image:

   ```bash
   pnpm build
   ```

2. Deploy to an environment:

   ```bash
   # For staging
   pnpm deploy:staging

   # For production
   pnpm deploy:production
   ```

## Testing Deployed Services

To test connections to deployed services:

```bash
# Test staging
pnpm test:staging

# Test production
pnpm test:production
```

## Configuration

The PgBouncer configuration is generated dynamically based on your `DATABASE_URL`. Key settings include:

- Connection pooling mode: transaction
- Default pool size: 20
- Min pool size: 5
- Reserve pool size: 10
- Max client connections: 1000

## Connection String

After deployment, update your application's connection string to point to the Cloud Run service:

```
postgresql://map:password@YOUR-CLOUD-RUN-SERVICE-URL:6432/your_database
```

## Troubleshooting

1. If you get permission errors during deployment:

   - Make sure you're authenticated with Google Cloud: `gcloud auth login`
   - Verify your project has the necessary permissions

2. If local development fails:

   - Check that Docker is running
   - Verify your DATABASE_URL is correct
   - Make sure port 6432 is available

3. If connection tests fail:
   - Check that the service is running (local or deployed)
   - Verify your database credentials
   - Ensure network/firewall rules allow the connection
