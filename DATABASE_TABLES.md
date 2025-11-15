# Database Tables Documentation

## Survey Tables

### employee_survey_responses
Main table storing all survey responses from employees.

**Key Columns:**
- `id` (uuid) - Primary key
- `session_id` (text) - Unique session identifier for anonymity
- `configuration_id` (uuid) - Links to survey configuration used
- `continent` (text) - Employee's continent
- `division` (text) - Employee's division
- `role` (text) - Employee's role
- `responses_jsonb` (jsonb) - Dynamic survey responses in JSON format
- `is_draft` (boolean) - Whether response is a draft or submitted
- `consent_given` (boolean) - GDPR consent flag
- `consent_timestamp` (timestamp) - When consent was given
- `consent_ip_hash` (text) - Hashed IP for compliance
- `data_retention_date` (timestamp) - When data should be deleted (12 months)
- `deleted_at` (timestamp) - Soft delete timestamp
- `completion_time_seconds` (integer) - Time taken to complete survey
- `submitted_at` (timestamp) - Submission timestamp
- `last_autosave_at` (timestamp) - Last autosave timestamp

**Legacy Columns (from previous fixed schema):**
- Various rating columns (1-5 scale): `job_satisfaction`, `work_life_balance`, `training_satisfaction`, etc.
- Array columns: `communication_preferences`, `motivation_factors`, `information_preferences`
- Text columns: `additional_comments`, `collaboration_feedback`

### survey_configurations
Defines different survey configurations with enabled question types.

**Key Columns:**
- `id` (uuid) - Primary key
- `name` (text) - Configuration name
- `description` (text) - Configuration description
- `is_active` (boolean) - Whether this configuration is currently active
- `enabled_question_types` (jsonb) - Which question types are enabled
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp

### survey_question_config
Stores all possible survey questions with multilingual support.

**Key Columns:**
- `id` (text) - Unique question identifier (e.g., 'continent', 'job-satisfaction')
- `question_type` (text) - Type: 'demographic', 'rating', 'multiselect', 'text'
- `section` (text) - Question section/category
- `display_order` (integer) - Order in which question appears
- `labels` (jsonb) - Multilingual labels (en, es, fr, etc.)
- `options` (jsonb) - Question options/choices
- `allow_na` (boolean) - Whether N/A option is available
- `is_required` (boolean) - Whether question is mandatory
- `is_enabled` (boolean) - Whether question is active
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp

---

## Employee & HR Tables

### Employee_id
Microsoft Entra ID employee data sync.

**Key Columns:**
- `employee_id` (uuid) - Primary key
- `user_id` (uuid) - Nullable link to auth user
- `userPrincipalName` (text) - Email/UPN
- `displayName` (text) - Full name
- `givenName` (text) - First name
- `surname` (text) - Last name
- `department` (text) - Department
- `jobTitle` (text) - Job title
- `officeLocation` (text) - Office location
- `city`, `state`, `country` (text) - Location info
- `mobilePhone`, `telephoneNumber` (text) - Contact info

### employees
Local employee records for attendance tracking.

**Key Columns:**
- `id` (uuid) - Primary key
- `employee_id` (text) - Employee identifier
- `first_name`, `last_name` (text) - Name
- `email` (text) - Email address
- `department` (text) - Department
- `position` (text) - Job position
- `employment_type` (text) - Full-time, part-time, etc.
- `hire_date` (date) - Hire date
- `is_active` (boolean) - Active status

### attendance_records
Daily attendance tracking with clock in/out.

**Key Columns:**
- `id` (uuid) - Primary key
- `employee_id` (uuid) - Foreign key to employees
- `date` (date) - Attendance date
- `clock_in`, `clock_out` (timestamp) - Clock times
- `scheduled_start`, `scheduled_end` (timestamp) - Scheduled times
- `violation_type` (text) - Type of violation if any
- `points_assessed` (numeric) - Points assigned
- `is_excused` (boolean) - Whether absence is excused
- `pto_used` (boolean) - Whether PTO was used
- `notes` (text) - Additional notes

### attendance_points
Rolling points system for attendance violations.

**Key Columns:**
- `id` (uuid) - Primary key
- `employee_id` (uuid) - Foreign key to employees
- `attendance_record_id` (uuid) - Foreign key to attendance_records
- `violation_type` (text) - Type of violation
- `points` (numeric) - Points assigned
- `date_assessed` (date) - Assessment date
- `expires_on` (date) - Expiration date (12 months)
- `is_active` (boolean) - Whether points are still active

### attendance_warnings
Formal warnings based on accumulated points.

**Key Columns:**
- `id` (uuid) - Primary key
- `employee_id` (uuid) - Foreign key to employees
- `warning_type` (text) - Verbal, written, final, termination
- `total_points` (numeric) - Points at time of warning
- `issued_date` (date) - When warning was issued
- `issued_by` (text) - Who issued the warning
- `notes` (text) - Additional notes

---

## Application & License Tables

### app_items
Application catalog for the app portal.

