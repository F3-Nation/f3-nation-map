ALTER TABLE "accounts" RENAME TO "auth_accounts";--> statement-breakpoint
ALTER TABLE "sessions" RENAME TO "auth_sessions";--> statement-breakpoint
ALTER TABLE "verification_token" RENAME TO "auth_verification_token";--> statement-breakpoint
ALTER TABLE "auth_accounts" DROP CONSTRAINT "accounts_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_sessions" DROP CONSTRAINT "sessions_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;