-- Create form_templates table
CREATE TABLE "form_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"fields" jsonb NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create form_submissions table
CREATE TABLE "form_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_template_id" integer NOT NULL,
	"values" jsonb NOT NULL,
	"user_id" integer NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_created_by_users_id_fk" 
FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_template_id_form_templates_id_fk" 
FOREIGN KEY ("form_template_id") REFERENCES "public"."form_templates"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes for better performance
CREATE INDEX "form_templates_created_by_idx" ON "form_templates"("created_by");
CREATE INDEX "form_submissions_form_template_id_idx" ON "form_submissions"("form_template_id");
CREATE INDEX "form_submissions_user_id_idx" ON "form_submissions"("user_id");
CREATE INDEX "form_submissions_submitted_at_idx" ON "form_submissions"("submitted_at"); 