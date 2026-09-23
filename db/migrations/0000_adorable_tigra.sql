CREATE TYPE "public"."attachment_category" AS ENUM('CARGO_PHOTO', 'WAREHOUSE_PHOTO', 'DOCUMENT', 'INVOICE', 'PROOF_OF_DELIVERY', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."attachment_visibility" AS ENUM('CLIENT', 'INTERNAL');--> statement-breakpoint
CREATE TYPE "public"."comment_scope" AS ENUM('INTERNAL', 'CLIENT_VISIBLE');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('DRAFT', 'SUBMITTED', 'REVIEW', 'CONFIRMED', 'DRIVER_ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'AT_WAREHOUSE', 'WAREHOUSE_PROCESSING', 'READY_FOR_DELIVERY', 'DELIVERY_IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'ON_HOLD', 'ISSUE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('PICKUP_TO_WAREHOUSE', 'WAREHOUSE_INTAKE', 'DELIVERY_OWN_TRANSPORT', 'DELIVERY_TRANSPORT_COMPANY', 'COURIER_DOCUMENTS', 'WAREHOUSE_SERVICE');--> statement-breakpoint
CREATE TYPE "public"."route_point_type" AS ENUM('PICKUP', 'WAREHOUSE', 'DELIVERY', 'TERMINAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CLIENT', 'MANAGER', 'DRIVER', 'WAREHOUSE', 'ADMIN');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" varchar(240) NOT NULL,
	"legal_name" varchar(300),
	"inn" varchar(12),
	"email" varchar(320),
	"phone" varchar(40),
	"billing_details" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"license_number" varchar(80),
	"notes" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(220) NOT NULL,
	"inn" varchar(12),
	"contact_name" varchar(180),
	"phone" varchar(40),
	"email" varchar(320),
	"address_text" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"role" "user_role" NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(40),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"vehicle_type" varchar(80),
	"plate_number" varchar(20),
	"capacity_kg" integer,
	"volume_m3" numeric(8, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"address_text" text NOT NULL,
	"phone" varchar(40),
	"working_hours" varchar(120),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cargo_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"supplier_id" uuid,
	"title" varchar(240) NOT NULL,
	"category" varchar(100),
	"description" text,
	"quantity" numeric(12, 2) DEFAULT 1 NOT NULL,
	"unit" varchar(32),
	"places" integer,
	"weight_kg" numeric(12, 2),
	"length_cm" numeric(10, 2),
	"width_cm" numeric(10, 2),
	"height_cm" numeric(10, 2),
	"declared_value" numeric(14, 2),
	"special_requirements" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"quantity" numeric(12, 2) DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" varchar(24) NOT NULL,
	"company_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"manager_user_id" uuid,
	"driver_user_id" uuid,
	"vehicle_id" uuid,
	"warehouse_id" uuid,
	"type" "order_type" NOT NULL,
	"status" "order_status" DEFAULT 'DRAFT' NOT NULL,
	"title" varchar(240),
	"description" text,
	"client_reference" varchar(120),
	"subtotal" numeric(14, 2) DEFAULT 0 NOT NULL,
	"services_total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"insurance_total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"discount_total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"tax_total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"total" numeric(14, 2) DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'RUB' NOT NULL,
	"planned_pickup_at" timestamp with time zone,
	"planned_delivery_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"type" "route_point_type" NOT NULL,
	"label" varchar(120),
	"address_text" text NOT NULL,
	"contact_name" varchar(180),
	"contact_phone" varchar(40),
	"planned_at" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"unit" varchar(40),
	"base_price" numeric(12, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"warehouse_operation_id" uuid,
	"uploaded_by_user_id" uuid NOT NULL,
	"category" "attachment_category" NOT NULL,
	"visibility" "attachment_visibility" DEFAULT 'CLIENT' NOT NULL,
	"filename" varchar(255) NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" varchar(120),
	"size_bytes" numeric(14, 0),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" uuid,
	"action" varchar(100) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"scope" "comment_scope" NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"attachment_id" uuid,
	"document_type" varchar(48) NOT NULL,
	"document_number" varchar(120),
	"issued_at" timestamp with time zone,
	"title" varchar(240) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"type" varchar(64) NOT NULL,
	"title" varchar(240) NOT NULL,
	"body" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"changed_by_user_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"performed_by_user_id" uuid NOT NULL,
	"operation_type" varchar(48) NOT NULL,
	"quantity" numeric(12, 2),
	"weight_kg" numeric(12, 2),
	"result_text" text,
	"notes" text,
	"performed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cargo_items" ADD CONSTRAINT "cargo_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cargo_items" ADD CONSTRAINT "cargo_items_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_services" ADD CONSTRAINT "order_services_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_services" ADD CONSTRAINT "order_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_manager_user_id_users_id_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_user_id_users_id_fk" FOREIGN KEY ("driver_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_points" ADD CONSTRAINT "route_points_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_warehouse_operation_id_warehouse_operations_id_fk" FOREIGN KEY ("warehouse_operation_id") REFERENCES "public"."warehouse_operations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_operations" ADD CONSTRAINT "warehouse_operations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_operations" ADD CONSTRAINT "warehouse_operations_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_operations" ADD CONSTRAINT "warehouse_operations_performed_by_user_id_users_id_fk" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_is_active_idx" ON "companies" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "driver_profiles_user_id_unique" ON "driver_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "suppliers_company_id_idx" ON "suppliers" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_company_id_idx" ON "users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "users_role_active_idx" ON "users" USING btree ("role","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_plate_number_unique" ON "vehicles" USING btree ("plate_number");--> statement-breakpoint
CREATE INDEX "vehicles_is_active_idx" ON "vehicles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "warehouses_is_active_idx" ON "warehouses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cargo_items_order_id_idx" ON "cargo_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_services_order_id_idx" ON "order_services" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_services_service_id_idx" ON "order_services" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_unique" ON "orders" USING btree ("number");--> statement-breakpoint
CREATE INDEX "orders_company_id_idx" ON "orders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_type_idx" ON "orders" USING btree ("type");--> statement-breakpoint
CREATE INDEX "orders_manager_user_id_idx" ON "orders" USING btree ("manager_user_id");--> statement-breakpoint
CREATE INDEX "orders_driver_user_id_idx" ON "orders" USING btree ("driver_user_id");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "route_points_order_sequence_unique" ON "route_points" USING btree ("order_id","sequence");--> statement-breakpoint
CREATE INDEX "route_points_order_id_idx" ON "route_points" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "services_code_unique" ON "services" USING btree ("code");--> statement-breakpoint
CREATE INDEX "services_is_active_idx" ON "services" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "attachments_order_id_idx" ON "attachments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "attachments_uploaded_by_user_id_idx" ON "attachments" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_created_at_idx" ON "audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "comments_order_id_idx" ON "comments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "comments_scope_idx" ON "comments" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "documents_order_id_idx" ON "documents" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_created_at_idx" ON "notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "status_history_order_created_at_idx" ON "status_history" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "warehouse_operations_order_id_idx" ON "warehouse_operations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "warehouse_operations_warehouse_id_idx" ON "warehouse_operations" USING btree ("warehouse_id");