**Key Columns:**
- `id` (uuid) - Primary key
- `name` (text) - Application name
- `description` (text) - Application description
- `category` (enum) - Application category
- `url` (text) - Application URL
- `icon_path` (text) - Icon path
- `is_active` (boolean) - Active status
- `is_new` (boolean) - Show "new" badge
- `coming_soon` (boolean) - Coming soon status
- `show_to_demo` (boolean) - Show to demo users
- `requires_auth` (boolean) - Requires authentication
- `auth_type` (text) - Authentication type
- `license` (text) - License code required
- `view_count`, `use_count` (integer) - Usage metrics

### licenses
License management for multi-tenant applications.

**Key Columns:**
- `id` (uuid) - Primary key
- `license_code` (text) - Unique license code
- `company_name` (text) - Company name
- `contact_email` (text) - Contact email
- `contact_name` (text) - Contact person
- `is_active` (boolean) - Active status
- `custom_domain` (text) - Custom domain if applicable
- `qr_code_url` (text) - QR code for license
- `settings` (jsonb) - Custom settings

### license_users
Users associated with licenses.

**Key Columns:**
- `id` (uuid) - Primary key
- `license_id` (uuid) - Foreign key to licenses
- `user_identifier` (text) - User identifier
- `user_name` (text) - User name
- `last_access` (timestamp) - Last access time

---

## Admin & Security Tables

### admin_sessions
Temporary admin access sessions.

**Key Columns:**
- `id` (uuid) - Primary key
- `session_id` (text) - Unique session identifier
- `access_level` (text) - Access level granted
- `expires_at` (timestamp) - Session expiration
- `last_activity` (timestamp) - Last activity timestamp

### admin_audit_log
Audit trail for admin actions.

**Key Columns:**
- `id` (uuid) - Primary key
- `admin_user_id` (uuid) - Admin who performed action
- `action` (text) - Action performed
- `table_name` (text) - Affected table
- `record_id` (text) - Affected record ID
- `old_values`, `new_values` (jsonb) - Before/after values
- `created_at` (timestamp) - Action timestamp

### iframe_sessions
Session management for iframe embedded applications.

**Key Columns:**
- `id` (uuid) - Primary key
- `user_id` (text) - User identifier
- `token_hash` (text) - Hashed token
- `origin_domain` (text) - Origin domain
- `expires_at` (timestamp) - Expiration time
- `user_data` (jsonb) - Additional user data
- `last_activity` (timestamp) - Last activity

---

## Business Data Tables

### customer
Customer data with geocoding.

**Key Columns:**
- `uuid` (uuid) - Primary key
- `company` (text) - Company name
- `customer_name` (text) - Customer contact name
- `email`, `phone` (text) - Contact info
- `corrected_address` (text) - Geocoded address
- `latitude`, `longitude` (double) - Coordinates
- `territory` (text) - Sales territory
- `sales_2024`, `sales_2025` (text) - Sales data

### MAI Customers
Magnet Applications customers with ship-to info.

**Key Columns:**
- `shipid` (bigint) - Primary key
- `Customer` (text) - Customer name
- `CustomerAddress` (text) - Customer address
- `Ship To Name` (text) - Ship to name
- `ShipToAddress` (text) - Ship to address
- `sales2022`, `sales2023`, `sales2024`, `sales2025` (double) - Sales by year
- `Quotes(12mo)`, `Quote $$ (12mo)` - Quote metrics

### OCW_magwiz
Oil Cooled Winding magnet wizard calculations.

**Key Columns:**
- `filename` (text) - Primary key
- `prefix`, `suffix` (text) - Model identifiers
- Various technical columns for dimensions, temperatures, voltages, currents, etc.

### baq_stoplight
Production stoplight/job tracking data.

**Key Columns:**
- `uuid` (uuid) - Primary key
- `JobNum`, `Job` (text) - Job identifiers
- `Part` (text) - Part number
- `Description` (text) - Description
- `Department` (text) - Department
- `Start Date`, `Due Date` (timestamp) - Dates
- `Prod. Qty` (bigint) - Production quantity
- `EstProdHours` (double) - Estimated hours

---

## Dashboard & Content Tables

### dashboard_cards
Content cards for dashboard display.

**Key Columns:**
- `id` (uuid) - Primary key
- `title` (text) - Card title
- `content` (text) - Card content
- `card_type` (text) - Type of card
- `location` (text) - Which location's dashboard
- `is_active` (boolean) - Active status
- `is_urgent` (boolean) - Urgent flag
- `priority` (integer) - Display priority
- `author_name` (text) - Content author
- `published_at` (timestamp) - Publication date
- `post_url`, `pdf_url` (text) - Related links
- `linkedin_post_id` (text) - LinkedIn integration

### escalations
Order escalation tracking.

**Key Columns:**
- `id` (uuid) - Primary key
- `escalation_type` (text) - Type of escalation
- `order_id`, `po_number` (text) - Order identifiers
- `status` (text) - Current status
- `assigned_to` (text) - Assigned person
- `days_overdue` (integer) - Days overdue
- `resolved_at` (timestamp) - Resolution timestamp

---

## AI & Knowledge Tables

