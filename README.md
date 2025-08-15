# F3 Nation Map

### F3 Nation Repos

- [F3 Nation](https://github.com/F3-Nation)
- [F3 Database](https://github.com/F3-Nation/F3-Data-Models)
- [F3 Map](https://github.com/F3-Nation/f3-nation-map)

## Table of Contents

{{TOC}}

---

# Local App Setup

## Corepack

[Documentation](https://github.com/nodejs/corepack#readme)

- Behind the scenes node.js uses corepack sits between Node and package managers without having to install them

- Ensure this is enabled by issuing the following command:
  `corepack enable`

## pnpm

[Documentation](https://pnpm.io/installation)

- Do this after Corepack is installed/updated

  - When **updating** see the note about the latest version on the official documentation using:
    - `npm install --global corepack@latest`

- Run `corepack enable pnpm`

## Database Instantiation

The database uses **Postgres**

- [Download Link](https://www.postgresql.org/download/)

- [Documentation](https://www.postgresql.org/docs/)

### After Installation

- Start the Postgres service

  - This varies by system

- Verify that Postgres was installed correctly. The example they provide is to create a database

  - `createdb mydb`

- Access that new database by running the PostgreSQL interactive terminal program, called psql.

  - `psql <your_database>`

- Next, attempt to execute a query on the database such as
  - `select current_date;`

### Creating the Local Database via CLI

This is assuming you have `psql` started and open [Documentation on psql](https://www.postgresql.org/docs/current/app-psql.html)

- Run the command below and name it whatever you want
  - `createdb <your_database_name>`

### Creating the Role and Assigning Permissions via CLI

This is how to create a database user for your local instance and what permissions to give the user.

When doing this, make sure the commands you are running will be executed against the newly created local database.

#### Role

Please note, Postgres does not really distinguish between users and roles. They are essentially the same thing, but with the distinction of being able to log in or not.

- `create role new_role with login password ''; `

Seeing `CREATE ROLE` confirms successful execution

#### Grant Usage

Give usage and create

- `grant usage, create on schema public to new_role;`

Seeing `GRANT` confirms privileges were granted

#### Privileges

grant all privileges on current tables

- `grant all privileges on all tables in schema public to new_role;`

Seeing `GRANT` confirms privileges were granted

grant privileges on future tables, and without the permissions will need to be setup for each new table

- `alter default privileges in schema public grant all privileges on tables to new_role;`

Seeing `ALTER DEFAULT PRIVILEGES` denotes success in this statement's execution.

**Optional Connection Limit**

- `ALTER ROLE new_role CONNECTION LIMIT 5;`

### Creating the Connection String

Substitute _your_ user's information into the connection string

- Local Connection String Format
  `postgresql://user:password@localhost/mydatabase`

- Remote Connection String Format
  `postgresql://user:password@192.168.1.100:5432/mydatabase`

- Place the connection string in the .env file

#### Table Definitions

[Data Models repo](https://github.com/F3-Nation/F3-Data-Models) can be found here. This also contains instructions on how to install the data models.

---

## Example .ENV File

This is an example .ENV file to get you started on local development

Please note, the values prioritized at the top are what the map requires and were placed there for visibility only. Plug the values into them in your `.env` file.

```
# Required for Map
DATABASE_URL= postgres instance uri
NEXT_PUBLIC_CHANNEL=local
NEXT_PUBLIC_GOOGLE_API_KEY= create an api key in GCP
NEXT_PUBLIC_URL= http://localhost:3000 for local development

# Other Secrets
AUTH_SECRET= can be anything
EMAIL_ADMIN_DESTINATIONS= comma separated email addresses
EMAIL_FROM= email address
EMAIL_SERVER= email uri (smtp://name@host.email:xxxxx@smtp.host.email:PORT_NUMBER)
GCP_DATA_PROJECT_ID= GCP project
GOOGLE_LOGO_BUCKET_BUCKET_NAME= GCP bucket
GOOGLE_LOGO_BUCKET_CLIENT_EMAIL= service account
GOOGLE_LOGO_BUCKET_PRIVATE_KEY= private key for the service account
GOOGLE_LOGO_BUCKET_PROJECT_ID= GCP project id
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL= Not needed unless running migration
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY= Not needed unless running migration
GOOGLE_SHEET_ID= Not needed unless running migration
GOOGLE_SHEET_ID_GRAVITY_FORMS= Not needed unless running migration
TEST_DATABASE_URL= create a second database in postgres
API_KEY= anything
SUPER_ADMIN_API_KEY= anything
NEXT_PUBLIC_GA_MEASUREMENT_ID= optional
```

---

## Google Maps API

There are a couple options

1. If you have a google account, you can create an api key and add that to the `.ENV file`
   - Here is [an excellent guide](https://dev.to/simplecodeagency/how-to-setup-a-new-google-maps-api-key-4kp1) on how to create one.
2. Ask Spuds or Miyagi for the dev key to use during your testing.

### APIs to Enable

If you created your own api key, make sure that these apis are enabled.

-

## Mobile vs Desktop

As shown in `update-pane.tsx` we use `onClick` for desktop and `onTouchEnd` for mobile. This seems to work best. But we are using `isMobileDevice` in some other places and might need to update

## PgBouncer

- this app uses a GCE instance to run PgBouncer in the f3data project
- `gcloud compute ssh f3data-pgbouncer-vm --project f3data`

---

# Local App Usage

- After all required items are installed, run `pnpm i` to install all packages
- After which, run `npm run dev` to launch the application
- To view the application go to `http://localhost:3000/`
  - Please note, this is listed in the console, so please refer to what is printed there.

# Contributing

There are two ways in which you can contribute

1. You can ask to be added to the list of contributers
2. Fork the Repo and create a Pull Request

Regardless of which option you selected the SOP is to

- create and push to a branch
- then make a PR into dev

### Branch Naming

- use hyphens to separate words

- `feat/` then `your-description`

  - eg: `feat/this-new-thing`

- `fix/` then `github issue number`

  - eg: `fix/93-issue-description`

- `release/` then `release number`
  - eg: `release/v1.1.1`
