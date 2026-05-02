-- ===========================================================================
-- EMRS Database Initialization Migration
-- ===========================================================================
-- Generated:  2026-05-02
-- Source:     backups/2026-05-02-final-clean/emrs-schema.sql
--             (pg_dump --schema-only, PostgreSQL 15.12)
-- Replaces:   All prior migrations (10 tracked + 15 manually-applied SQL
--             files as of 2026-05-02).
-- ===========================================================================
-- Run against an empty database only.
-- Sections: extensions → enums → functions → tables → sequences/defaults
--           → primary keys/unique constraints → indexes → triggers → FKs
-- ===========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

CREATE TYPE public.activity_action AS ENUM (
    'LOGIN',
    'LOGOUT',
    'LOGIN_FAILED',
    'PASSWORD_CHANGED',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DEACTIVATED',
    'USER_REACTIVATED',
    'USER_DELETED',
    'ROLE_CHANGED',
    'REQUEST_CREATED',
    'REQUEST_UPDATED',
    'REQUEST_APPROVED',
    'REQUEST_REJECTED',
    'REQUEST_TRANSFERRED',
    'REQUEST_CANCELLED',
    'REQUEST_COMPLETED',
    'EQUIPMENT_CREATED',
    'EQUIPMENT_UPDATED',
    'EQUIPMENT_HOURS_LOGGED',
    'EQUIPMENT_STATUS_CHANGED',
    'EQUIPMENT_ASSIGNED',
    'EQUIPMENT_UNASSIGNED',
    'MAINTENANCE_LOGGED',
    'MAINTENANCE_COMPLETED',
    'JOB_CREATED',
    'JOB_UPDATED',
    'JOB_STATUS_CHANGED',
    'JOB_APPROVED',
    'JOB_TEAM_ADDED',
    'JOB_TEAM_REMOVED',
    'JOB_SUPERVISOR_ASSIGNED',
    'JOB_SUPERVISOR_REMOVED',
    'JOB_EQUIPMENT_ASSIGNED',
    'JOB_EQUIPMENT_REMOVED',
    'SAFETY_REPORT_CREATED',
    'SAFETY_REPORT_UPDATED',
    'SAFETY_REPORT_ASSIGNED',
    'SAFETY_REPORT_RESOLVED',
    'INVENTORY_ADDED',
    'INVENTORY_UPDATED',
    'INVENTORY_ADJUSTED',
    'DISBURSEMENT_CREATED',
    'DISBURSEMENT_COMPLETED',
    'PURCHASE_REQUEST_CREATED',
    'PURCHASE_REQUEST_APPROVED',
    'PURCHASE_REQUEST_REJECTED',
    'PREJOB_INSPECTION_CREATED',
    'PREJOB_INSPECTION_APPROVED',
    'POSTJOB_INSPECTION_CREATED',
    'POSTJOB_INSPECTION_APPROVED',
    'FIELD_REPORT_SUBMITTED',
    'FIELD_REPORT_REVIEWED',
    'SYSTEM_SETTING_CHANGED',
    'DATA_EXPORTED',
    'VENDOR_CREATED',
    'VENDOR_UPDATED',
    'VENDOR_DEACTIVATED',
    'VENDOR_REACTIVATED'
);

CREATE TYPE public.asset_category AS ENUM (
    'TOOL',
    'EQUIPMENT'
);

CREATE TYPE public.department AS ENUM (
    'Operations',
    'Engineering',
    'Maintenance',
    'Logistics',
    'Safety',
    'Purchasing',
    'HR',
    'Finance',
    'IT',
    'Management',
    'Workshop',
    'Field_Services'
);

CREATE TYPE public.disbursement_status AS ENUM (
    'Pending',
    'Approved',
    'Rejected'
);

CREATE TYPE public.entity_type AS ENUM (
    'USER',
    'REQUEST',
    'EQUIPMENT',
    'JOB',
    'SAFETY_REPORT',
    'INVENTORY',
    'DISBURSEMENT',
    'PURCHASE_REQUEST',
    'MAINTENANCE_LOG',
    'INSPECTION',
    'FIELD_REPORT',
    'SYSTEM'
);

CREATE TYPE public.equipment_request_status AS ENUM (
    'Pending',
    'Approved',
    'Rejected'
);

CREATE TYPE public.equipment_source AS ENUM (
    'INVENTORY',
    'CLIENT',
    'NEW_REQUEST'
);

CREATE TYPE public.equipment_status AS ENUM (
    'Available',
    'In_Use',
    'Maintenance',
    'Out_of_Service'
);

CREATE TYPE public.equipment_type AS ENUM (
    'PUMPING_UNIT',
    'PRESSURE_CONTROL',
    'WELL_INTERVENTION',
    'POWER_GENERATION',
    'TANK_VESSEL',
    'VEHICLE',
    'COMPRESSOR',
    'OTHER_EQUIPMENT',
    'HAND_TOOL',
    'POWER_TOOL',
    'MEASURING_INSTRUMENT',
    'CUTTING_TOOL',
    'LIFTING_GEAR',
    'WELDING_EQUIPMENT',
    'OTHER_TOOL'
);

CREATE TYPE public.field_report_status AS ENUM (
    'Submitted',
    'Reviewed',
    'Approved',
    'Rejected'
);

CREATE TYPE public.inspection_status AS ENUM (
    'Pass',
    'Fail',
    'Conditional'
);

CREATE TYPE public.inspection_type AS ENUM (
    'Pre_Job',
    'Daily',
    'Post_Job',
    'Safety'
);

CREATE TYPE public.inventory_category AS ENUM (
    'PPE',
    'Tools',
    'Consumables',
    'Spare_Parts',
    'Office_Supplies',
    'Other'
);

CREATE TYPE public.job_item_status AS ENUM (
    'REQUESTED',
    'APPROVED',
    'DISBURSED',
    'IN_USE',
    'RETURNED',
    'DAMAGED',
    'LOST',
    'PENDING_SUPERVISOR',
    'SUPERVISOR_REJECTED',
    'SOURCING',
    'ARRIVED',
    'PENDING_RETURN',
    'UNDER_REPAIR',
    'REPAIR_COMPLETE',
    'PENDING_REINSPECTION',
    'MANAGER_REJECTED',
    'INSPECTION_APPROVED',
    'PENDING_QUOTE',
    'PENDING_INSPECTION',
    'INSPECTION_SUBMITTED'
);

CREATE TYPE public.job_status AS ENUM (
    'Planned',
    'Active',
    'On_Hold',
    'Completed',
    'Cancelled'
);

CREATE TYPE public.job_status_expanded AS ENUM (
    'Draft',
    'Team_Assigned',
    'Planning',
    'Inspection',
    'Approved',
    'Equipped',
    'In_Transit',
    'In_Progress',
    'Completing',
    'Post_Job',
    'Completed',
    'On_Hold',
    'Cancelled',
    'APPROVED',
    'POST_JOB',
    'IN_PROGRESS'
);

CREATE TYPE public.job_team_role AS ENUM (
    'SUPERVISOR',
    'ENGINEER',
    'CHIEF_OPERATOR',
    'DAQ'
);

CREATE TYPE public.maintenance_type AS ENUM (
    'Scheduled',
    'Unscheduled',
    'Repair',
    'Inspection',
    'Routine_Service',
    'Calibration',
    'Overhaul',
    'Emergency'
);

CREATE TYPE public.movement_type AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT',
    'DISBURSE',
    'RETURN',
    'WRITE_OFF'
);