### characters
AI character definitions.

**Key Columns:**
- `id` (uuid) - Primary key
- `name` (text) - Character name
- `role` (text) - Character role
- `description` (text) - Description
- `avatar_base_url` (text) - Avatar image URL
- `is_active` (boolean) - Active status

### character_directives
Instructions/directives for AI characters.

**Key Columns:**
- `id` (uuid) - Primary key
- `character_id` (uuid) - Foreign key to characters
- `directive_type` (text) - Type of directive
- `directive_text` (text) - Directive content
- `priority` (integer) - Priority order

### conversation_starters
Suggested conversation starters for AI.

**Key Columns:**
- `id` (uuid) - Primary key
- `character_id` (uuid) - Foreign key to characters
- `title` (text) - Starter title
- `description` (text) - Starter description
- `starter_order` (integer) - Display order

### intent_patterns
AI intent recognition patterns.

**Key Columns:**
- `id` (uuid) - Primary key
- `character_id` (uuid) - Foreign key to characters
- `intent_name` (text) - Intent name
- `pattern_text` (text) - Pattern to match
- `response_template` (text) - Response template
- `api_endpoint` (text) - API to call
- `confidence_threshold` (numeric) - Matching threshold

### conversations
User conversation history.

**Key Columns:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - User ID
- `topic` (text) - Conversation topic
- `content` (jsonb) - Conversation messages
- `last_message_at` (timestamp) - Last message time

### corrections
User corrections to AI responses.

**Key Columns:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - User ID
- `conversation_id` (uuid) - Conversation ID
- `message_id` (text) - Message being corrected
- `correction_text` (text) - Correction content
- `is_global` (boolean) - Apply globally
- `keywords` (text[]) - Related keywords
- `applied` (boolean) - Whether applied

### curtis_conversations
Curtis AI (product assistant) conversations.

**Key Columns:**
- `id` (uuid) - Primary key
- `session_id` (text) - Session identifier
- `sender` (text) - Message sender
- `message` (text) - Message content
- `customer_inquiry_type` (text) - Type of inquiry
- `product_context` (jsonb) - Product context
- `equipment_recommendations` (jsonb) - Recommendations made

---

## MTO (Make-to-Order) Tables

### mto_backlog
Backlog tracking by month.

**Key Columns:**
- `id` (uuid) - Primary key
- `month` (text) - Month identifier
- `order_count` (integer) - Number of orders
- `total_amount` (numeric) - Total dollar amount
- `status` (text) - Status
- `backlog_data` (text) - Additional data

### mto_delivery
On-time delivery percentages by month.

**Key Columns:**
- `id` (uuid) - Primary key
- `current_year` (integer) - Year
- `january_otd` through `december_otd` (numeric) - Monthly OTD %
- `last_updated_month` (text) - Last update

### mto_incoming
Incoming orders by month.

**Key Columns:**
- `id` (uuid) - Primary key
- `month` (text) - Month identifier
- `incoming` (numeric) - Incoming amount
- `gmMonth` (numeric) - Gross margin for month

### mto_shipclerk
Ship clerk processing tracking.

**Key Columns:**
- `id` (uuid) - Primary key
- `month` (text) - Month identifier
- `pending_count` (integer) - Pending orders
- `processed_count` (integer) - Processed orders
- `total_amount`, `import_amount` (numeric) - Dollar amounts
- `orders_data` (text) - Order details

### mto_shipments
Shipment tracking by product group.

**Key Columns:**
- `id` (uuid) - Primary key
- `productgroup` (text) - Product group
- `monthtotal` (numeric) - Month total
- `budgetamount` (numeric) - Budget amount
- `shipamount` (numeric) - Shipped amount
- `shipnotinvoiced` (numeric) - Shipped not invoiced

### mto_status
Order status tracking.

**Key Columns:**
- `dd` (text) - Primary key
- `Order` (integer) - Order number
- `PO` (text) - PO number
- `Name`, `Cust. ID` (text) - Customer info
- `Order Amount` (numeric) - Order value
- `Order Date`, `NextRelDt` (timestamp) - Dates
- `On Hold`, `Credit Hold` (boolean) - Hold statuses
- `Credit Limit` (numeric) - Credit limit

### mto_metadata
Metadata for MTO data imports.

**Key Columns:**
- `id` (text) - Primary key
- `timestamp` (text) - Import timestamp

---

## Miscellaneous Tables

### entities
General entity storage.

**Key Columns:**
- `id` (uuid) - Primary key
- `name` (text) - Entity name

### embeddings
Vector embeddings for semantic search.

**Key Columns:**
- `uuid` (uuid) - Primary key
- `narrative_text` (text) - Source text
- `embedding` (vector) - Vector embedding

### don, don2
Legacy data tables (specific purpose unclear from schema).

---

## Notes

- All tables use `uuid` for primary keys except where noted
- Most tables include `created_at` and `updated_at` timestamps
- RLS (Row Level Security) policies are in place on most tables
- Several tables support soft deletes via `deleted_at` column
- JSONB columns are used extensively for flexible data storage
