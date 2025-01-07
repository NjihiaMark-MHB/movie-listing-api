CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"password" text,
	"firstName" text,
	"lastName" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