CREATE TYPE public.notification_type AS ENUM (
    'Request_Approved',
    'Request_Rejected',
    'Request_Disbursed',
    'Return_Reminder',
    'Transport_Assigned',
    'Vendor_Added',
    'Stock_Low',
    'Maintenance_Due',
    'System',
    'RETURN_INITIATED',
    'RETURN_CONFIRMED',
    'WORK_ORDER_CREATED',
    'WORK_ORDER_COST',
    'RETURN_OVERDUE_ESCALATION',
    'RETURN_OVERDUE_URGENT',
    'EXTENSION_REQUESTED',
    'EXTENSION_SUBMITTED',
    'EXTENSION_MANAGER_APPROVED',
    'EXTENSION_PROGRESS',
    'EXTENSION_APPROVED',
    'EXTENSION_REJECTED',
    'REQUEST_APPROVED',
    'REQUEST_REJECTED',
    'REQUEST_DISBURSED',
    'RETURN_OVERDUE',
    'TRANSPORT_ASSIGNED',
    'VENDOR_ADDED',
    'LOW_STOCK_ALERT',
    'GENERAL'
);

CREATE TYPE public.priority_level AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);

CREATE TYPE public.request_status AS ENUM (
    'Pending',
    'Approved',
    'Manager_Approved',
    'Rejected',
    'Cancelled',
    'Completed',
    'On_Hold',
    'Disbursed',
    'Pending_Return',
    'Transferred'
);

CREATE TYPE public.request_type AS ENUM (
    'PPE',
    'Transport',
    'Equipment',
    'Material',
    'Maintenance'
);

CREATE TYPE public.safety_report_type AS ENUM (
    'Incident',
    'Hazard',
    'Near_Miss'
);

CREATE TYPE public.safety_status AS ENUM (
    'Open',
    'In_Progress',
    'Resolved',
    'Closed'
);

CREATE TYPE public.severity_level AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);

CREATE TYPE public.user_role AS ENUM (
    'Field_Engineer',
    'Operator',
    'Technician',
    'Logistics_Coordinator',
    'Workshop_Manager',
    'Operations_Manager',
    'Department_Manager',
    'Safety_Officer',
    'Purchasing_Manager',
    'Purchasing_Officer',
    'Maintenance_Manager',
    'Maintenance_Technician',
    'Admin',
    'IT_Manager',
    'Super_Admin',
    'IT_Support',
    'Staff',
    'Purchasing_Staff',
    'Logistics_Manager',
    'Safety_Manager',
    'Accounts_Manager',
    'Accounts_Staff',
    'HR_Manager'
);

CREATE TYPE public.vehicle_status AS ENUM (
    'Available',
    'In_Use',
    'Maintenance',
    'Retired'
);

CREATE FUNCTION public.generate_job_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE yr VARCHAR(4); seq INTEGER;
BEGIN
  yr := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 'JOB-\d{4}-(\d+)') AS INTEGER)), 0) + 1 INTO seq FROM jobs WHERE job_number LIKE 'JOB-' || yr || '-%';
  RETURN 'JOB-' || yr || '-' || LPAD(seq::TEXT, 4, '0');
END; $$;

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action character varying(50) NOT NULL,
    entity_type character varying(50),
    entity_id uuid,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_email character varying(255),
    user_role character varying(50),
    entity_name character varying(255),
    user_agent text,
    department character varying(100)
);

CREATE TABLE public.additional_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    request_type character varying(50) NOT NULL,
    source character varying(50) NOT NULL,
    equipment_id uuid,
    requested_item_name character varying(255),
    requested_item_specs text,
    quantity integer DEFAULT 1 NOT NULL,
    unit character varying(50) DEFAULT 'Units'::character varying,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    reason text NOT NULL,
    need_by_date date,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    requested_by uuid NOT NULL,
    requested_by_role character varying(50),
    requested_at timestamp without time zone DEFAULT now(),
    supervisor_approved_by uuid,
    supervisor_approved_at timestamp without time zone,
    supervisor_notes text,
    manager_approved_by uuid,
    manager_approved_at timestamp without time zone,
    manager_notes text,
    rejected_by uuid,
    rejected_at timestamp without time zone,
    rejection_reason text,
    created_item_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.damaged_inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    inventory_id uuid,
    item_name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit character varying(50) DEFAULT 'units'::character varying,
    category character varying(100),
    condition character varying(50) NOT NULL,
    reason text,
    reported_by uuid,
    reported_by_name character varying(255),
    confirmed_by uuid,
    confirmed_by_name character varying(255),
    status character varying(50) DEFAULT 'Pending'::character varying,
    resolution_notes text,
    resolved_by uuid,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT damaged_inventory_condition_check CHECK (((condition)::text = ANY ((ARRAY['Damaged'::character varying, 'Lost'::character varying, 'Incomplete'::character varying])::text[]))),
    CONSTRAINT damaged_inventory_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Pending_Verification'::character varying, 'Verified'::character varying, 'Under_Review'::character varying, 'Written_Off'::character varying, 'Repaired'::character varying, 'Replaced'::character varying, 'Resolved'::character varying])::text[])))
);

COMMENT ON TABLE public.damaged_inventory IS 'Tracks items returned as damaged, lost, or with incomplete quantities';

COMMENT ON COLUMN public.damaged_inventory.condition IS 'Damaged = physically damaged, Lost = missing entirely, Incomplete = partial quantity returned';

CREATE TABLE public.disbursements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_id uuid NOT NULL,
    inventory_id uuid,
    request_id uuid,
    quantity integer NOT NULL,
    purpose text,
    status public.disbursement_status DEFAULT 'Pending'::public.disbursement_status,
    approved_by uuid,
    approved_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    serial_number character varying(100) NOT NULL,
    status public.equipment_status DEFAULT 'Available'::public.equipment_status,
    location character varying(255),
    assigned_to uuid,
    current_hours numeric(10,2) DEFAULT 0,
    maintenance_interval_hours numeric(10,2) DEFAULT 500,
    last_maintenance_date date,
    next_maintenance_due numeric(10,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    asset_tag character varying(100),
    owning_department character varying(100) DEFAULT 'Shared'::character varying,
    quantity integer DEFAULT 1,
    cost numeric(12,2),
    is_hidden boolean DEFAULT false,
    hidden_by uuid,
    hidden_at timestamp without time zone,
    hidden_reason text,
    shared_with_departments jsonb DEFAULT '[]'::jsonb,
    type public.equipment_type NOT NULL,
    asset_category public.asset_category DEFAULT 'EQUIPMENT'::public.asset_category NOT NULL
);

COMMENT ON COLUMN public.equipment.owning_department IS 'Department that owns this equipment. Staff/Engineers only see their dept + Shared. Purchasing sees all.';

CREATE TABLE public.equipment_custom_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    asset_category public.asset_category NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
);

CREATE TABLE public.equipment_general_log (
    id integer NOT NULL,
    equipment_id uuid NOT NULL,
    entry_type character varying(50) NOT NULL,
    description text NOT NULL,
    source character varying(50) DEFAULT 'manual'::character varying NOT NULL,
    reference_id uuid,
    reference_type character varying(50),
    created_by uuid NOT NULL,
    user_name character varying(255),
    user_email character varying(255),
    user_role character varying(100),
    user_department character varying(100),
    entry_date timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    location_from character varying(255),
    location_to character varying(255),
    notes text
);

CREATE SEQUENCE public.equipment_general_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.equipment_general_log_id_seq OWNED BY public.equipment_general_log.id;

CREATE TABLE public.equipment_hours_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid,
    hours_added numeric(10,2) NOT NULL,
    job_id uuid,
    notes text,
    logged_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.equipment_maintenance_log (
    id integer NOT NULL,
    equipment_id uuid NOT NULL,
    entry_type character varying(50) NOT NULL,
    description text NOT NULL,
    source character varying(50) DEFAULT 'manual'::character varying NOT NULL,
    maintenance_id uuid,
    created_by uuid NOT NULL,
    user_name character varying(255),
    user_email character varying(255),
    user_role character varying(100),
    user_department character varying(100),
    equipment_hours integer,
    labor_hours numeric(10,2),
    cost numeric(12,2),
    parts_used text,
    entry_date timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    notes text
);

