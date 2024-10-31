CREATE TABLE IF NOT EXISTS "f3_expansion_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"area" text NOT NULL,
	"lat" numeric(8, 5),
	"lng" numeric(8, 5),
	"userLat" numeric(8, 5),
	"userLng" numeric(8, 5),
	"interestedInOrganizing" boolean,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"created" timestamp DEFAULT now(),
	"updated" timestamp
);
