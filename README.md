# Environment variable management with Doppler

Environment variables are managed with Doppler. Running the `./tooling/scripts/doppler.sh` script will help you push/pull env variables between Doppler and local .env files. You will first need to [install the Doppler CLI](https://docs.doppler.com/docs/cli) and then run `doppler login` and `doppler setup`.

Usage:

```bash
# download all configs from Doppler to local .env files
pnpm doppler download

# Uploads the vars in .env.dev, .env.stg, and .env.prd files
pnpm doppler upload
```

# Deploying

1. On github push to `staging` or `main` branches of `f3-nation/f3-nation-map` it will automatically deploy w cloud build to cloud run

# Mobile vs Desktop

1. As shown in update-pane.tsx we use onClick for desktop and onTouchEnd for mobile. This seems to work best. But we are using isMobileDevice in some other places and might need to update

# PgBouncer

- this app uses a GCE instance to run PgBouncer in the f3data project
- gcloud compute ssh f3data-pgbouncer-vm --project f3data

# WIP

- ensure we can't submit with no time and no events for new events
- add tests for approvals in the admin portal
- test image issues
- better text of where we're moving aos and regions
- decide which things you can change region and and which you can't
- TODO: Think through AO and location appearance