CREATE SEQUENCE public.equipment_maintenance_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.equipment_maintenance_log_id_seq OWNED BY public.equipment_maintenance_log.id;

CREATE TABLE public.equipment_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    asset_category public.asset_category NOT NULL,
    type public.equipment_type,
    custom_type_id uuid,
    serial_number character varying(100),
    quantity integer DEFAULT 1,
    owning_department character varying(100) NOT NULL,
    location character varying(255),
    notes text,
    justification text,
    requested_by uuid NOT NULL,
    requested_at timestamp without time zone DEFAULT now(),
    status public.equipment_request_status DEFAULT 'Pending'::public.equipment_request_status,
    reviewed_by uuid,
    reviewed_at timestamp without time zone,
    review_notes text,
    rejection_reason text,
    cost numeric(12,2),
    equipment_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.field_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    job_title character varying(255) NOT NULL,
    job_location character varying(255) NOT NULL,
    client_name character varying(255) NOT NULL,
    report_date date NOT NULL,
    report_type character varying(100),
    content text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    status character varying(50) DEFAULT 'Submitted'::character varying,
    submitted_by uuid NOT NULL,
    department character varying(100),
    reviewed_by uuid,
    reviewed_at timestamp without time zone,
    review_comments text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    weather_conditions character varying(100),
    crew_count integer,
    equipment_used text,
    issues_encountered text,
    next_day_plan text
);

CREATE TABLE public.inspection_failed_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inspection_id uuid NOT NULL,
    checklist_item_id character varying(100) NOT NULL,
    checklist_item_label character varying(255) NOT NULL,
    resolution character varying(50) NOT NULL,
    engineer_notes text,
    manager_decision character varying(50),
    manager_notes text,
    manager_decision_by uuid,
    manager_decision_at timestamp without time zone,
    maintenance_request_id uuid,
    repair_completed boolean DEFAULT false,
    repair_completed_at timestamp without time zone,
    repair_verified_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

COMMENT ON TABLE public.inspection_failed_items IS 'Individual failed checklist items with manager decisions';

COMMENT ON COLUMN public.inspection_failed_items.resolution IS 'Engineer choice: REPAIR or ACKNOWLEDGE';

COMMENT ON COLUMN public.inspection_failed_items.manager_decision IS 'Manager choice: APPROVED, APPROVED_REPAIR, or REJECTED';

CREATE TABLE public.inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    category public.inventory_category NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    unit character varying(50) DEFAULT 'pieces'::character varying,
    reorder_level integer DEFAULT 10,
    location character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.inventory_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inventory_id uuid NOT NULL,
    alias character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

COMMENT ON TABLE public.inventory_aliases IS 'Maps multiple user-typed names to single inventory items for auto-matching';

CREATE TABLE public.inventory_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inventory_id uuid NOT NULL,
    job_id uuid,
    job_item_id uuid,
    transaction_type character varying(30) NOT NULL,
    quantity integer NOT NULL,
    previous_quantity integer,
    new_quantity integer,
    performed_by uuid NOT NULL,
    performed_by_name character varying(255),
    notes text,
    reference_number character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT inventory_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['DISBURSED'::character varying, 'RETURNED'::character varying, 'RECEIVED'::character varying, 'ADJUSTED'::character varying, 'DAMAGED'::character varying, 'CONSUMED'::character varying, 'EXPIRED'::character varying])::text[])))
);

COMMENT ON TABLE public.inventory_transactions IS 'Audit log for all inventory movements related to jobs';

CREATE VIEW public.inventory_with_usage AS
 SELECT i.id,
    i.name,
    i.category,
    i.quantity,
    i.unit,
    i.reorder_level,
    i.location,
    i.created_at,
    i.updated_at,
    COALESCE(usage.total_disbursed, (0)::bigint) AS total_disbursed,
    COALESCE(usage.total_returned, (0)::bigint) AS total_returned,
    COALESCE(usage.active_jobs, (0)::bigint) AS active_jobs_using
   FROM (public.inventory i
     LEFT JOIN ( SELECT inventory_transactions.inventory_id,
            sum(
                CASE
                    WHEN ((inventory_transactions.transaction_type)::text = 'DISBURSED'::text) THEN abs(inventory_transactions.quantity)
                    ELSE 0
                END) AS total_disbursed,
            sum(
                CASE
                    WHEN ((inventory_transactions.transaction_type)::text = 'RETURNED'::text) THEN abs(inventory_transactions.quantity)
                    ELSE 0
                END) AS total_returned,
            count(DISTINCT inventory_transactions.job_id) FILTER (WHERE ((inventory_transactions.transaction_type)::text = 'DISBURSED'::text)) AS active_jobs
           FROM public.inventory_transactions
          GROUP BY inventory_transactions.inventory_id) usage ON ((i.id = usage.inventory_id)));

CREATE TABLE public.job_equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    equipment_id uuid,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_by uuid,
    return_condition character varying(50),
    return_notes text
);

CREATE TABLE public.job_equipment_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_equipment_item_id uuid NOT NULL,
    job_id uuid,
    action character varying(50) NOT NULL,
    previous_status character varying(50),
    new_status character varying(50),
    performed_by uuid,
    performed_by_name character varying(255),
    performed_by_role character varying(50),
    notes text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.job_equipment_inspections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_equipment_item_id uuid NOT NULL,
    inspected_by uuid NOT NULL,
    inspected_at timestamp without time zone DEFAULT now(),
    signed_off_by uuid,
    signed_off_at timestamp without time zone,
    overall_status character varying(50) DEFAULT 'PENDING'::character varying,
    checklist_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    failed_items jsonb DEFAULT '[]'::jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_draft boolean DEFAULT false,
    submitted_at timestamp without time zone,
    manager_decision character varying(50),
    manager_notes text,
    manager_decision_at timestamp without time zone,
    manager_decision_by uuid,
    signed_all boolean DEFAULT false
);

COMMENT ON COLUMN public.job_equipment_inspections.is_draft IS 'True if inspection is still being filled out (autosave)';

COMMENT ON COLUMN public.job_equipment_inspections.signed_all IS 'True if manager used Sign All button';

CREATE TABLE public.job_equipment_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    source public.equipment_source NOT NULL,
    equipment_id uuid,
    client_equipment_name character varying(255),
    client_equipment_description text,
    requested_item_name character varying(255),
    requested_item_description text,
    requested_item_specs text,
    quantity integer DEFAULT 1,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    notes text,
    status public.job_item_status DEFAULT 'REQUESTED'::public.job_item_status,
    disbursed_at timestamp without time zone,
    disbursed_by uuid,
    disbursement_notes text,
    returned_at timestamp without time zone,
    returned_by uuid,
    return_condition text,
    hours_used numeric(10,2),
    added_by uuid,
    added_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    return_notes text,
    item_type character varying(20) DEFAULT 'EQUIPMENT'::character varying,
    sourcing_started_at timestamp without time zone,
    sourcing_started_by uuid,
    sourcing_notes text,
    estimated_arrival date,
    arrived_at timestamp without time zone,
    arrived_received_by uuid,
    linked_inventory_id uuid,
    vendor_name character varying(255),
    purchase_order_number character varying(100),
    procurement_cost numeric(12,2),
    requested_by uuid,
    requested_by_role character varying(50),
    request_reason text,
    supervisor_approved_at timestamp without time zone,
    supervisor_approved_by uuid,
    supervisor_approval_notes text,
    supervisor_rejected_at timestamp without time zone,
    supervisor_rejection_reason text,
    current_inspection_id uuid,
    inspection_status character varying(50),
    repair_request_id uuid,
    repair_notes text,
    last_inspection_id uuid,
    manager_approved_at timestamp without time zone,
    manager_approved_by uuid,
    manager_approval_notes text,
    manager_rejected_at timestamp without time zone,
    manager_rejected_by uuid,
    manager_rejection_reason text,
    is_consumable boolean DEFAULT false,
    unit character varying(30) DEFAULT 'pieces'::character varying,
    expected_return_date date,
    fulfilled_quantity integer DEFAULT 0,
    linked_by uuid,
    linked_at timestamp without time zone,
    parent_item_id uuid,
    need_by_date date,
    request_type character varying(50) DEFAULT 'ORIGINAL'::character varying,
    approved_quantity integer,
    original_quantity integer,
    partial_approval_reason text,
    rejection_count integer DEFAULT 0,
    last_rejection_reason text,
    resubmission_notes text,
    disposition_type character varying(50),
    site_contact_name character varying(255),
    site_contact_phone character varying(50),
    pickup_reminder_date date,
    post_inspection_id uuid
);

