ALTER TABLE "orders" ADD COLUMN "external_carrier_name" varchar(180);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "external_payer" varchar(40);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "transport_destination_city" varchar(120);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "document_set_count" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "return_documents" boolean DEFAULT false NOT NULL;