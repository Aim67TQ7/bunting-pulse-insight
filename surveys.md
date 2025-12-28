# Survey Module - Complete Schema Documentation

**Last Updated**: 2024-12-28  
**Revision**: 2.16.0

This document provides the complete database schema and architecture for the Employee Engagement Survey module.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Tables](#core-tables)
   - [employee_survey_responses](#employee_survey_responses)
   - [survey_configurations](#survey_configurations)
   - [survey_question_config](#survey_question_config)
   - [survey_answer_sets](#survey_answer_sets)
   - [survey_answer_options](#survey_answer_options)
3. [Entity Relationships](#entity-relationships)
4. [JSONB Field Structures](#jsonb-field-structures)
5. [Data Flow](#data-flow)
6. [GDPR Compliance](#gdpr-compliance)

---

## Overview

The survey module is a flexible, multilingual employee engagement survey system supporting:

- **4 Languages**: English, Spanish, French, Italian
- **3 Question Types**: Demographic, Rating (1-5 scale), Multi-select
- **26 Base Questions**: 3 demographics + 20 ratings + 3 multi-select
- **Dynamic Configuration**: Enable/disable questions per survey instance
- **GDPR Compliance**: Consent tracking, data retention, soft deletes

---

## Core Tables

### employee_survey_responses

Main table storing all survey responses from employees.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `session_id` | text | NO | - | Unique anonymous session identifier |
| `configuration_id` | uuid | YES | - | FK to survey_configurations |
| `continent` | text | YES | - | Employee's continent (North America/Europe) |
| `division` | text | YES | - | Employee's division (Equipment/Magnetics/Both) |
| `role` | text | YES | - | Employee's role category |
| `responses_jsonb` | jsonb | YES | - | Dynamic survey responses (new format) |
| `follow_up_responses` | jsonb | YES | '{}' | Low-score follow-up comments |
| `is_draft` | boolean | YES | true | Draft vs submitted status |
| `consent_given` | boolean | NO | false | GDPR consent flag |
| `consent_timestamp` | timestamptz | YES | - | When consent was given |
| `consent_ip_hash` | text | YES | - | Hashed IP for compliance |
| `data_retention_date` | timestamptz | YES | - | Auto-delete date (12 months) |
| `deleted_at` | timestamptz | YES | - | Soft delete timestamp |
| `completion_time_seconds` | integer | YES | - | Time to complete survey |
| `submitted_at` | timestamptz | NO | now() | Submission timestamp |
| `created_at` | timestamptz | NO | now() | Record creation |
| `updated_at` | timestamptz | NO | now() | Last update |
| `last_autosave_at` | timestamptz | YES | now() | Last autosave |

**Legacy Rating Columns** (1-5 scale, maintained for backward compatibility):

| Column | Type | Description |
|--------|------|-------------|
| `job_satisfaction` | integer | Satisfied with role |
| `training_satisfaction` | integer | Adequate training received |
| `work_life_balance` | integer | Healthy work-life balance |
| `communication_clarity` | integer | Clear supervisor communication |
| `leadership_openness` | integer | Comfortable giving feedback |
| `manager_alignment` | integer | Clear expectations |
| `cross_functional_collaboration` | integer | Good team cooperation |
| `strategic_confidence` | integer | See self working here in 2 years |
| `advancement_opportunities` | integer | Growth opportunities exist |
| `workplace_safety` | integer | Safety is prioritized |
| `recommend_company` | integer | Would recommend company |
| `manual_processes_focus` | integer | Efficient processes |
| `comfortable_suggesting_improvements` | integer | Change handled well |
| `performance_awareness` | integer | Informed about company performance |
| `safety_reporting_comfort` | integer | Comfortable reporting safety issues |
| `workload_manageability` | integer | Manageable workload |
| `tools_equipment_quality` | integer | Adequate tools/equipment |
| `company_value_alignment` | integer | Contributions valued |
| `team_morale` | integer | Positive morale |
| `pride_in_work` | integer | Pride in company |

**Legacy Array Columns**:

| Column | Type | Description |
|--------|------|-------------|
| `communication_preferences` | text[] | Preferred communication channels |
| `motivation_factors` | text[] | What motivates to stay |
| `information_preferences` | text[] | What info to receive more |

**Legacy Text Columns**:

| Column | Type | Description |
|--------|------|-------------|
| `collaboration_feedback` | text | Cross-functional feedback |
| `additional_comments` | text | General comments |

---

### survey_configurations

Defines different survey configurations with enabled question types.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | text | NO | - | Configuration name |
| `description` | text | YES | - | Configuration description |
| `is_active` | boolean | YES | false | Active survey flag |
| `enabled_demographics` | jsonb | YES | See below | Enabled demographic questions |
| `enabled_rating_questions` | jsonb | YES | See below | Enabled rating questions |
| `enabled_multiselect_questions` | jsonb | YES | See below | Enabled multi-select questions |
| `require_low_score_feedback` | boolean | YES | true | Require comment for scores 1-3 |
| `languages_enabled` | text[] | YES | ['en','es','fr','it'] | Active languages |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update |

**Default enabled_demographics**:
```json
["continent", "division", "role"]
```

**Default enabled_rating_questions**:
```json
[
  "job_satisfaction", "recommend_company", "strategic_confidence",
  "manager_alignment", "performance_awareness", "communication_clarity",
  "leadership_openness", "training_satisfaction", "advancement_opportunities",
  "cross_functional_collaboration", "team_morale", "pride_in_work",
  "workplace_safety", "safety_reporting_comfort", "workload_manageability",
  "work_life_balance", "tools_equipment_quality", "manual_processes_focus",
  "company_value_alignment", "comfortable_suggesting_improvements"
]
```

**Default enabled_multiselect_questions**:
```json
["communication_preferences", "motivation_factors", "information_preferences"]
```

---

### survey_question_config

Stores all possible survey questions with multilingual support.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `configuration_id` | uuid | YES | - | FK to survey_configurations |
| `question_id` | text | NO | - | Unique question identifier (e.g., 'job_satisfaction') |
| `question_type` | text | NO | - | Type: 'demographic', 'rating', 'multiselect', 'text' |
| `section` | text | YES | - | Question section/category |
| `display_order` | integer | YES | - | Display order in survey |
| `labels` | jsonb | YES | '{}' | Multilingual question labels |
| `description` | jsonb | YES | '{}' | Multilingual descriptions |
| `options` | jsonb | YES | '[]' | Answer options (for demographic/multiselect) |
| `follow_up_rules` | jsonb | YES | '{}' | Conditional follow-up rules |
| `answer_set_id` | uuid | YES | - | FK to survey_answer_sets (for reusable options) |
| `is_enabled` | boolean | YES | true | Question enabled flag |
| `is_required` | boolean | YES | true | Required question flag |
| `allow_na` | boolean | YES | false | Allow N/A response |
| `custom_label` | jsonb | YES | - | Override labels per configuration |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**labels JSONB Structure**:
```json
{
  "en": "I am satisfied with my current role and responsibilities.",
  "es": "Estoy satisfecho con mi rol y responsabilidades actuales.",
  "fr": "Je suis satisfait de mon rôle et de mes responsabilités actuels.",
  "it": "Sono soddisfatto del mio ruolo e delle mie responsabilità attuali."
}
```

**options JSONB Structure** (for demographic/multiselect):
```json
[
  {
    "value": "north_america",
    "labels": {
      "en": "North America",
      "es": "América del Norte",
      "fr": "Amérique du Nord",
      "it": "Nord America"
    }
  }
]
```

**follow_up_rules JSONB Structure**:
```json
{
  "trigger": "low_score",
  "prompts": {
    "en": "Please share what could be improved:",
    "es": "Por favor comparta qué se podría mejorar:",
    "fr": "Veuillez partager ce qui pourrait être amélioré:",
    "it": "Per favore condividi cosa potrebbe essere migliorato:"
  }
}
```

---

### survey_answer_sets

Reusable answer option sets (e.g., Likert scale, Yes/No).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `set_key` | text | NO | - | Unique key (e.g., 'likert_5', 'yes_no') |
| `name` | jsonb | NO | - | Multilingual set name |
| `description` | jsonb | YES | - | Multilingual description |
| `set_type` | text | NO | - | Type: 'rating', 'boolean', 'custom' |
| `is_active` | boolean | YES | true | Active flag |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update |

**Example set_key values**:
- `likert_5` - 5-point agreement scale
- `likert_7` - 7-point agreement scale
- `yes_no` - Binary yes/no
- `frequency_5` - Never to Always scale

---

### survey_answer_options

Individual answer options belonging to answer sets.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `answer_set_id` | uuid | YES | - | FK to survey_answer_sets |
| `option_key` | text | NO | - | Unique key within set (e.g., '1', '2', 'yes') |
| `labels` | jsonb | NO | - | Multilingual option labels |
| `display_order` | integer | NO | 0 | Order within set |
| `is_active` | boolean | YES | true | Active flag |
| `metadata` | jsonb | YES | - | Additional option data |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**labels JSONB Structure**:
```json
{
  "en": "Strongly Agree",
  "es": "Muy de acuerdo",
  "fr": "Tout à fait d'accord",
  "it": "Pienamente d'accordo"
}
```

**metadata JSONB Structure** (optional):
```json
{
  "numeric_value": 5,
  "color": "#22c55e",
  "icon": "thumbs-up"
}
```

---

## Entity Relationships

```
┌──────────────────────────┐
│  survey_configurations   │
│  ──────────────────────  │
│  id (PK)                 │
│  name                    │
│  is_active               │
│  enabled_*               │
└────────────┬─────────────┘
             │ 1:N
             ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  survey_question_config  │      │   survey_answer_sets     │
│  ──────────────────────  │      │   ───────────────────    │
│  id (PK)                 │      │   id (PK)                │
│  configuration_id (FK)───┼──┐   │   set_key                │
│  question_id             │  │   │   set_type               │
│  question_type           │  │   └────────────┬─────────────┘
│  answer_set_id (FK)──────┼──┼────────────────┘
│  labels                  │  │        │ 1:N
└────────────┬─────────────┘  │        ▼
             │                │   ┌──────────────────────────┐
             │                │   │  survey_answer_options   │
             │                │   │  ──────────────────────  │
             │                │   │  id (PK)                 │
             │                │   │  answer_set_id (FK)      │
             ▼                │   │  option_key              │
┌──────────────────────────┐  │   │  labels                  │
│ employee_survey_responses│  │   └──────────────────────────┘
│ ─────────────────────────│  │
│ id (PK)                  │  │
│ configuration_id (FK)────┼──┘
│ session_id               │
│ responses_jsonb          │
│ consent_given            │
└──────────────────────────┘
```

---

## JSONB Field Structures

### responses_jsonb (Dynamic Response Storage)

New format for storing survey responses:

```json
{
  "demographics": {
    "continent": "north_america",
    "division": "equipment",
    "role": "operations"
  },
  "ratings": {
    "job_satisfaction": 4,
    "work_life_balance": 3,
    "training_satisfaction": 5
  },
  "multiselect": {
    "communication_preferences": ["email", "town_halls", "team_meetings"],
    "motivation_factors": ["compensation", "people", "growth"]
  },
  "text": {
    "collaboration_feedback": "Great teamwork across departments",
    "additional_comments": "Overall positive experience"
  }
}
```

### follow_up_responses (Low Score Comments)

Stores comments for questions rated 1-3:

```json
{
  "job_satisfaction": "Workload has increased significantly",
  "work_life_balance": "Need more flexible scheduling options",
  "training_satisfaction": "Would benefit from more hands-on training"
}
```

---

## Data Flow

### Survey Submission Flow

1. **User Opens Survey** → New `session_id` generated
2. **Consent Given** → `consent_given=true`, `consent_timestamp` set
3. **Autosave** → `is_draft=true`, `last_autosave_at` updated
4. **Submit** → `is_draft=false`, `submitted_at` set
5. **Retention Date** → `data_retention_date` set to +12 months

### Question Loading Flow

1. Fetch `survey_configurations` where `is_active=true`
2. Fetch `survey_question_config` filtered by `configuration_id`
3. For questions with `answer_set_id`, fetch `survey_answer_sets` + `survey_answer_options`
4. Sort by `display_order`
5. Filter by current language

---

## GDPR Compliance

### Data Collection

| Field | Purpose | Retention |
|-------|---------|-----------|
| `session_id` | Anonymous tracking | 12 months |
| `consent_given` | Legal basis | 12 months |
| `consent_timestamp` | Audit trail | 12 months |
| `consent_ip_hash` | Proof of consent | 12 months |
| `responses_jsonb` | Survey data | 12 months |

### Data Retention

- All responses auto-expire after 12 months
- `data_retention_date` calculated on submission
- Soft delete via `deleted_at` for immediate removal
- No personally identifiable information stored

### User Rights

- **Right to Access**: Export via admin panel
- **Right to Erasure**: Soft delete available
- **Right to Portability**: JSON export supported
- **Data Minimization**: Only essential data collected

---

## Indexes

Recommended indexes for performance:

```sql
-- Primary queries
CREATE INDEX idx_responses_config ON employee_survey_responses(configuration_id);
CREATE INDEX idx_responses_submitted ON employee_survey_responses(submitted_at);
CREATE INDEX idx_responses_draft ON employee_survey_responses(is_draft);
CREATE INDEX idx_responses_continent ON employee_survey_responses(continent);
CREATE INDEX idx_responses_division ON employee_survey_responses(division);

-- Question config
CREATE INDEX idx_questions_config ON survey_question_config(configuration_id);
CREATE INDEX idx_questions_type ON survey_question_config(question_type);
CREATE INDEX idx_questions_order ON survey_question_config(display_order);

-- Answer sets
CREATE INDEX idx_options_set ON survey_answer_options(answer_set_id);
CREATE INDEX idx_options_order ON survey_answer_options(display_order);
```

---

## API Hooks

### Frontend Hooks

| Hook | Description |
|------|-------------|
| `useSurveyQuestions(configurationId?)` | Fetch all questions with answer sets |
| `useSurveyQuestionsByType(type, configurationId?)` | Fetch questions by type |

### Edge Functions

| Function | Description |
|----------|-------------|
| `generate-survey-analysis` | AI-powered survey analysis |
| `generate-filtered-analysis` | Regional/divisional analysis |
| `chat-with-survey-data` | Conversational survey insights |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.16.0 | 2024-12-28 | ZIP bundled reports, question text in reports, consolidated analytics |
| 2.15.0 | 2024-12-27 | Appendix with demographic breakdowns, enhanced PDF design |
| 2.14.0 | 2024-12-26 | Dynamic question configuration, answer sets |
| 2.13.0 | 2024-12-25 | Multilingual support (ES, FR, IT) |
| 2.12.0 | 2024-12-24 | GDPR compliance features |
| 2.11.0 | 2024-12-23 | Initial survey module |