COMMENT ON COLUMN public.job_equipment_items.linked_inventory_id IS 'Links material/tool request to inventory item';

COMMENT ON COLUMN public.job_equipment_items.is_consumable IS 'If true, no return expected (oil, grease, seals, etc.)';

COMMENT ON COLUMN public.job_equipment_items.fulfilled_quantity IS 'For partial fulfillment tracking';

COMMENT ON COLUMN public.job_equipment_items.parent_item_id IS 'For split items during partial fulfillment';

CREATE TABLE public.job_pre_inspections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    job_equipment_item_id uuid NOT NULL,
    equipment_id uuid,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    overall_result character varying(20),
    checklist_results jsonb DEFAULT '{}'::jsonb,
    meter_reading numeric(12,2),
    hours_on_meter numeric(10,2),
    notes text,
    issues_found jsonb DEFAULT '[]'::jsonb,
    inspected_by uuid,
    inspected_by_role character varying(50),
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    approved_by uuid,
    approved_at timestamp without time zone,
    approval_notes text,
    rejected_by uuid,
    rejected_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT job_pre_inspections_overall_result_check CHECK (((overall_result)::text = ANY ((ARRAY['PASS'::character varying, 'FAIL'::character varying, 'CONDITIONAL'::character varying])::text[]))),
    CONSTRAINT job_pre_inspections_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);

CREATE TABLE public.job_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    from_status character varying(50),
    to_status character varying(50) NOT NULL,
    changed_by uuid,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.job_team (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    user_id uuid,
    role_in_job character varying(100),
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_by uuid,
    removed_at timestamp without time zone,
    removal_reason text,
    role public.job_team_role DEFAULT 'ENGINEER'::public.job_team_role,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.job_team_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_team_id uuid,
    job_id uuid,
    user_id uuid,
    action character varying(50) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    performed_by uuid,
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_number character varying(50) NOT NULL,
    client character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    description text,
    start_date date,
    end_date date,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status public.job_status_expanded DEFAULT 'Draft'::public.job_status_expanded,
    approved_by uuid,
    approved_at timestamp without time zone,
    department character varying(100),
    special_requirements text,
    safety_considerations text,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    supervisor_id uuid,
    actual_start_date date,
    actual_end_date date,
    signoff_completed boolean DEFAULT false,
    signoff_at timestamp without time zone,
    signoff_by uuid,
    signoff_notes text,
    submitted_at timestamp without time zone,
    submitted_by uuid,
    started_at timestamp without time zone,
    started_by uuid,
    completed_at timestamp without time zone,
    well_name character varying(255),
    expected_end_date date
);

CREATE TABLE public.maintenance_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    maintenance_id uuid,
    action character varying(50) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    performed_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.maintenance_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid,
    maintenance_type public.maintenance_type NOT NULL,
    performed_by uuid,
    hours_at_maintenance numeric(10,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.maintenance_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    maintenance_id uuid,
    inventory_id uuid,
    quantity integer NOT NULL,
    added_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.maintenance_schedule (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_id uuid,
    maintenance_type character varying(50) NOT NULL,
    description text,
    scheduled_date date NOT NULL,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    status character varying(30) DEFAULT 'Scheduled'::character varying,
    estimated_hours numeric(6,2),
    estimated_cost numeric(12,2),
    assigned_to uuid,
    assigned_by uuid,
    assigned_at timestamp without time zone,
    started_at timestamp without time zone,
    started_by uuid,
    completed_at timestamp without time zone,
    completed_by uuid,
    completion_notes text,
    parts_used jsonb DEFAULT '[]'::jsonb,
    actual_hours numeric(6,2),
    actual_cost numeric(12,2),
    cancelled_at timestamp without time zone,
    cancelled_by uuid,
    cancellation_reason text,
    notes text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    request_id uuid,
    created_from character varying(50) DEFAULT 'manual'::character varying,
    parts_cost numeric(12,2),
    labor_cost numeric(12,2),
    vendor_cost numeric(12,2),
    accounts_final_payment numeric(12,2),
    accounts_payment_date timestamp without time zone,
    accounts_payment_notes text,
    accounts_recorded_by uuid
);

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    executed_at timestamp without time zone DEFAULT now()
);

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    reference_type character varying(50),
    reference_id uuid,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    priority character varying(20) DEFAULT 'normal'::character varying,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.post_job_inspections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_equipment_item_id uuid NOT NULL,
    job_id uuid NOT NULL,
    inspected_by uuid NOT NULL,
    inspected_by_name character varying(255),
    inspected_by_role character varying(50),
    inspected_at timestamp without time zone DEFAULT now(),
    physical_condition character varying(50) NOT NULL,
    functional_status character varying(50) NOT NULL,
    components_complete boolean DEFAULT true,
    components_notes text,
    hours_used numeric(10,2),
    meter_reading numeric(10,2),
    cleaning_status character varying(50),
    has_damage boolean DEFAULT false,
    damage_description text,
    damage_photos jsonb,
    disposition character varying(50) NOT NULL,
    site_contact_name character varying(255),
    site_contact_phone character varying(50),
    pickup_reminder_date date,
    notes text,
    requires_manager_review boolean DEFAULT false,
    manager_reviewed_by uuid,
    manager_reviewed_at timestamp without time zone,
    manager_notes text,
    manager_decision character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid,
    po_number character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'Draft'::character varying,
    items jsonb DEFAULT '[]'::jsonb,
    subtotal numeric(12,2),
    tax numeric(12,2),
    shipping numeric(12,2),
    total_amount numeric(12,2),
    order_date date,
    expected_delivery date,
    received_date date,
    approved_by uuid,
    approved_at timestamp without time zone,
    notes text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.request_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    from_department character varying(100),
    to_department character varying(100),
    comments text,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.request_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    changed_by uuid,
    old_status public.request_status,
    new_status public.request_status,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_id uuid NOT NULL,
    type public.request_type NOT NULL,
    status public.request_status DEFAULT 'Pending'::public.request_status,
    priority public.priority_level DEFAULT 'Medium'::public.priority_level,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    date_needed date,
    job_id uuid,
    approved_by uuid,
    approved_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estimated_value numeric(12,2),
    transferred_from_dept character varying(100),
    transfer_reason text,
    transferred_to character varying(100),
    transferred_at timestamp without time zone,
    transfer_notes text,
    expected_return_date timestamp without time zone,
    is_active boolean DEFAULT true,
    disbursed_without_approval boolean DEFAULT false,
    disbursement_notes text,
    disbursed_by uuid,
    disbursed_at timestamp without time zone,
    return_initiated_at timestamp without time zone,
    return_confirmed_at timestamp without time zone,
    return_confirmed_by uuid,
    return_condition character varying(50),
    return_notes text,
    maintenance_category character varying(50),
    maintenance_routes_to character varying(50),
    maintenance_other_description text,
    disbursed_items jsonb DEFAULT '[]'::jsonb,
    return_items jsonb,
    overdue_reminder_sent boolean DEFAULT false,
    manager_reminder_sent boolean DEFAULT false,
    has_pending_extension boolean DEFAULT false,
    extension_count integer DEFAULT 0,
    manager_cost_estimate numeric(12,2),
    purchasing_final_cost numeric(12,2),
    work_order_id uuid,
    notes text
);

COMMENT ON COLUMN public.requests.disbursed_items IS 'JSON array of {inventoryId, inventoryName, quantity, isConsumable, returnDate} for tracking disbursed inventory';

COMMENT ON COLUMN public.requests.return_items IS 'Per-item return conditions reported by engineer';

COMMENT ON COLUMN public.requests.manager_cost_estimate IS 'Cost estimate added by manager during approval (in Naira)';

COMMENT ON COLUMN public.requests.purchasing_final_cost IS 'Final cost determined by Purchasing department';

COMMENT ON COLUMN public.requests.work_order_id IS 'Reference to work order created from this maintenance request';

CREATE TABLE public.return_extensions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    item_index integer,
    item_name character varying(255),
    current_return_date date NOT NULL,
    requested_return_date date NOT NULL,
    reason text NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    requested_by uuid NOT NULL,
    manager_approved_by uuid,
    manager_approved_at timestamp without time zone,
    manager_decision character varying(20),
    manager_notes text,
    purchasing_approved_by uuid,
    purchasing_approved_at timestamp without time zone,
    purchasing_decision character varying(20),
    purchasing_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT return_extensions_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Manager_Approved'::character varying, 'Approved'::character varying, 'Rejected'::character varying, 'Cancelled'::character varying])::text[])))
);

CREATE TABLE public.safety_report_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid,
    changed_by uuid,
    old_status public.safety_status,
    new_status public.safety_status,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.safety_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid,
    type public.safety_report_type NOT NULL,
    severity public.severity_level NOT NULL,
    status public.safety_status DEFAULT 'Open'::public.safety_status,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    location character varying(255) NOT NULL,
    incident_date date,
    is_anonymous boolean DEFAULT false,
    assigned_to uuid,
    resolution text,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.stock_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inventory_id uuid,
    movement_type public.movement_type NOT NULL,
    quantity integer NOT NULL,
    reference_id uuid,
    notes text,
    performed_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.swap_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    current_item_id uuid,
    current_item_condition character varying(50),
    current_item_disposition character varying(50),
    replacement_item_id uuid,
    replacement_source character varying(50),
    swap_reason text NOT NULL,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    requested_by uuid NOT NULL,
    requested_by_role character varying(50),
    requested_at timestamp without time zone DEFAULT now(),
    supervisor_approved_by uuid,
    supervisor_approved_at timestamp without time zone,
    supervisor_notes text,
    manager_approved_by uuid,
    manager_approved_at timestamp without time zone,
    manager_notes text,
    pickup_arranged_by uuid,
    pickup_arranged_at timestamp without time zone,
    pickup_notes text,
    completed_at timestamp without time zone,
    completed_by uuid,
    completion_notes text,
    rejected_by uuid,
    rejected_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.token_denylist (
    jti uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    denied_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.transport_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    driver_id uuid,
    vehicle_id uuid,
    assigned_by uuid,
    assigned_at timestamp without time zone DEFAULT now(),
    trip_started_at timestamp without time zone,
    trip_completed_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    role public.user_role NOT NULL,
    department public.department NOT NULL,
    phone character varying(20),
    employee_id character varying(50),
    is_active boolean DEFAULT true,
    must_change_password boolean DEFAULT true,
    reset_token_hash character varying(255),
    reset_token_expires timestamp without time zone,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_driver boolean DEFAULT false
);

CREATE TABLE public.vehicles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    plate_number character varying(20) NOT NULL,
    type character varying(50) NOT NULL,
    status public.vehicle_status DEFAULT 'Available'::public.vehicle_status,
    vendor_id uuid,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    make character varying(100),
    model character varying(100),
    year integer,
    fuel_type character varying(50) DEFAULT 'Diesel'::character varying,
    mileage integer DEFAULT 0,
    assigned_driver_id uuid,
    last_service_date timestamp without time zone
);

COMMENT ON TABLE public.vehicles IS 'Fleet vehicles table - updated schema';

CREATE TABLE public.vendor_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid,
    rating integer NOT NULL,
    review text,
    reviewed_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendor_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying,
    contact_person character varying(100),
    contact_email character varying(255),
    contact_phone character varying(50),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100) DEFAULT 'Nigeria'::character varying,
    postal_code character varying(20),
    tax_id character varying(50),
    payment_terms character varying(20) DEFAULT 'Net 30'::character varying,
    rating numeric(3,2),
    notes text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);

ALTER TABLE ONLY public.equipment_general_log ALTER COLUMN id SET DEFAULT nextval('public.equipment_general_log_id_seq'::regclass);

ALTER TABLE ONLY public.equipment_maintenance_log ALTER COLUMN id SET DEFAULT nextval('public.equipment_maintenance_log_id_seq'::regclass);

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.damaged_inventory
    ADD CONSTRAINT damaged_inventory_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.disbursements
    ADD CONSTRAINT disbursements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment_custom_types
    ADD CONSTRAINT equipment_custom_types_name_asset_category_key UNIQUE (name, asset_category);

ALTER TABLE ONLY public.equipment_custom_types
    ADD CONSTRAINT equipment_custom_types_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment_general_log
    ADD CONSTRAINT equipment_general_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment_hours_log
    ADD CONSTRAINT equipment_hours_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment_maintenance_log
    ADD CONSTRAINT equipment_maintenance_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment_requests
    ADD CONSTRAINT equipment_requests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_serial_number_key UNIQUE (serial_number);

ALTER TABLE ONLY public.field_reports
    ADD CONSTRAINT field_reports_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.inspection_failed_items
    ADD CONSTRAINT inspection_failed_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.inventory_aliases
    ADD CONSTRAINT inventory_aliases_inventory_id_alias_key UNIQUE (inventory_id, alias);

ALTER TABLE ONLY public.inventory_aliases
    ADD CONSTRAINT inventory_aliases_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_equipment_history
    ADD CONSTRAINT job_equipment_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_equipment_inspections
    ADD CONSTRAINT job_equipment_inspections_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_equipment
    ADD CONSTRAINT job_equipment_job_id_equipment_id_key UNIQUE (job_id, equipment_id);

ALTER TABLE ONLY public.job_equipment
    ADD CONSTRAINT job_equipment_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_pre_inspections
    ADD CONSTRAINT job_pre_inspections_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_status_history
    ADD CONSTRAINT job_status_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_team_audit
    ADD CONSTRAINT job_team_audit_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_team
    ADD CONSTRAINT job_team_job_id_user_id_key UNIQUE (job_id, user_id);

ALTER TABLE ONLY public.job_team
    ADD CONSTRAINT job_team_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_job_number_key UNIQUE (job_number);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.maintenance_history
    ADD CONSTRAINT maintenance_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.maintenance_log
    ADD CONSTRAINT maintenance_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.maintenance_parts
    ADD CONSTRAINT maintenance_parts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.post_job_inspections
    ADD CONSTRAINT post_job_inspections_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_po_number_key UNIQUE (po_number);

ALTER TABLE ONLY public.request_approvals
    ADD CONSTRAINT request_approvals_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.request_history
    ADD CONSTRAINT request_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.return_extensions
    ADD CONSTRAINT return_extensions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.safety_report_history
    ADD CONSTRAINT safety_report_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.safety_reports
    ADD CONSTRAINT safety_reports_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.token_denylist
    ADD CONSTRAINT token_denylist_pkey PRIMARY KEY (jti);

ALTER TABLE ONLY public.transport_assignments
    ADD CONSTRAINT transport_assignments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_number_key UNIQUE (plate_number);

ALTER TABLE ONLY public.vendor_reviews
    ADD CONSTRAINT vendor_reviews_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);

CREATE INDEX idx_activity_created ON public.activity_logs USING btree (created_at);

CREATE INDEX idx_activity_entity ON public.activity_logs USING btree (entity_type, entity_id);

CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action);

CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at DESC);

CREATE INDEX idx_activity_logs_department ON public.activity_logs USING btree (department);

CREATE INDEX idx_activity_logs_dept_created ON public.activity_logs USING btree (department, created_at DESC);

CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id);

CREATE INDEX idx_activity_logs_user ON public.activity_logs USING btree (user_id);

CREATE INDEX idx_activity_logs_user_created ON public.activity_logs USING btree (user_id, created_at DESC);

CREATE INDEX idx_activity_user ON public.activity_logs USING btree (user_id);

CREATE INDEX idx_additional_requests_job ON public.additional_requests USING btree (job_id);

CREATE INDEX idx_additional_requests_status ON public.additional_requests USING btree (status);

CREATE INDEX idx_custom_types_active ON public.equipment_custom_types USING btree (is_active);

CREATE INDEX idx_custom_types_category ON public.equipment_custom_types USING btree (asset_category);

CREATE INDEX idx_damaged_inventory_condition ON public.damaged_inventory USING btree (condition);

CREATE INDEX idx_damaged_inventory_created ON public.damaged_inventory USING btree (created_at DESC);

CREATE INDEX idx_damaged_inventory_item_name ON public.damaged_inventory USING btree (item_name);

CREATE INDEX idx_damaged_inventory_request ON public.damaged_inventory USING btree (request_id);

CREATE INDEX idx_damaged_inventory_request_id ON public.damaged_inventory USING btree (request_id);

CREATE INDEX idx_damaged_inventory_status ON public.damaged_inventory USING btree (status);

CREATE INDEX idx_disbursements_requester ON public.disbursements USING btree (requester_id);

CREATE INDEX idx_disbursements_status ON public.disbursements USING btree (status);

CREATE INDEX idx_equip_history_item ON public.job_equipment_history USING btree (job_equipment_item_id);

CREATE INDEX idx_equip_history_job ON public.job_equipment_history USING btree (job_id);

CREATE INDEX idx_equipment_asset_category ON public.equipment USING btree (asset_category);

CREATE INDEX idx_equipment_general_log_date ON public.equipment_general_log USING btree (entry_date DESC);

CREATE INDEX idx_equipment_general_log_equipment ON public.equipment_general_log USING btree (equipment_id);

CREATE INDEX idx_equipment_general_log_source ON public.equipment_general_log USING btree (source);

CREATE INDEX idx_equipment_general_log_type ON public.equipment_general_log USING btree (entry_type);

CREATE INDEX idx_equipment_history_item ON public.job_equipment_history USING btree (job_equipment_item_id);

CREATE INDEX idx_equipment_history_job ON public.job_equipment_history USING btree (job_id);

CREATE INDEX idx_equipment_hours ON public.equipment USING btree (current_hours);

CREATE INDEX idx_equipment_is_hidden ON public.equipment USING btree (is_hidden);

CREATE INDEX idx_equipment_maintenance_log_date ON public.equipment_maintenance_log USING btree (entry_date DESC);

CREATE INDEX idx_equipment_maintenance_log_equipment ON public.equipment_maintenance_log USING btree (equipment_id);

CREATE INDEX idx_equipment_maintenance_log_maintenance ON public.equipment_maintenance_log USING btree (maintenance_id);

CREATE INDEX idx_equipment_maintenance_log_type ON public.equipment_maintenance_log USING btree (entry_type);

CREATE INDEX idx_equipment_owning_department ON public.equipment USING btree (owning_department);

CREATE INDEX idx_equipment_requests_dept ON public.equipment_requests USING btree (owning_department);

CREATE INDEX idx_equipment_requests_requester ON public.equipment_requests USING btree (requested_by);

CREATE INDEX idx_equipment_requests_status ON public.equipment_requests USING btree (status);

CREATE INDEX idx_equipment_serial ON public.equipment USING btree (serial_number);

CREATE UNIQUE INDEX idx_equipment_serial_number ON public.equipment USING btree (serial_number) WHERE (serial_number IS NOT NULL);

CREATE INDEX idx_equipment_shared ON public.equipment USING gin (shared_with_departments);

CREATE INDEX idx_equipment_status ON public.equipment USING btree (status);

CREATE INDEX idx_equipment_type ON public.equipment USING btree (type);

CREATE INDEX idx_failed_items_decision ON public.inspection_failed_items USING btree (manager_decision);

CREATE INDEX idx_failed_items_inspection ON public.inspection_failed_items USING btree (inspection_id);

CREATE INDEX idx_field_reports_date ON public.field_reports USING btree (report_date DESC);

CREATE INDEX idx_field_reports_job ON public.field_reports USING btree (job_id);

CREATE INDEX idx_field_reports_status ON public.field_reports USING btree (status);

CREATE INDEX idx_field_reports_submitted_by ON public.field_reports USING btree (submitted_by);

CREATE INDEX idx_hours_log_equipment ON public.equipment_hours_log USING btree (equipment_id);

CREATE INDEX idx_inspections_draft ON public.job_equipment_inspections USING btree (is_draft);

CREATE INDEX idx_inspections_item_id ON public.job_equipment_inspections USING btree (job_equipment_item_id);

CREATE INDEX idx_inspections_status ON public.job_equipment_inspections USING btree (overall_status);

CREATE INDEX idx_inspections_submitted ON public.job_equipment_inspections USING btree (submitted_at);

CREATE INDEX idx_inv_trans_date ON public.inventory_transactions USING btree (created_at DESC);

CREATE INDEX idx_inv_trans_inventory ON public.inventory_transactions USING btree (inventory_id);

CREATE INDEX idx_inv_trans_job ON public.inventory_transactions USING btree (job_id);

CREATE INDEX idx_inv_trans_job_item ON public.inventory_transactions USING btree (job_item_id);

CREATE INDEX idx_inv_trans_type ON public.inventory_transactions USING btree (transaction_type);

CREATE INDEX idx_inventory_aliases_alias ON public.inventory_aliases USING btree (lower((alias)::text));

CREATE INDEX idx_inventory_aliases_inventory_id ON public.inventory_aliases USING btree (inventory_id);

CREATE INDEX idx_inventory_category ON public.inventory USING btree (category);

CREATE INDEX idx_inventory_low_stock ON public.inventory USING btree (quantity, reorder_level);

CREATE INDEX idx_inventory_quantity ON public.inventory USING btree (quantity);

CREATE INDEX idx_job_equipment_equipment ON public.job_equipment USING btree (equipment_id);

CREATE INDEX idx_job_equipment_job ON public.job_equipment USING btree (job_id);

CREATE INDEX idx_job_equipment_job_id ON public.job_equipment_items USING btree (job_id);

CREATE INDEX idx_job_status_history_job ON public.job_status_history USING btree (job_id);

CREATE INDEX idx_job_team_audit_job ON public.job_team_audit USING btree (job_id);

CREATE INDEX idx_job_team_audit_user ON public.job_team_audit USING btree (user_id);

CREATE INDEX idx_job_team_job ON public.job_team USING btree (job_id);

CREATE INDEX idx_job_team_job_id ON public.job_team USING btree (job_id);

CREATE INDEX idx_job_team_user ON public.job_team USING btree (user_id);

CREATE INDEX idx_jobs_client ON public.jobs USING btree (client);

CREATE INDEX idx_jobs_created_by ON public.jobs USING btree (created_by);

CREATE INDEX idx_jobs_dates ON public.jobs USING btree (start_date, end_date);

CREATE INDEX idx_jobs_number ON public.jobs USING btree (job_number);

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);

CREATE INDEX idx_jobs_supervisor ON public.jobs USING btree (supervisor_id);

CREATE INDEX idx_maintenance_accounts_payment ON public.maintenance_schedule USING btree (accounts_payment_date) WHERE (accounts_final_payment IS NOT NULL);

CREATE INDEX idx_maintenance_assigned ON public.maintenance_schedule USING btree (assigned_to);

CREATE INDEX idx_maintenance_completed_at ON public.maintenance_schedule USING btree (completed_at) WHERE ((status)::text = 'Completed'::text);

CREATE INDEX idx_maintenance_due ON public.maintenance_schedule USING btree (scheduled_date, status) WHERE ((status)::text = ANY ((ARRAY['Scheduled'::character varying, 'Overdue'::character varying])::text[]));

CREATE INDEX idx_maintenance_equipment ON public.maintenance_schedule USING btree (equipment_id);

CREATE INDEX idx_maintenance_log_equipment ON public.maintenance_log USING btree (equipment_id);

CREATE INDEX idx_maintenance_schedule_request ON public.maintenance_schedule USING btree (request_id);

CREATE INDEX idx_maintenance_scheduled ON public.maintenance_schedule USING btree (scheduled_date);

CREATE INDEX idx_maintenance_status ON public.maintenance_schedule USING btree (status);

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, is_read);

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);

CREATE INDEX idx_notifications_user_read_created ON public.notifications USING btree (user_id, is_read, created_at DESC);

CREATE INDEX idx_po_number ON public.purchase_orders USING btree (po_number);

CREATE INDEX idx_po_status ON public.purchase_orders USING btree (status);

CREATE INDEX idx_po_vendor ON public.purchase_orders USING btree (vendor_id);

CREATE INDEX idx_post_job_inspections_item ON public.post_job_inspections USING btree (job_equipment_item_id);

CREATE INDEX idx_post_job_inspections_job ON public.post_job_inspections USING btree (job_id);

CREATE INDEX idx_pre_inspections_item ON public.job_pre_inspections USING btree (job_equipment_item_id);

CREATE INDEX idx_pre_inspections_job ON public.job_pre_inspections USING btree (job_id);

CREATE INDEX idx_pre_inspections_status ON public.job_pre_inspections USING btree (status);

CREATE INDEX idx_request_approvals_request ON public.request_approvals USING btree (request_id);

CREATE INDEX idx_request_history_request ON public.request_history USING btree (request_id);

CREATE INDEX idx_requests_created ON public.requests USING btree (created_at);

CREATE INDEX idx_requests_disbursed_items ON public.requests USING gin (disbursed_items);

CREATE INDEX idx_requests_expected_return_date ON public.requests USING btree (expected_return_date) WHERE ((status = 'Disbursed'::public.request_status) AND (expected_return_date IS NOT NULL));

CREATE INDEX idx_requests_priority ON public.requests USING btree (priority);

CREATE INDEX idx_requests_requester ON public.requests USING btree (requester_id);

CREATE INDEX idx_requests_status ON public.requests USING btree (status);

CREATE INDEX idx_requests_status_created ON public.requests USING btree (status, created_at DESC);

CREATE INDEX idx_requests_status_type ON public.requests USING btree (status, type) WHERE (status = 'Manager_Approved'::public.request_status);

CREATE INDEX idx_requests_type ON public.requests USING btree (type);

CREATE INDEX idx_return_extensions_request ON public.return_extensions USING btree (request_id);

CREATE INDEX idx_return_extensions_requested_by ON public.return_extensions USING btree (requested_by);

CREATE INDEX idx_return_extensions_status ON public.return_extensions USING btree (status);

CREATE INDEX idx_safety_created ON public.safety_reports USING btree (created_at);

CREATE INDEX idx_safety_history_report ON public.safety_report_history USING btree (report_id);

CREATE INDEX idx_safety_reporter ON public.safety_reports USING btree (reporter_id);

CREATE INDEX idx_safety_severity ON public.safety_reports USING btree (severity);

CREATE INDEX idx_safety_status ON public.safety_reports USING btree (status);

CREATE INDEX idx_safety_type ON public.safety_reports USING btree (type);

CREATE INDEX idx_stock_movements_inventory ON public.stock_movements USING btree (inventory_id);

CREATE INDEX idx_swap_requests_job ON public.swap_requests USING btree (job_id);

CREATE INDEX idx_swap_requests_status ON public.swap_requests USING btree (status);

CREATE INDEX idx_token_denylist_expires ON public.token_denylist USING btree (expires_at);

CREATE INDEX idx_transport_request ON public.transport_assignments USING btree (request_id);

CREATE INDEX idx_users_active ON public.users USING btree (is_active);

CREATE INDEX idx_users_department ON public.users USING btree (department);

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE INDEX idx_users_role ON public.users USING btree (role);

CREATE INDEX idx_vehicles_status ON public.vehicles USING btree (status);

CREATE INDEX idx_vendor_reviews ON public.vendor_reviews USING btree (vendor_id);

CREATE INDEX idx_vendors_category ON public.vendors USING btree (category);

CREATE INDEX idx_vendors_name ON public.vendors USING btree (name);

CREATE INDEX idx_vendors_status ON public.vendors USING btree (status);

CREATE TRIGGER disbursements_updated_at BEFORE UPDATE ON public.disbursements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER safety_updated_at BEFORE UPDATE ON public.safety_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_created_item_id_fkey FOREIGN KEY (created_item_id) REFERENCES public.job_equipment_items(id);

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_manager_approved_by_fkey FOREIGN KEY (manager_approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.additional_requests
    ADD CONSTRAINT additional_requests_supervisor_approved_by_fkey FOREIGN KEY (supervisor_approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.damaged_inventory
    ADD CONSTRAINT damaged_inventory_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.damaged_inventory
    ADD CONSTRAINT damaged_inventory_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.damaged_inventory
    ADD CONSTRAINT damaged_inventory_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.damaged_inventory
    ADD CONSTRAINT damaged_inventory_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.damaged_inventory
    ADD CONSTRAINT damaged_inventory_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.disbursements
    ADD CONSTRAINT disbursements_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.disbursements
    ADD CONSTRAINT disbursements_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);

ALTER TABLE ONLY public.disbursements
    ADD CONSTRAINT disbursements_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id);

ALTER TABLE ONLY public.disbursements
    ADD CONSTRAINT disbursements_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment_custom_types
    ADD CONSTRAINT equipment_custom_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment_general_log
    ADD CONSTRAINT equipment_general_log_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment_general_log
    ADD CONSTRAINT equipment_general_log_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_hidden_by_fkey FOREIGN KEY (hidden_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment_hours_log
    ADD CONSTRAINT equipment_hours_log_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.equipment_hours_log
    ADD CONSTRAINT equipment_hours_log_logged_by_fkey FOREIGN KEY (logged_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment_maintenance_log
    ADD CONSTRAINT equipment_maintenance_log_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment_maintenance_log
    ADD CONSTRAINT equipment_maintenance_log_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.equipment_maintenance_log
    ADD CONSTRAINT equipment_maintenance_log_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_schedule(id);

ALTER TABLE ONLY public.equipment_requests
    ADD CONSTRAINT equipment_requests_custom_type_id_fkey FOREIGN KEY (custom_type_id) REFERENCES public.equipment_custom_types(id);

ALTER TABLE ONLY public.equipment_requests
    ADD CONSTRAINT equipment_requests_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);

ALTER TABLE ONLY public.equipment_requests
    ADD CONSTRAINT equipment_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.equipment_requests
    ADD CONSTRAINT equipment_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.field_reports
    ADD CONSTRAINT field_reports_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.field_reports
    ADD CONSTRAINT field_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.field_reports
    ADD CONSTRAINT field_reports_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.inspection_failed_items
    ADD CONSTRAINT inspection_failed_items_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.job_equipment_inspections(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.inspection_failed_items
    ADD CONSTRAINT inspection_failed_items_maintenance_request_id_fkey FOREIGN KEY (maintenance_request_id) REFERENCES public.requests(id);

ALTER TABLE ONLY public.inspection_failed_items
    ADD CONSTRAINT inspection_failed_items_manager_decision_by_fkey FOREIGN KEY (manager_decision_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.inspection_failed_items
    ADD CONSTRAINT inspection_failed_items_repair_verified_by_fkey FOREIGN KEY (repair_verified_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.inventory_aliases
    ADD CONSTRAINT inventory_aliases_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_job_item_id_fkey FOREIGN KEY (job_item_id) REFERENCES public.job_equipment_items(id);

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment
    ADD CONSTRAINT job_equipment_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment
    ADD CONSTRAINT job_equipment_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_equipment_history
    ADD CONSTRAINT job_equipment_history_job_equipment_item_id_fkey FOREIGN KEY (job_equipment_item_id) REFERENCES public.job_equipment_items(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_equipment_history
    ADD CONSTRAINT job_equipment_history_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);

ALTER TABLE ONLY public.job_equipment_history
    ADD CONSTRAINT job_equipment_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_inspections
    ADD CONSTRAINT job_equipment_inspections_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_inspections
    ADD CONSTRAINT job_equipment_inspections_job_equipment_item_id_fkey FOREIGN KEY (job_equipment_item_id) REFERENCES public.job_equipment_items(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_equipment_inspections
    ADD CONSTRAINT job_equipment_inspections_manager_decision_by_fkey FOREIGN KEY (manager_decision_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_inspections
    ADD CONSTRAINT job_equipment_inspections_signed_off_by_fkey FOREIGN KEY (signed_off_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_disbursed_by_fkey FOREIGN KEY (disbursed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_last_inspection_id_fkey FOREIGN KEY (last_inspection_id) REFERENCES public.job_equipment_inspections(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_linked_by_fkey FOREIGN KEY (linked_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_manager_approved_by_fkey FOREIGN KEY (manager_approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_manager_rejected_by_fkey FOREIGN KEY (manager_rejected_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_parent_item_id_fkey FOREIGN KEY (parent_item_id) REFERENCES public.job_equipment_items(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_repair_request_id_fkey FOREIGN KEY (repair_request_id) REFERENCES public.requests(id);

ALTER TABLE ONLY public.job_equipment_items
    ADD CONSTRAINT job_equipment_items_returned_by_fkey FOREIGN KEY (returned_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_equipment
    ADD CONSTRAINT job_equipment_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_pre_inspections
    ADD CONSTRAINT job_pre_inspections_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_pre_inspections
    ADD CONSTRAINT job_pre_inspections_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);

ALTER TABLE ONLY public.job_pre_inspections
    ADD CONSTRAINT job_pre_inspections_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_pre_inspections
    ADD CONSTRAINT job_pre_inspections_job_equipment_item_id_fkey FOREIGN KEY (job_equipment_item_id) REFERENCES public.job_equipment_items(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_pre_inspections
    ADD CONSTRAINT job_pre_inspections_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_pre_inspections
    ADD CONSTRAINT job_pre_inspections_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_status_history
    ADD CONSTRAINT job_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_status_history
    ADD CONSTRAINT job_status_history_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_team
    ADD CONSTRAINT job_team_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_team_audit
    ADD CONSTRAINT job_team_audit_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_team_audit
    ADD CONSTRAINT job_team_audit_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_team_audit
    ADD CONSTRAINT job_team_audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.job_team
    ADD CONSTRAINT job_team_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_team
    ADD CONSTRAINT job_team_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_signoff_by_fkey FOREIGN KEY (signoff_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_started_by_fkey FOREIGN KEY (started_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_history
    ADD CONSTRAINT maintenance_history_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_schedule(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.maintenance_history
    ADD CONSTRAINT maintenance_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_log
    ADD CONSTRAINT maintenance_log_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.maintenance_log
    ADD CONSTRAINT maintenance_log_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_parts
    ADD CONSTRAINT maintenance_parts_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_parts
    ADD CONSTRAINT maintenance_parts_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);

ALTER TABLE ONLY public.maintenance_parts
    ADD CONSTRAINT maintenance_parts_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_schedule(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_accounts_recorded_by_fkey FOREIGN KEY (accounts_recorded_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_started_by_fkey FOREIGN KEY (started_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.post_job_inspections
    ADD CONSTRAINT post_job_inspections_inspected_by_fkey FOREIGN KEY (inspected_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.post_job_inspections
    ADD CONSTRAINT post_job_inspections_job_equipment_item_id_fkey FOREIGN KEY (job_equipment_item_id) REFERENCES public.job_equipment_items(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.post_job_inspections
    ADD CONSTRAINT post_job_inspections_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.post_job_inspections
    ADD CONSTRAINT post_job_inspections_manager_reviewed_by_fkey FOREIGN KEY (manager_reviewed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);

ALTER TABLE ONLY public.request_approvals
    ADD CONSTRAINT request_approvals_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.request_approvals
    ADD CONSTRAINT request_approvals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.request_history
    ADD CONSTRAINT request_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.request_history
    ADD CONSTRAINT request_history_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_disbursed_by_fkey FOREIGN KEY (disbursed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_return_confirmed_by_fkey FOREIGN KEY (return_confirmed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.return_extensions
    ADD CONSTRAINT return_extensions_manager_approved_by_fkey FOREIGN KEY (manager_approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.return_extensions
    ADD CONSTRAINT return_extensions_purchasing_approved_by_fkey FOREIGN KEY (purchasing_approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.return_extensions
    ADD CONSTRAINT return_extensions_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.return_extensions
    ADD CONSTRAINT return_extensions_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.safety_report_history
    ADD CONSTRAINT safety_report_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.safety_report_history
    ADD CONSTRAINT safety_report_history_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.safety_reports(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.safety_reports
    ADD CONSTRAINT safety_reports_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);

ALTER TABLE ONLY public.safety_reports
    ADD CONSTRAINT safety_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_current_item_id_fkey FOREIGN KEY (current_item_id) REFERENCES public.job_equipment_items(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_manager_approved_by_fkey FOREIGN KEY (manager_approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_pickup_arranged_by_fkey FOREIGN KEY (pickup_arranged_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_replacement_item_id_fkey FOREIGN KEY (replacement_item_id) REFERENCES public.job_equipment_items(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.swap_requests
    ADD CONSTRAINT swap_requests_supervisor_approved_by_fkey FOREIGN KEY (supervisor_approved_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.transport_assignments
    ADD CONSTRAINT transport_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.transport_assignments
    ADD CONSTRAINT transport_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.transport_assignments
    ADD CONSTRAINT transport_assignments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.transport_assignments
    ADD CONSTRAINT transport_assignments_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_assigned_driver_id_fkey FOREIGN KEY (assigned_driver_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);

ALTER TABLE ONLY public.vendor_reviews
    ADD CONSTRAINT vendor_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.vendor_reviews
    ADD CONSTRAINT vendor_reviews_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
