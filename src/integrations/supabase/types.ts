export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          access_level: string
          created_at: string
          expires_at: string
          id: string
          last_activity: string | null
          session_id: string
        }
        Insert: {
          access_level: string
          created_at?: string
          expires_at: string
          id?: string
          last_activity?: string | null
          session_id: string
        }
        Update: {
          access_level?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_activity?: string | null
          session_id?: string
        }
        Relationships: []
      }
      ai_test_analyses: {
        Row: {
          analysis_text: string
          created_at: string | null
          filters_applied: Json | null
          generation_time_ms: number | null
          id: string
          is_favorite: boolean | null
          model_used: string
          notes: string | null
          prompt_version: string | null
          rating: number | null
          response_count: number
          tokens_used: number | null
        }
        Insert: {
          analysis_text: string
          created_at?: string | null
          filters_applied?: Json | null
          generation_time_ms?: number | null
          id?: string
          is_favorite?: boolean | null
          model_used: string
          notes?: string | null
          prompt_version?: string | null
          rating?: number | null
          response_count: number
          tokens_used?: number | null
        }
        Update: {
          analysis_text?: string
          created_at?: string | null
          filters_applied?: Json | null
          generation_time_ms?: number | null
          id?: string
          is_favorite?: boolean | null
          model_used?: string
          notes?: string | null
          prompt_version?: string | null
          rating?: number | null
          response_count?: number
          tokens_used?: number | null
        }
        Relationships: []
      }
      app_items: {
        Row: {
          access_token: string | null
          auth_passcode: string | null
          auth_type: string | null
          category: Database["public"]["Enums"]["app_type"]
          coming_soon: boolean | null
          created_at: string | null
          description: string
          icon_path: string | null
          id: string
          iframe_height: string | null
          is_active: boolean | null
          is_new: boolean | null
          license: string | null
          name: string
          requires_auth: boolean | null
          show_to_demo: boolean
          token: string | null
          updated_at: string | null
          url: string
          use_count: number | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          access_token?: string | null
          auth_passcode?: string | null
          auth_type?: string | null
          category: Database["public"]["Enums"]["app_type"]
          coming_soon?: boolean | null
          created_at?: string | null
          description: string
          icon_path?: string | null
          id?: string
          iframe_height?: string | null
          is_active?: boolean | null
          is_new?: boolean | null
          license?: string | null
          name: string
          requires_auth?: boolean | null
          show_to_demo?: boolean
          token?: string | null
          updated_at?: string | null
          url: string
          use_count?: number | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          access_token?: string | null
          auth_passcode?: string | null
          auth_type?: string | null
          category?: Database["public"]["Enums"]["app_type"]
          coming_soon?: boolean | null
          created_at?: string | null
          description?: string
          icon_path?: string | null
          id?: string
          iframe_height?: string | null
          is_active?: boolean | null
          is_new?: boolean | null
          license?: string | null
          name?: string
          requires_auth?: boolean | null
          show_to_demo?: boolean
          token?: string | null
          updated_at?: string | null
          url?: string
          use_count?: number | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          auth_passcode: string | null
          auth_type: string | null
          category: string | null
          coming_soon: boolean | null
          created_at: string | null
          description: string | null
          icon_path: string | null
          id: string
          iframe_height: string | null
          is_active: boolean | null
          is_new: boolean | null
          license: string | null
          name: string
          requires_auth: boolean | null
          updated_at: string | null
          url: string | null
          use_count: number | null
          view_count: number | null
        }
        Insert: {
          auth_passcode?: string | null
          auth_type?: string | null
          category?: string | null
          coming_soon?: boolean | null
          created_at?: string | null
          description?: string | null
          icon_path?: string | null
          id?: string
          iframe_height?: string | null
          is_active?: boolean | null
          is_new?: boolean | null
          license?: string | null
          name: string
          requires_auth?: boolean | null
          updated_at?: string | null
          url?: string | null
          use_count?: number | null
          view_count?: number | null
        }
        Update: {
          auth_passcode?: string | null
          auth_type?: string | null
          category?: string | null
          coming_soon?: boolean | null
          created_at?: string | null
          description?: string | null
          icon_path?: string | null
          id?: string
          iframe_height?: string | null
          is_active?: boolean | null
          is_new?: boolean | null
          license?: string | null
          name?: string
          requires_auth?: boolean | null
          updated_at?: string | null
          url?: string | null
          use_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      approved_knowledge_managers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          department: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      attendance_points: {
        Row: {
          attendance_record_id: string
          created_at: string
          date_assessed: string
          employee_id: string
          expires_on: string
          id: string
          is_active: boolean
          points: number
          violation_type: string
        }
        Insert: {
          attendance_record_id: string
          created_at?: string
          date_assessed: string
          employee_id: string
          expires_on: string
          id?: string
          is_active?: boolean
          points: number
          violation_type: string
        }
        Update: {
          attendance_record_id?: string
          created_at?: string
          date_assessed?: string
          employee_id?: string
          expires_on?: string
          id?: string
          is_active?: boolean
          points?: number
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_points_attendance_record_id_fkey"
            columns: ["attendance_record_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_points_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          clock_in: string | null
          clock_out: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          is_excused: boolean | null
          notes: string | null
          points_assessed: number | null
          pto_used: boolean | null
          scheduled_end: string | null
          scheduled_start: string | null
          updated_at: string
          violation_type: string | null
        }
        Insert: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          is_excused?: boolean | null
          notes?: string | null
          points_assessed?: number | null
          pto_used?: boolean | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          updated_at?: string
          violation_type?: string | null
        }
        Update: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          is_excused?: boolean | null
          notes?: string | null
          points_assessed?: number | null
          pto_used?: boolean | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          updated_at?: string
          violation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_warnings: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          issued_by: string | null
          issued_date: string
          notes: string | null
          total_points: number
          warning_type: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          issued_by?: string | null
          issued_date?: string
          notes?: string | null
          total_points: number
          warning_type: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          issued_by?: string | null
          issued_date?: string
          notes?: string | null
          total_points?: number
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_warnings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      baq_stoplight: {
        Row: {
          Asm: number | null
          Department: string | null
          Description: string | null
          "Due Date": string | null
          EstProdHours: number | null
          Job: string | null
          JobNum: string | null
          Name: string | null
          Opr: number | null
          Part: string | null
          "Prod. Qty": number | null
          "Start Date": string | null
          uuid: string
        }
        Insert: {
          Asm?: number | null
          Department?: string | null
          Description?: string | null
          "Due Date"?: string | null
          EstProdHours?: number | null
          Job?: string | null
          JobNum?: string | null
          Name?: string | null
          Opr?: number | null
          Part?: string | null
          "Prod. Qty"?: number | null
          "Start Date"?: string | null
          uuid?: string
        }
        Update: {
          Asm?: number | null
          Department?: string | null
          Description?: string | null
          "Due Date"?: string | null
          EstProdHours?: number | null
          Job?: string | null
          JobNum?: string | null
          Name?: string | null
          Opr?: number | null
          Part?: string | null
          "Prod. Qty"?: number | null
          "Start Date"?: string | null
          uuid?: string
        }
        Relationships: []
      }
      character_directives: {
        Row: {
          character_id: string
          created_at: string | null
          directive_text: string
          directive_type: string
          id: string
          priority: number | null
        }
        Insert: {
          character_id: string
          created_at?: string | null
          directive_text: string
          directive_type: string
          id?: string
          priority?: number | null
        }
        Update: {
          character_id?: string
          created_at?: string | null
          directive_text?: string
          directive_type?: string
          id?: string
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "character_directives_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          avatar_base_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_base_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_base_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_starters: {
        Row: {
          character_id: string
          created_at: string | null
          description: string | null
          id: string
          starter_order: number | null
          title: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          starter_order?: number | null
          title: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          starter_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_starters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          last_message_at: string | null
          topic: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          topic: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          topic?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      corrections: {
        Row: {
          applied: boolean | null
          conversation_id: string
          correction_text: string
          created_at: string
          id: string
          is_global: boolean | null
          keywords: string[] | null
          message_id: string
          topic: string | null
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          conversation_id: string
          correction_text: string
          created_at?: string
          id?: string
          is_global?: boolean | null
          keywords?: string[] | null
          message_id: string
          topic?: string | null
          user_id: string
        }
        Update: {
          applied?: boolean | null
          conversation_id?: string
          correction_text?: string
          created_at?: string
          id?: string
          is_global?: boolean | null
          keywords?: string[] | null
          message_id?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      curtis_conversations: {
        Row: {
          created_at: string
          customer_inquiry_type: string | null
          equipment_recommendations: Json | null
          id: string
          message: string
          product_context: Json | null
          sender: string
          session_id: string
        }
        Insert: {
          created_at?: string
          customer_inquiry_type?: string | null
          equipment_recommendations?: Json | null
          id?: string
          message: string
          product_context?: Json | null
          sender: string
          session_id: string
        }
        Update: {
          created_at?: string
          customer_inquiry_type?: string | null
          equipment_recommendations?: Json | null
          id?: string
          message?: string
          product_context?: Json | null
          sender?: string
          session_id?: string
        }
        Relationships: []
      }
      customer: {
        Row: {
          company: string
          corrected_address: string
          created_at: string | null
          customer_name: string | null
          email: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          sales_18_month: string | null
          sales_2024: string | null
          sales_2025: string | null
          territory: string | null
          uuid: string
        }
        Insert: {
          company: string
          corrected_address: string
          created_at?: string | null
          customer_name?: string | null
          email?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          sales_18_month?: string | null
          sales_2024?: string | null
          sales_2025?: string | null
          territory?: string | null
          uuid?: string
        }
        Update: {
          company?: string
          corrected_address?: string
          created_at?: string | null
          customer_name?: string | null
          email?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          sales_18_month?: string | null
          sales_2024?: string | null
          sales_2025?: string | null
          territory?: string | null
          uuid?: string
        }
        Relationships: []
      }
      customers_uk: {
        Row: {
          Customer: string | null
          QuotedAmtLastYear: number | null
          QuotesLastYear: number | null
          sales2022: string | null
          sales2023: string | null
          sales2024: string | null
          sales2025: string | null
          salesFourYear: string | null
          ship_to_address: string | null
          ship_to_latitude: string | null
          ship_to_longitude: string | null
          ship_to_name: string | null
          UK_uuid: string
        }
        Insert: {
          Customer?: string | null
          QuotedAmtLastYear?: number | null
          QuotesLastYear?: number | null
          sales2022?: string | null
          sales2023?: string | null
          sales2024?: string | null
          sales2025?: string | null
          salesFourYear?: string | null
          ship_to_address?: string | null
          ship_to_latitude?: string | null
          ship_to_longitude?: string | null
          ship_to_name?: string | null
          UK_uuid?: string
        }
        Update: {
          Customer?: string | null
          QuotedAmtLastYear?: number | null
          QuotesLastYear?: number | null
          sales2022?: string | null
          sales2023?: string | null
          sales2024?: string | null
          sales2025?: string | null
          salesFourYear?: string | null
          ship_to_address?: string | null
          ship_to_latitude?: string | null
          ship_to_longitude?: string | null
          ship_to_name?: string | null
          UK_uuid?: string
        }
        Relationships: []
      }
      dashboard_cards: {
        Row: {
          author_name: string | null
          card_type: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          is_urgent: boolean
          linkedin_post_id: string | null
          location: string
          pdf_url: string | null
          post_url: string | null
          priority: number
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          card_type: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          linkedin_post_id?: string | null
          location?: string
          pdf_url?: string | null
          post_url?: string | null
          priority?: number
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          card_type?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          linkedin_post_id?: string | null
          location?: string
          pdf_url?: string | null
          post_url?: string | null
          priority?: number
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      don: {
        Row: {
          embedding_b64_f16: string | null
          narrative: string | null
          uuid: string
        }
        Insert: {
          embedding_b64_f16?: string | null
          narrative?: string | null
          uuid?: string
        }
        Update: {
          embedding_b64_f16?: string | null
          narrative?: string | null
          uuid?: string
        }
        Relationships: []
      }
      don2: {
        Row: {
          context: string | null
          job_number: string | null
          line_number: string
          mentions_media_gallery: boolean | null
          order_number: string | null
          picture_ref: string | null
        }
        Insert: {
          context?: string | null
          job_number?: string | null
          line_number: string
          mentions_media_gallery?: boolean | null
          order_number?: string | null
          picture_ref?: string | null
        }
        Update: {
          context?: string | null
          job_number?: string | null
          line_number?: string
          mentions_media_gallery?: boolean | null
          order_number?: string | null
          picture_ref?: string | null
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          embedding: string | null
          narrative_text: string | null
          uuid: string
        }
        Insert: {
          embedding?: string | null
          narrative_text?: string | null
          uuid: string
        }
        Update: {
          embedding?: string | null
          narrative_text?: string | null
          uuid?: string
        }
        Relationships: []
      }
      Employee_id: {
        Row: {
          accountEnabled: boolean | null
          alternateEmailAddress: string | null
          city: string | null
          createdDateTime: string | null
          department: string | null
          displayName: string | null
          employee_id: string
          invitationState: string | null
          jobTitle: string | null
          mobilePhone: string | null
          surname: string | null
          telephoneNumber: string | null
          user_id: string | null
          userPrincipalName: string
          userType: string | null
        }
        Insert: {
          accountEnabled?: boolean | null
          alternateEmailAddress?: string | null
          city?: string | null
          createdDateTime?: string | null
          department?: string | null
          displayName?: string | null
          employee_id?: string
          invitationState?: string | null
          jobTitle?: string | null
          mobilePhone?: string | null
          surname?: string | null
          telephoneNumber?: string | null
          user_id?: string | null
          userPrincipalName: string
          userType?: string | null
        }
        Update: {
          accountEnabled?: boolean | null
          alternateEmailAddress?: string | null
          city?: string | null
          createdDateTime?: string | null
          department?: string | null
          displayName?: string | null
          employee_id?: string
          invitationState?: string | null
          jobTitle?: string | null
          mobilePhone?: string | null
          surname?: string | null
          telephoneNumber?: string | null
          user_id?: string | null
          userPrincipalName?: string
          userType?: string | null
        }
        Relationships: []
      }
      employee_survey_responses: {
        Row: {
          additional_comments: string | null
          advancement_opportunities: number | null
          collaboration_feedback: string | null
          comfortable_suggesting_improvements: number | null
          communication_clarity: number | null
          communication_preferences: string[] | null
          company_value_alignment: number | null
          completion_time_seconds: number | null
          configuration_id: string | null
          consent_given: boolean
          consent_ip_hash: string | null
          consent_timestamp: string | null
          continent: string | null
          created_at: string
          cross_functional_collaboration: number | null
          data_retention_date: string | null
          deleted_at: string | null
          division: string | null
          follow_up_responses: Json | null
          id: string
          information_preferences: string[] | null
          is_draft: boolean | null
          job_satisfaction: number | null
          last_autosave_at: string | null
          leadership_openness: number | null
          manager_alignment: number | null
          manual_processes_focus: number | null
          motivation_factors: string[] | null
          performance_awareness: number | null
          pride_in_work: number | null
          recommend_company: number | null
          responses_jsonb: Json | null
          role: string | null
          safety_reporting_comfort: number | null
          session_id: string
          strategic_confidence: number | null
          submitted_at: string
          team_morale: number | null
          tools_equipment_quality: number | null
          training_satisfaction: number | null
          updated_at: string
          work_life_balance: number | null
          workload_manageability: number | null
          workplace_safety: number | null
        }
        Insert: {
          additional_comments?: string | null
          advancement_opportunities?: number | null
          collaboration_feedback?: string | null
          comfortable_suggesting_improvements?: number | null
          communication_clarity?: number | null
          communication_preferences?: string[] | null
          company_value_alignment?: number | null
          completion_time_seconds?: number | null
          configuration_id?: string | null
          consent_given?: boolean
          consent_ip_hash?: string | null
          consent_timestamp?: string | null
          continent?: string | null
          created_at?: string
          cross_functional_collaboration?: number | null
          data_retention_date?: string | null
          deleted_at?: string | null
          division?: string | null
          follow_up_responses?: Json | null
          id?: string
          information_preferences?: string[] | null
          is_draft?: boolean | null
          job_satisfaction?: number | null
          last_autosave_at?: string | null
          leadership_openness?: number | null
          manager_alignment?: number | null
          manual_processes_focus?: number | null
          motivation_factors?: string[] | null
          performance_awareness?: number | null
          pride_in_work?: number | null
          recommend_company?: number | null
          responses_jsonb?: Json | null
          role?: string | null
          safety_reporting_comfort?: number | null
          session_id: string
          strategic_confidence?: number | null
          submitted_at?: string
          team_morale?: number | null
          tools_equipment_quality?: number | null
          training_satisfaction?: number | null
          updated_at?: string
          work_life_balance?: number | null
          workload_manageability?: number | null
          workplace_safety?: number | null
        }
        Update: {
          additional_comments?: string | null
          advancement_opportunities?: number | null
          collaboration_feedback?: string | null
          comfortable_suggesting_improvements?: number | null
          communication_clarity?: number | null
          communication_preferences?: string[] | null
          company_value_alignment?: number | null
          completion_time_seconds?: number | null
          configuration_id?: string | null
          consent_given?: boolean
          consent_ip_hash?: string | null
          consent_timestamp?: string | null
          continent?: string | null
          created_at?: string
          cross_functional_collaboration?: number | null
          data_retention_date?: string | null
          deleted_at?: string | null
          division?: string | null
          follow_up_responses?: Json | null
          id?: string
          information_preferences?: string[] | null
          is_draft?: boolean | null
          job_satisfaction?: number | null
          last_autosave_at?: string | null
          leadership_openness?: number | null
          manager_alignment?: number | null
          manual_processes_focus?: number | null
          motivation_factors?: string[] | null
          performance_awareness?: number | null
          pride_in_work?: number | null
          recommend_company?: number | null
          responses_jsonb?: Json | null
          role?: string | null
          safety_reporting_comfort?: number | null
          session_id?: string
          strategic_confidence?: number | null
          submitted_at?: string
          team_morale?: number | null
          tools_equipment_quality?: number | null
          training_satisfaction?: number | null
          updated_at?: string
          work_life_balance?: number | null
          workload_manageability?: number | null
          workplace_safety?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_survey_responses_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "survey_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          benefit_class: string | null
          business_unit: string | null
          created_at: string
          department: string | null
          employee_number: string | null
          hire_date: string | null
          id: string
          is_active: boolean
          job_title: string | null
          location: string | null
          name_first: string
          name_last: string
          reports_to: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          work_category: string | null
        }
        Insert: {
          benefit_class?: string | null
          business_unit?: string | null
          created_at?: string
          department?: string | null
          employee_number?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          location?: string | null
          name_first: string
          name_last: string
          reports_to?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          work_category?: string | null
        }
        Update: {
          benefit_class?: string | null
          business_unit?: string | null
          created_at?: string
          department?: string | null
          employee_number?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          location?: string | null
          name_first?: string
          name_last?: string
          reports_to?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          work_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      emps: {
        Row: {
          badge_number: string | null
          created_at: string
          department: string | null
          display_name: string | null
          gdpr_consent_given: boolean | null
          gdpr_consent_timestamp: string | null
          id: string
          job_level: Database["public"]["Enums"]["job_level"] | null
          job_title: string | null
          location: Database["public"]["Enums"]["employee_location"] | null
          manager_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_number?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          gdpr_consent_given?: boolean | null
          gdpr_consent_timestamp?: string | null
          id?: string
          job_level?: Database["public"]["Enums"]["job_level"] | null
          job_title?: string | null
          location?: Database["public"]["Enums"]["employee_location"] | null
          manager_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_number?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          gdpr_consent_given?: boolean | null
          gdpr_consent_timestamp?: string | null
          id?: string
          job_level?: Database["public"]["Enums"]["job_level"] | null
          job_title?: string | null
          location?: Database["public"]["Enums"]["employee_location"] | null
          manager_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emps_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "emps"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      EpoxyMix: {
        Row: {
          "Cup A": string | null
          "Cup B": string | null
          "Daily Check": string | null
          Employee: number | null
          Humidity_1: string | null
          Humidity_2: string | null
          "Part A": string | null
          "Part B": string | null
          Ratio: string | null
          "Ratio Check": string | null
          Sensor_Timestamp: string | null
          Shutdown: string | null
          Startup: string | null
          Temperature_1: string | null
          Temperature_2: string | null
          Timestamp: string | null
          UUID: string
        }
        Insert: {
          "Cup A"?: string | null
          "Cup B"?: string | null
          "Daily Check"?: string | null
          Employee?: number | null
          Humidity_1?: string | null
          Humidity_2?: string | null
          "Part A"?: string | null
          "Part B"?: string | null
          Ratio?: string | null
          "Ratio Check"?: string | null
          Sensor_Timestamp?: string | null
          Shutdown?: string | null
          Startup?: string | null
          Temperature_1?: string | null
          Temperature_2?: string | null
          Timestamp?: string | null
          UUID: string
        }
        Update: {
          "Cup A"?: string | null
          "Cup B"?: string | null
          "Daily Check"?: string | null
          Employee?: number | null
          Humidity_1?: string | null
          Humidity_2?: string | null
          "Part A"?: string | null
          "Part B"?: string | null
          Ratio?: string | null
          "Ratio Check"?: string | null
          Sensor_Timestamp?: string | null
          Shutdown?: string | null
          Startup?: string | null
          Temperature_1?: string | null
          Temperature_2?: string | null
          Timestamp?: string | null
          UUID?: string
        }
        Relationships: []
      }
      escalations: {
        Row: {
          assigned_to: string | null
          created_at: string
          days_overdue: number | null
          escalation_type: string
          id: string
          order_id: string | null
          po_number: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          days_overdue?: number | null
          escalation_type: string
          id?: string
          order_id?: string | null
          po_number?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          days_overdue?: number | null
          escalation_type?: string
          id?: string
          order_id?: string | null
          po_number?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      forklift_checklist_questions: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          question_text: string
          sort_order: number
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          question_text: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          question_text?: string
          sort_order?: number
        }
        Relationships: []
      }
      forklift_checklist_responses: {
        Row: {
          admin_notes: string | null
          id: string
          question_id: string
          status: string
          submission_id: string
          timestamp: string | null
        }
        Insert: {
          admin_notes?: string | null
          id?: string
          question_id: string
          status: string
          submission_id: string
          timestamp?: string | null
        }
        Update: {
          admin_notes?: string | null
          id?: string
          question_id?: string
          status?: string
          submission_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forklift_checklist_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "forklift_checklist_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forklift_checklist_responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "forklift_checklist_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      forklift_checklist_submissions: {
        Row: {
          badge_number: string
          forklift_id: string
          has_failures: boolean | null
          id: string
          submitted_at: string | null
        }
        Insert: {
          badge_number: string
          forklift_id: string
          has_failures?: boolean | null
          id?: string
          submitted_at?: string | null
        }
        Update: {
          badge_number?: string
          forklift_id?: string
          has_failures?: boolean | null
          id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forklift_checklist_submissions_forklift_id_fkey"
            columns: ["forklift_id"]
            isOneToOne: false
            referencedRelation: "forklift_units"
            referencedColumns: ["id"]
          },
        ]
      }
      forklift_fail_notifications: {
        Row: {
          badge_number: string
          created_at: string | null
          forklift_name: string
          id: string
          is_read: boolean | null
          question_id: string
          question_text: string
          submission_id: string
        }
        Insert: {
          badge_number: string
          created_at?: string | null
          forklift_name: string
          id?: string
          is_read?: boolean | null
          question_id: string
          question_text: string
          submission_id: string
        }
        Update: {
          badge_number?: string
          created_at?: string | null
          forklift_name?: string
          id?: string
          is_read?: boolean | null
          question_id?: string
          question_text?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forklift_fail_notifications_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "forklift_checklist_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forklift_fail_notifications_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "forklift_checklist_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      forklift_qualified_drivers: {
        Row: {
          badge_number: string
          created_at: string | null
          driver_name: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          badge_number: string
          created_at?: string | null
          driver_name: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          badge_number?: string
          created_at?: string | null
          driver_name?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      forklift_question_assignments: {
        Row: {
          created_at: string | null
          forklift_id: string
          id: string
          question_id: string
        }
        Insert: {
          created_at?: string | null
          forklift_id: string
          id?: string
          question_id: string
        }
        Update: {
          created_at?: string | null
          forklift_id?: string
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forklift_question_assignments_forklift_id_fkey"
            columns: ["forklift_id"]
            isOneToOne: false
            referencedRelation: "forklift_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forklift_question_assignments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "forklift_checklist_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      forklift_units: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          unit_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          unit_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          unit_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      iframe_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_activity: string
          origin_domain: string
          token_hash: string
          user_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_activity?: string
          origin_domain: string
          token_hash: string
          user_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_activity?: string
          origin_domain?: string
          token_hash?: string
          user_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      intent_patterns: {
        Row: {
          api_endpoint: string | null
          character_id: string
          confidence_threshold: number | null
          created_at: string | null
          id: string
          intent_name: string
          pattern_text: string
          response_template: string | null
        }
        Insert: {
          api_endpoint?: string | null
          character_id: string
          confidence_threshold?: number | null
          created_at?: string | null
          id?: string
          intent_name: string
          pattern_text: string
          response_template?: string | null
        }
        Update: {
          api_endpoint?: string | null
          character_id?: string
          confidence_threshold?: number | null
          created_at?: string | null
          id?: string
          intent_name?: string
          pattern_text?: string
          response_template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intent_patterns_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      interaction_analytics: {
        Row: {
          created_at: string
          id: string
          order_found: boolean
          query_type: string
          response_time: number
          satisfaction_score: number | null
          updated_at: string
          urgency_level: string
          user_role: string
          user_session: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_found?: boolean
          query_type: string
          response_time: number
          satisfaction_score?: number | null
          updated_at?: string
          urgency_level?: string
          user_role?: string
          user_session: string
        }
        Update: {
          created_at?: string
          id?: string
          order_found?: boolean
          query_type?: string
          response_time?: number
          satisfaction_score?: number | null
          updated_at?: string
          urgency_level?: string
          user_role?: string
          user_session?: string
        }
        Relationships: []
      }
      license_users: {
        Row: {
          created_at: string
          id: string
          last_access: string | null
          license_id: string
          user_identifier: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_access?: string | null
          license_id: string
          user_identifier: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_access?: string | null
          license_id?: string
          user_identifier?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_users_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          company_name: string
          contact_email: string
          contact_name: string | null
          created_at: string
          custom_domain: string | null
          id: string
          is_active: boolean
          license_code: string
          qr_code_url: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_name?: string | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          license_code: string
          qr_code_url?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_name?: string | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          license_code?: string
          qr_code_url?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      "MAI Customers": {
        Row: {
          Customer: string | null
          CustomerAddress: string | null
          CustomerGoogleMarker: string | null
          CustomerPhone: string | null
          "Quote $$ (12mo)": number | null
          "Quotes(12mo)": number | null
          sales2022: number | null
          sales2023: number | null
          sales2024: number | null
          sales2025: number | null
          "Ship To Name": string | null
          shipid: number
          ShipToAddress: string | null
          ShipToGoogleMarker: string | null
        }
        Insert: {
          Customer?: string | null
          CustomerAddress?: string | null
          CustomerGoogleMarker?: string | null
          CustomerPhone?: string | null
          "Quote $$ (12mo)"?: number | null
          "Quotes(12mo)"?: number | null
          sales2022?: number | null
          sales2023?: number | null
          sales2024?: number | null
          sales2025?: number | null
          "Ship To Name"?: string | null
          shipid: number
          ShipToAddress?: string | null
          ShipToGoogleMarker?: string | null
        }
        Update: {
          Customer?: string | null
          CustomerAddress?: string | null
          CustomerGoogleMarker?: string | null
          CustomerPhone?: string | null
          "Quote $$ (12mo)"?: number | null
          "Quotes(12mo)"?: number | null
          sales2022?: number | null
          sales2023?: number | null
          sales2024?: number | null
          sales2025?: number | null
          "Ship To Name"?: string | null
          shipid?: number
          ShipToAddress?: string | null
          ShipToGoogleMarker?: string | null
        }
        Relationships: []
      }
      market_research_reports: {
        Row: {
          competitive_landscape: Json
          consumer_analysis: string
          created_at: string
          executive_summary: string
          future_predictions: string
          id: string
          market_segmentation: Json
          market_size: Json
          recommendations: Json
          swot_analysis: Json
          topic_id: string
          trends: Json
          updated_at: string
        }
        Insert: {
          competitive_landscape: Json
          consumer_analysis: string
          created_at?: string
          executive_summary: string
          future_predictions: string
          id?: string
          market_segmentation: Json
          market_size: Json
          recommendations: Json
          swot_analysis: Json
          topic_id: string
          trends: Json
          updated_at?: string
        }
        Update: {
          competitive_landscape?: Json
          consumer_analysis?: string
          created_at?: string
          executive_summary?: string
          future_predictions?: string
          id?: string
          market_segmentation?: Json
          market_size?: Json
          recommendations?: Json
          swot_analysis?: Json
          topic_id?: string
          trends?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_research_reports_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "market_research_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      market_research_topics: {
        Row: {
          created_at: string
          id: string
          status: string
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      match_feedback: {
        Row: {
          created_at: string | null
          document_id: string | null
          feedback_type: string | null
          id: string
          match_context: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          feedback_type?: string | null
          id?: string
          match_context?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          feedback_type?: string | null
          id?: string
          match_context?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_feedback_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "training_data"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_recordings: {
        Row: {
          audio_url: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          is_processed: boolean | null
          license_id: string | null
          title: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_processed?: boolean | null
          license_id?: string | null
          title?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_processed?: boolean | null
          license_id?: string | null
          title?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_recordings_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_summaries: {
        Row: {
          created_at: string | null
          id: string
          key_points: Json | null
          license_id: string | null
          recording_id: string | null
          summary: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_points?: Json | null
          license_id?: string | null
          recording_id?: string | null
          summary: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key_points?: Json | null
          license_id?: string | null
          recording_id?: string | null
          summary?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_summaries_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_summaries_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "meeting_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          is_completed: boolean | null
          license_id: string | null
          recording_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          license_id?: string | null
          recording_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          license_id?: string | null
          recording_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_tasks_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_tasks_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "meeting_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      mto_backlog: {
        Row: {
          backlog_data: string | null
          created_at: string
          id: string
          month: string | null
          order_count: number
          status: string | null
          total_amount: number
        }
        Insert: {
          backlog_data?: string | null
          created_at?: string
          id?: string
          month?: string | null
          order_count?: number
          status?: string | null
          total_amount?: number
        }
        Update: {
          backlog_data?: string | null
          created_at?: string
          id?: string
          month?: string | null
          order_count?: number
          status?: string | null
          total_amount?: number
        }
        Relationships: []
      }
      mto_delivery: {
        Row: {
          april_otd: number | null
          august_otd: number | null
          created_at: string | null
          current_year: number | null
          december_otd: number | null
          february_otd: number | null
          id: string
          january_otd: number | null
          july_otd: number | null
          june_otd: number | null
          last_updated_month: string | null
          march_otd: number | null
          may_otd: number | null
          november_otd: number | null
          october_otd: number | null
          september_otd: number | null
          updated_at: string | null
        }
        Insert: {
          april_otd?: number | null
          august_otd?: number | null
          created_at?: string | null
          current_year?: number | null
          december_otd?: number | null
          february_otd?: number | null
          id?: string
          january_otd?: number | null
          july_otd?: number | null
          june_otd?: number | null
          last_updated_month?: string | null
          march_otd?: number | null
          may_otd?: number | null
          november_otd?: number | null
          october_otd?: number | null
          september_otd?: number | null
          updated_at?: string | null
        }
        Update: {
          april_otd?: number | null
          august_otd?: number | null
          created_at?: string | null
          current_year?: number | null
          december_otd?: number | null
          february_otd?: number | null
          id?: string
          january_otd?: number | null
          july_otd?: number | null
          june_otd?: number | null
          last_updated_month?: string | null
          march_otd?: number | null
          may_otd?: number | null
          november_otd?: number | null
          october_otd?: number | null
          september_otd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mto_incoming: {
        Row: {
          created_at: string | null
          gmMonth: number | null
          id: string
          incoming: number | null
          month: string | null
        }
        Insert: {
          created_at?: string | null
          gmMonth?: number | null
          id?: string
          incoming?: number | null
          month?: string | null
        }
        Update: {
          created_at?: string | null
          gmMonth?: number | null
          id?: string
          incoming?: number | null
          month?: string | null
        }
        Relationships: []
      }
      mto_metadata: {
        Row: {
          created_at: string | null
          id: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          id: string
          timestamp: string
        }
        Update: {
          created_at?: string | null
          id?: string
          timestamp?: string
        }
        Relationships: []
      }
      mto_shipclerk: {
        Row: {
          created_at: string
          id: string
          import_amount: number
          month: string | null
          orders_data: string | null
          pending_count: number
          processed_count: number
          total_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          import_amount?: number
          month?: string | null
          orders_data?: string | null
          pending_count?: number
          processed_count?: number
          total_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          import_amount?: number
          month?: string | null
          orders_data?: string | null
          pending_count?: number
          processed_count?: number
          total_amount?: number
        }
        Relationships: []
      }
      mto_shipments: {
        Row: {
          budgetamount: number
          created_at: string
          id: string
          monthtotal: number
          productgroup: string
          shipamount: number
          shipnotinvoiced: number
        }
        Insert: {
          budgetamount?: number
          created_at?: string
          id?: string
          monthtotal?: number
          productgroup: string
          shipamount?: number
          shipnotinvoiced?: number
        }
        Update: {
          budgetamount?: number
          created_at?: string
          id?: string
          monthtotal?: number
          productgroup?: string
          shipamount?: number
          shipnotinvoiced?: number
        }
        Relationships: []
      }
      mto_status: {
        Row: {
          Country: string | null
          "Cr Override": boolean | null
          "Credit Hold": boolean | null
          "Credit Hold Source": string | null
          "Credit Limit": number | null
          "Cust. ID": string | null
          dd: string
          Description: string | null
          "Entry Person": string | null
          FOB: string | null
          "Memo Description": string | null
          Name: string | null
          NextRelDt: string | null
          "On Hold": boolean | null
          Order: number | null
          "Order Amount": number | null
          "Order Date": string | null
          PO: string | null
          "Ship By": string | null
          Site: number | null
          Terms: string | null
        }
        Insert: {
          Country?: string | null
          "Cr Override"?: boolean | null
          "Credit Hold"?: boolean | null
          "Credit Hold Source"?: string | null
          "Credit Limit"?: number | null
          "Cust. ID"?: string | null
          dd?: string
          Description?: string | null
          "Entry Person"?: string | null
          FOB?: string | null
          "Memo Description"?: string | null
          Name?: string | null
          NextRelDt?: string | null
          "On Hold"?: boolean | null
          Order?: number | null
          "Order Amount"?: number | null
          "Order Date"?: string | null
          PO?: string | null
          "Ship By"?: string | null
          Site?: number | null
          Terms?: string | null
        }
        Update: {
          Country?: string | null
          "Cr Override"?: boolean | null
          "Credit Hold"?: boolean | null
          "Credit Hold Source"?: string | null
          "Credit Limit"?: number | null
          "Cust. ID"?: string | null
          dd?: string
          Description?: string | null
          "Entry Person"?: string | null
          FOB?: string | null
          "Memo Description"?: string | null
          Name?: string | null
          NextRelDt?: string | null
          "On Hold"?: boolean | null
          Order?: number | null
          "Order Amount"?: number | null
          "Order Date"?: string | null
          PO?: string | null
          "Ship By"?: string | null
          Site?: number | null
          Terms?: string | null
        }
        Relationships: []
      }
      notes_audit: {
        Row: {
          actor_employee_id: string
          created_at: string | null
          event_metadata: Json | null
          event_type: string
          id: string
          note_id: string
        }
        Insert: {
          actor_employee_id: string
          created_at?: string | null
          event_metadata?: Json | null
          event_type: string
          id?: string
          note_id: string
        }
        Update: {
          actor_employee_id?: string
          created_at?: string | null
          event_metadata?: Json | null
          event_type?: string
          id?: string
          note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_audit_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes_board_permissions: {
        Row: {
          board_id: string
          created_at: string | null
          employee_id: string
          id: string
          permission_type: string
        }
        Insert: {
          board_id: string
          created_at?: string | null
          employee_id: string
          id?: string
          permission_type: string
        }
        Update: {
          board_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          permission_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_board_permissions_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "notes_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      notes_boards: {
        Row: {
          board_name: string
          board_type: string
          created_at: string | null
          department: string | null
          facility: string | null
          id: string
          is_active: boolean | null
          owner_employee_id: string | null
          updated_at: string | null
        }
        Insert: {
          board_name: string
          board_type: string
          created_at?: string | null
          department?: string | null
          facility?: string | null
          id?: string
          is_active?: boolean | null
          owner_employee_id?: string | null
          updated_at?: string | null
        }
        Update: {
          board_name?: string
          board_type?: string
          created_at?: string | null
          department?: string | null
          facility?: string | null
          id?: string
          is_active?: boolean | null
          owner_employee_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notes_notes: {
        Row: {
          author_employee_id: string
          background_color: string | null
          board_id: string
          content: string
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          is_company_wide: boolean | null
          original_note_id: string | null
          target_business_units: string[] | null
          target_departments: string[] | null
          target_facilities: string[] | null
          target_roles: string[] | null
          target_user_ids: string[] | null
        }
        Insert: {
          author_employee_id: string
          background_color?: string | null
          board_id: string
          content: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          is_company_wide?: boolean | null
          original_note_id?: string | null
          target_business_units?: string[] | null
          target_departments?: string[] | null
          target_facilities?: string[] | null
          target_roles?: string[] | null
          target_user_ids?: string[] | null
        }
        Update: {
          author_employee_id?: string
          background_color?: string | null
          board_id?: string
          content?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          is_company_wide?: boolean | null
          original_note_id?: string | null
          target_business_units?: string[] | null
          target_departments?: string[] | null
          target_facilities?: string[] | null
          target_roles?: string[] | null
          target_user_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_notes_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "notes_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_notes_original_note_id_fkey"
            columns: ["original_note_id"]
            isOneToOne: false
            referencedRelation: "notes_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes_visibility: {
        Row: {
          created_at: string | null
          id: string
          is_dimmed: boolean | null
          note_id: string
          updated_at: string | null
          viewer_employee_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_dimmed?: boolean | null
          note_id: string
          updated_at?: string | null
          viewer_employee_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_dimmed?: boolean | null
          note_id?: string
          updated_at?: string | null
          viewer_employee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_visibility_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      OCW_magwiz: {
        Row: {
          ambient_temperature_A: number | null
          ambient_temperature_B: number | null
          ambient_temperature_C: number | null
          backbar_dimension: string | null
          backbar_mass: number | null
          coil_height: number | null
          cold_ampere_turns_A: number | null
          cold_ampere_turns_B: number | null
          cold_ampere_turns_C: number | null
          cold_current_A: number | null
          cold_current_B: number | null
          cold_current_C: number | null
          conservator_dimension: string | null
          conservator_mass: number | null
          coolant_mass: number | null
          core_backbar_dimension: string | null
          core_backbar_mass: number | null
          core_dimension: string | null
          core_insulator_dimension: string | null
          core_insulator_mass: number | null
          core_mass: number | null
          diameter: number | null
          expected_rise_A: number | null
          expected_rise_B: number | null
          expected_rise_C: number | null
          filename: string
          hot_ampere_turns_A: number | null
          hot_ampere_turns_B: number | null
          hot_ampere_turns_C: number | null
          hot_current_A: number | null
          hot_current_B: number | null
          hot_current_C: number | null
          magnet_dimension: string | null
          maximum_rise_A: number | null
          maximum_rise_B: number | null
          maximum_rise_C: number | null
          mean_length_of_turn: number | null
          number_of_sections: number | null
          number_of_turns: string | null
          prefix: string | null
          radial_depth: number | null
          resistance_A: number | null
          resistance_B: number | null
          resistance_C: number | null
          sealing_plate_dimension: string | null
          sealing_plate_mass: number | null
          side_pole_dimension: string | null
          side_pole_mass: number | null
          suffix: string | null
          surface_area: number | null
          temperature_rise_A: number | null
          temperature_rise_B: number | null
          temperature_rise_C: number | null
          total_mass: number | null
          voltage_A: number | null
          voltage_B: number | null
          voltage_C: number | null
          watts_A: number | null
          watts_B: number | null
          watts_C: number | null
          winding_dimension: string | null
          winding_mass: number | null
          wires_in_parallel: number | null
        }
        Insert: {
          ambient_temperature_A?: number | null
          ambient_temperature_B?: number | null
          ambient_temperature_C?: number | null
          backbar_dimension?: string | null
          backbar_mass?: number | null
          coil_height?: number | null
          cold_ampere_turns_A?: number | null
          cold_ampere_turns_B?: number | null
          cold_ampere_turns_C?: number | null
          cold_current_A?: number | null
          cold_current_B?: number | null
          cold_current_C?: number | null
          conservator_dimension?: string | null
          conservator_mass?: number | null
          coolant_mass?: number | null
          core_backbar_dimension?: string | null
          core_backbar_mass?: number | null
          core_dimension?: string | null
          core_insulator_dimension?: string | null
          core_insulator_mass?: number | null
          core_mass?: number | null
          diameter?: number | null
          expected_rise_A?: number | null
          expected_rise_B?: number | null
          expected_rise_C?: number | null
          filename: string
          hot_ampere_turns_A?: number | null
          hot_ampere_turns_B?: number | null
          hot_ampere_turns_C?: number | null
          hot_current_A?: number | null
          hot_current_B?: number | null
          hot_current_C?: number | null
          magnet_dimension?: string | null
          maximum_rise_A?: number | null
          maximum_rise_B?: number | null
          maximum_rise_C?: number | null
          mean_length_of_turn?: number | null
          number_of_sections?: number | null
          number_of_turns?: string | null
          prefix?: string | null
          radial_depth?: number | null
          resistance_A?: number | null
          resistance_B?: number | null
          resistance_C?: number | null
          sealing_plate_dimension?: string | null
          sealing_plate_mass?: number | null
          side_pole_dimension?: string | null
          side_pole_mass?: number | null
          suffix?: string | null
          surface_area?: number | null
          temperature_rise_A?: number | null
          temperature_rise_B?: number | null
          temperature_rise_C?: number | null
          total_mass?: number | null
          voltage_A?: number | null
          voltage_B?: number | null
          voltage_C?: number | null
          watts_A?: number | null
          watts_B?: number | null
          watts_C?: number | null
          winding_dimension?: string | null
          winding_mass?: number | null
          wires_in_parallel?: number | null
        }
        Update: {
          ambient_temperature_A?: number | null
          ambient_temperature_B?: number | null
          ambient_temperature_C?: number | null
          backbar_dimension?: string | null
          backbar_mass?: number | null
          coil_height?: number | null
          cold_ampere_turns_A?: number | null
          cold_ampere_turns_B?: number | null
          cold_ampere_turns_C?: number | null
          cold_current_A?: number | null
          cold_current_B?: number | null
          cold_current_C?: number | null
          conservator_dimension?: string | null
          conservator_mass?: number | null
          coolant_mass?: number | null
          core_backbar_dimension?: string | null
          core_backbar_mass?: number | null
          core_dimension?: string | null
          core_insulator_dimension?: string | null
          core_insulator_mass?: number | null
          core_mass?: number | null
          diameter?: number | null
          expected_rise_A?: number | null
          expected_rise_B?: number | null
          expected_rise_C?: number | null
          filename?: string
          hot_ampere_turns_A?: number | null
          hot_ampere_turns_B?: number | null
          hot_ampere_turns_C?: number | null
          hot_current_A?: number | null
          hot_current_B?: number | null
          hot_current_C?: number | null
          magnet_dimension?: string | null
          maximum_rise_A?: number | null
          maximum_rise_B?: number | null
          maximum_rise_C?: number | null
          mean_length_of_turn?: number | null
          number_of_sections?: number | null
          number_of_turns?: string | null
          prefix?: string | null
          radial_depth?: number | null
          resistance_A?: number | null
          resistance_B?: number | null
          resistance_C?: number | null
          sealing_plate_dimension?: string | null
          sealing_plate_mass?: number | null
          side_pole_dimension?: string | null
          side_pole_mass?: number | null
          suffix?: string | null
          surface_area?: number | null
          temperature_rise_A?: number | null
          temperature_rise_B?: number | null
          temperature_rise_C?: number | null
          total_mass?: number | null
          voltage_A?: number | null
          voltage_B?: number | null
          voltage_C?: number | null
          watts_A?: number | null
          watts_B?: number | null
          watts_C?: number | null
          winding_dimension?: string | null
          winding_mass?: number | null
          wires_in_parallel?: number | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          content_type: string
          created_at: string | null
          filename: string
          id: string
          test_result_id: string
          url: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          filename: string
          id: string
          test_result_id: string
          url: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          filename?: string
          id?: string
          test_result_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_test_result_id_fkey"
            columns: ["test_result_id"]
            isOneToOne: false
            referencedRelation: "test_results"
            referencedColumns: ["id"]
          },
        ]
      }
      product_knowledge_embeddings: {
        Row: {
          chunk_title: string
          content_md: string
          created_at: string | null
          embedding: string
          id: string
          is_quiz_question: boolean | null
          product_line: string
          source_doc: string | null
          source_page: number | null
          tags: string[] | null
          training_level: string | null
        }
        Insert: {
          chunk_title: string
          content_md: string
          created_at?: string | null
          embedding: string
          id?: string
          is_quiz_question?: boolean | null
          product_line: string
          source_doc?: string | null
          source_page?: number | null
          tags?: string[] | null
          training_level?: string | null
        }
        Update: {
          chunk_title?: string
          content_md?: string
          created_at?: string | null
          embedding?: string
          id?: string
          is_quiz_question?: boolean | null
          product_line?: string
          source_doc?: string | null
          source_page?: number | null
          tags?: string[] | null
          training_level?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          conversation_preferences: string | null
          created_at: string
          encryption_salt: string | null
          first_name: string | null
          id: string
          is_demo_user: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          conversation_preferences?: string | null
          created_at?: string
          encryption_salt?: string | null
          first_name?: string | null
          id: string
          is_demo_user?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          conversation_preferences?: string | null
          created_at?: string
          encryption_salt?: string | null
          first_name?: string | null
          id?: string
          is_demo_user?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      prospector: {
        Row: {
          csv: string | null
          cust_Latitude: string | null
          cust_Longitude: string | null
          cust_name: string | null
          customer_address: string | null
          group: string | null
          order: number | null
          part: string | null
          part_desc: string | null
          qty: number | null
          ship_date: string | null
          shipto_address: string | null
          shipto_Latitude: string | null
          shipto_Longitude: string | null
          terrotory: string | null
          uuid: string
          value: number | null
        }
        Insert: {
          csv?: string | null
          cust_Latitude?: string | null
          cust_Longitude?: string | null
          cust_name?: string | null
          customer_address?: string | null
          group?: string | null
          order?: number | null
          part?: string | null
          part_desc?: string | null
          qty?: number | null
          ship_date?: string | null
          shipto_address?: string | null
          shipto_Latitude?: string | null
          shipto_Longitude?: string | null
          terrotory?: string | null
          uuid?: string
          value?: number | null
        }
        Update: {
          csv?: string | null
          cust_Latitude?: string | null
          cust_Longitude?: string | null
          cust_name?: string | null
          customer_address?: string | null
          group?: string | null
          order?: number | null
          part?: string | null
          part_desc?: string | null
          qty?: number | null
          ship_date?: string | null
          shipto_address?: string | null
          shipto_Latitude?: string | null
          shipto_Longitude?: string | null
          terrotory?: string | null
          uuid?: string
          value?: number | null
        }
        Relationships: []
      }
      prospector2: {
        Row: {
          Address: string | null
          "Cust ID": number
          Customer: string | null
          Latitude: number | null
          Longitude: number | null
          Phone: string | null
          QuotedAmtLastYear: number | null
          QuotesLastYear: number | null
          sales2022: number | null
          sales2023: number | null
          sales2024: number | null
          sales2025: number | null
          salesFourYear: number | null
        }
        Insert: {
          Address?: string | null
          "Cust ID": number
          Customer?: string | null
          Latitude?: number | null
          Longitude?: number | null
          Phone?: string | null
          QuotedAmtLastYear?: number | null
          QuotesLastYear?: number | null
          sales2022?: number | null
          sales2023?: number | null
          sales2024?: number | null
          sales2025?: number | null
          salesFourYear?: number | null
        }
        Update: {
          Address?: string | null
          "Cust ID"?: number
          Customer?: string | null
          Latitude?: number | null
          Longitude?: number | null
          Phone?: string | null
          QuotedAmtLastYear?: number | null
          QuotesLastYear?: number | null
          sales2022?: number | null
          sales2023?: number | null
          sales2024?: number | null
          sales2025?: number | null
          salesFourYear?: number | null
        }
        Relationships: []
      }
      pt_entities: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pt_locations: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pt_locations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "pt_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      pt_test_results: {
        Row: {
          attachment: string | null
          avg_pull: number | null
          comment: string | null
          created_at: string | null
          expected_max: number | null
          expected_min: number | null
          id: string
          inspector_name: string | null
          location_id: string | null
          magnet_id: string | null
          photo_path: string | null
          photo_url: string | null
          pull_test_1: number | null
          pull_test_2: number | null
          pull_test_3: number | null
          pull_test_4: number | null
          pull_test_5: number | null
          pull_test_6: number | null
          serial_number: string | null
          status: string | null
          test_date: string | null
          test_equipment: string | null
          test_type: string | null
          user_id: string | null
        }
        Insert: {
          attachment?: string | null
          avg_pull?: number | null
          comment?: string | null
          created_at?: string | null
          expected_max?: number | null
          expected_min?: number | null
          id: string
          inspector_name?: string | null
          location_id?: string | null
          magnet_id?: string | null
          photo_path?: string | null
          photo_url?: string | null
          pull_test_1?: number | null
          pull_test_2?: number | null
          pull_test_3?: number | null
          pull_test_4?: number | null
          pull_test_5?: number | null
          pull_test_6?: number | null
          serial_number?: string | null
          status?: string | null
          test_date?: string | null
          test_equipment?: string | null
          test_type?: string | null
          user_id?: string | null
        }
        Update: {
          attachment?: string | null
          avg_pull?: number | null
          comment?: string | null
          created_at?: string | null
          expected_max?: number | null
          expected_min?: number | null
          id?: string
          inspector_name?: string | null
          location_id?: string | null
          magnet_id?: string | null
          photo_path?: string | null
          photo_url?: string | null
          pull_test_1?: number | null
          pull_test_2?: number | null
          pull_test_3?: number | null
          pull_test_4?: number | null
          pull_test_5?: number | null
          pull_test_6?: number | null
          serial_number?: string | null
          status?: string | null
          test_date?: string | null
          test_equipment?: string | null
          test_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pt_test_results_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "pt_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      pto_requests: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          created_at: string
          employee_id: string
          end_date: string
          hours_requested: number
          id: string
          notes: string | null
          request_type: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          hours_requested: number
          id?: string
          notes?: string | null
          request_type: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          hours_requested?: number
          id?: string
          notes?: string | null
          request_type?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pto_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      pulltest_entities: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          access_token: string | null
          coming_soon: boolean | null
          created_at: string | null
          description: string
          icon_path: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          url: string
          video_url: string | null
        }
        Insert: {
          access_token?: string | null
          coming_soon?: boolean | null
          created_at?: string | null
          description: string
          icon_path?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          url: string
          video_url?: string | null
        }
        Update: {
          access_token?: string | null
          coming_soon?: boolean | null
          created_at?: string | null
          description?: string
          icon_path?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          url?: string
          video_url?: string | null
        }
        Relationships: []
      }
      rvw_calibration_sessions: {
        Row: {
          attendees: string[] | null
          created_at: string
          cycle_id: string
          facilitator_id: string | null
          id: string
          notes: string | null
          session_date: string
          status: string
          updated_at: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          cycle_id: string
          facilitator_id?: string | null
          id?: string
          notes?: string | null
          session_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          cycle_id?: string
          facilitator_id?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_calibration_sessions_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "rvw_review_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_calibration_sessions_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "emps"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_competency_scores: {
        Row: {
          competency_type: string
          created_at: string
          id: string
          manager_comments: string | null
          manager_score: number | null
          observable_behaviors: string | null
          review_id: string
          self_comments: string | null
          self_score: number | null
          updated_at: string
        }
        Insert: {
          competency_type: string
          created_at?: string
          id?: string
          manager_comments?: string | null
          manager_score?: number | null
          observable_behaviors?: string | null
          review_id: string
          self_comments?: string | null
          self_score?: number | null
          updated_at?: string
        }
        Update: {
          competency_type?: string
          created_at?: string
          id?: string
          manager_comments?: string | null
          manager_score?: number | null
          observable_behaviors?: string | null
          review_id?: string
          self_comments?: string | null
          self_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_competency_scores_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "rvw_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_employee_census: {
        Row: {
          badge_number: string | null
          department: string | null
          email: string | null
          employee_name: string
          hire_date: string | null
          id: string
          imported_at: string | null
          job_level: string | null
          job_title: string | null
          location: string | null
          manager_email: string | null
          manager_name: string | null
          match_status: string | null
          matched_emp_id: string | null
          notes: string | null
          processed: boolean | null
        }
        Insert: {
          badge_number?: string | null
          department?: string | null
          email?: string | null
          employee_name: string
          hire_date?: string | null
          id?: string
          imported_at?: string | null
          job_level?: string | null
          job_title?: string | null
          location?: string | null
          manager_email?: string | null
          manager_name?: string | null
          match_status?: string | null
          matched_emp_id?: string | null
          notes?: string | null
          processed?: boolean | null
        }
        Update: {
          badge_number?: string | null
          department?: string | null
          email?: string | null
          employee_name?: string
          hire_date?: string | null
          id?: string
          imported_at?: string | null
          job_level?: string | null
          job_title?: string | null
          location?: string | null
          manager_email?: string | null
          manager_name?: string | null
          match_status?: string | null
          matched_emp_id?: string | null
          notes?: string | null
          processed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "rvw_employee_census_matched_emp_id_fkey"
            columns: ["matched_emp_id"]
            isOneToOne: false
            referencedRelation: "emps"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_goals: {
        Row: {
          actual_result: string | null
          created_at: string
          description: string | null
          id: string
          manager_comments: string | null
          manager_score: number | null
          review_id: string
          self_comments: string | null
          self_score: number | null
          sort_order: number | null
          target_kpi: string | null
          title: string
          updated_at: string
          weight: number
        }
        Insert: {
          actual_result?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager_comments?: string | null
          manager_score?: number | null
          review_id: string
          self_comments?: string | null
          self_score?: number | null
          sort_order?: number | null
          target_kpi?: string | null
          title: string
          updated_at?: string
          weight?: number
        }
        Update: {
          actual_result?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager_comments?: string | null
          manager_score?: number | null
          review_id?: string
          self_comments?: string | null
          self_score?: number | null
          sort_order?: number | null
          target_kpi?: string | null
          title?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "rvw_goals_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "rvw_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_matrix_snapshots: {
        Row: {
          competency_score: number | null
          created_at: string
          cycle_id: string
          employee_id: string
          id: string
          matrix_position: string | null
          matrix_zone: string | null
          performance_score: number | null
        }
        Insert: {
          competency_score?: number | null
          created_at?: string
          cycle_id: string
          employee_id: string
          id?: string
          matrix_position?: string | null
          matrix_zone?: string | null
          performance_score?: number | null
        }
        Update: {
          competency_score?: number | null
          created_at?: string
          cycle_id?: string
          employee_id?: string
          id?: string
          matrix_position?: string | null
          matrix_zone?: string | null
          performance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rvw_matrix_snapshots_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "rvw_review_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_matrix_snapshots_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "emps"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rvw_review_cycles: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          org_id: string
          start_date: string
          status: string
          template_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          org_id: string
          start_date: string
          status?: string
          template_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          org_id?: string
          start_date?: string
          status?: string
          template_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_review_cycles_org_id_fkey1"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "rvw_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_review_cycles_template_id_fkey1"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "rvw_review_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_review_responses: {
        Row: {
          created_at: string
          id: string
          responder_type: string
          responses_json: Json
          review_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          responder_type: string
          responses_json?: Json
          review_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          responder_type?: string
          responses_json?: Json
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_review_responses_review_id_fkey1"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "rvw_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_review_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          questions_json: Json
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          questions_json?: Json
          template_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          questions_json?: Json
          template_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_review_templates_org_id_fkey1"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "rvw_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_reviews: {
        Row: {
          achievements: string[] | null
          calibration_notes: string | null
          competency_score: number | null
          created_at: string
          cycle_id: string
          employee_id: string
          employee_submitted_at: string | null
          final_rating: string | null
          id: string
          improvements: string[] | null
          manager_id: string | null
          manager_submitted_at: string | null
          performance_score: number | null
          published_at: string | null
          signed_at: string | null
          status: string
          strengths: string[] | null
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          calibration_notes?: string | null
          competency_score?: number | null
          created_at?: string
          cycle_id: string
          employee_id: string
          employee_submitted_at?: string | null
          final_rating?: string | null
          id?: string
          improvements?: string[] | null
          manager_id?: string | null
          manager_submitted_at?: string | null
          performance_score?: number | null
          published_at?: string | null
          signed_at?: string | null
          status?: string
          strengths?: string[] | null
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          calibration_notes?: string | null
          competency_score?: number | null
          created_at?: string
          cycle_id?: string
          employee_id?: string
          employee_submitted_at?: string | null
          final_rating?: string | null
          id?: string
          improvements?: string[] | null
          manager_id?: string | null
          manager_submitted_at?: string | null
          performance_score?: number | null
          published_at?: string | null
          signed_at?: string | null
          status?: string
          strengths?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_reviews_cycle_id_fkey1"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "rvw_review_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_reviews_employee_id_fkey1"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "rvw_user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_reviews_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "rvw_user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      rvw_user_roles: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          job_title: string | null
          manager_id: string | null
          org_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          job_title?: string | null
          manager_id?: string | null
          org_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          job_title?: string | null
          manager_id?: string | null
          org_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_user_roles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "emps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_user_roles_manager_id_fkey1"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "rvw_user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_user_roles_org_id_fkey1"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "rvw_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_tools: {
        Row: {
          coming_soon: boolean | null
          created_at: string | null
          description: string
          icon_path: string | null
          id: string
          is_active: boolean | null
          name: string
          token: string | null
          updated_at: string | null
          url: string
          video_url: string | null
        }
        Insert: {
          coming_soon?: boolean | null
          created_at?: string | null
          description: string
          icon_path?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          token?: string | null
          updated_at?: string | null
          url: string
          video_url?: string | null
        }
        Update: {
          coming_soon?: boolean | null
          created_at?: string | null
          description?: string
          icon_path?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          token?: string | null
          updated_at?: string | null
          url?: string
          video_url?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          created_at: string
          error_message: string | null
          geocoded_lat: number | null
          geocoded_lng: number | null
          google_results_count: number | null
          id: string
          ip_address: unknown
          prospector_results_count: number | null
          search_duration_ms: number | null
          search_location: string
          search_query: string | null
          search_radius: number
          total_results_count: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          geocoded_lat?: number | null
          geocoded_lng?: number | null
          google_results_count?: number | null
          id?: string
          ip_address?: unknown
          prospector_results_count?: number | null
          search_duration_ms?: number | null
          search_location: string
          search_query?: string | null
          search_radius?: number
          total_results_count?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          geocoded_lat?: number | null
          geocoded_lng?: number | null
          google_results_count?: number | null
          id?: string
          ip_address?: unknown
          prospector_results_count?: number | null
          search_duration_ms?: number | null
          search_location?: string
          search_query?: string | null
          search_radius?: number
          total_results_count?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      shipment_history: {
        Row: {
          created_at: string | null
          id: string
          month: string
          month_index: number
          monthly_value: number | null
          target_value: number
          updated_at: string | null
          year: number
          ytd_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          month_index: number
          monthly_value?: number | null
          target_value: number
          updated_at?: string | null
          year: number
          ytd_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          month_index?: number
          monthly_value?: number | null
          target_value?: number
          updated_at?: string | null
          year?: number
          ytd_value?: number
        }
        Relationships: []
      }
      supplier_data: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          spend_percentage: number
          spend_value: number
          supplier_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          spend_percentage: number
          spend_value: number
          supplier_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          spend_percentage?: number
          spend_value?: number
          supplier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      survey_analysis_reports: {
        Row: {
          analysis_text: string
          created_at: string
          generated_at: string
          id: string
          pdf_url: string | null
          total_responses: number
        }
        Insert: {
          analysis_text: string
          created_at?: string
          generated_at?: string
          id?: string
          pdf_url?: string | null
          total_responses: number
        }
        Update: {
          analysis_text?: string
          created_at?: string
          generated_at?: string
          id?: string
          pdf_url?: string | null
          total_responses?: number
        }
        Relationships: []
      }
      survey_answer_options: {
        Row: {
          answer_set_id: string | null
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          labels: Json
          metadata: Json | null
          option_key: string
        }
        Insert: {
          answer_set_id?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          labels: Json
          metadata?: Json | null
          option_key: string
        }
        Update: {
          answer_set_id?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          labels?: Json
          metadata?: Json | null
          option_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_answer_options_answer_set_id_fkey"
            columns: ["answer_set_id"]
            isOneToOne: false
            referencedRelation: "survey_answer_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_answer_sets: {
        Row: {
          created_at: string | null
          description: Json | null
          id: string
          is_active: boolean | null
          name: Json
          set_key: string
          set_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: Json | null
          id?: string
          is_active?: boolean | null
          name: Json
          set_key: string
          set_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: Json | null
          id?: string
          is_active?: boolean | null
          name?: Json
          set_key?: string
          set_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      survey_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          enabled_demographics: Json | null
          enabled_multiselect_questions: Json | null
          enabled_rating_questions: Json | null
          id: string
          is_active: boolean | null
          languages_enabled: string[] | null
          name: string
          require_low_score_feedback: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled_demographics?: Json | null
          enabled_multiselect_questions?: Json | null
          enabled_rating_questions?: Json | null
          id?: string
          is_active?: boolean | null
          languages_enabled?: string[] | null
          name: string
          require_low_score_feedback?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled_demographics?: Json | null
          enabled_multiselect_questions?: Json | null
          enabled_rating_questions?: Json | null
          id?: string
          is_active?: boolean | null
          languages_enabled?: string[] | null
          name?: string
          require_low_score_feedback?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      survey_consent_log: {
        Row: {
          consent_given: boolean
          consent_timestamp: string
          consent_version: string
          created_at: string
          id: string
          ip_hash: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          consent_given: boolean
          consent_timestamp?: string
          consent_version?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_timestamp?: string
          consent_version?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      survey_question_config: {
        Row: {
          allow_na: boolean | null
          answer_set_id: string | null
          configuration_id: string | null
          created_at: string | null
          custom_label: Json | null
          description: Json | null
          display_order: number | null
          follow_up_rules: Json | null
          id: string
          is_enabled: boolean | null
          is_required: boolean | null
          labels: Json | null
          options: Json | null
          question_id: string
          question_type: string
          section: string | null
        }
        Insert: {
          allow_na?: boolean | null
          answer_set_id?: string | null
          configuration_id?: string | null
          created_at?: string | null
          custom_label?: Json | null
          description?: Json | null
          display_order?: number | null
          follow_up_rules?: Json | null
          id?: string
          is_enabled?: boolean | null
          is_required?: boolean | null
          labels?: Json | null
          options?: Json | null
          question_id: string
          question_type: string
          section?: string | null
        }
        Update: {
          allow_na?: boolean | null
          answer_set_id?: string | null
          configuration_id?: string | null
          created_at?: string | null
          custom_label?: Json | null
          description?: Json | null
          display_order?: number | null
          follow_up_rules?: Json | null
          id?: string
          is_enabled?: boolean | null
          is_required?: boolean | null
          labels?: Json | null
          options?: Json | null
          question_id?: string
          question_type?: string
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_question_config_answer_set_id_fkey"
            columns: ["answer_set_id"]
            isOneToOne: false
            referencedRelation: "survey_answer_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_question_config_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "survey_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_question_responses: {
        Row: {
          answer_value: Json
          created_at: string
          display_order: number | null
          id: string
          question_id: string
          question_type: string
          response_id: string
        }
        Insert: {
          answer_value: Json
          created_at?: string
          display_order?: number | null
          id?: string
          question_id: string
          question_type: string
          response_id: string
        }
        Update: {
          answer_value?: Json
          created_at?: string
          display_order?: number | null
          id?: string
          question_id?: string
          question_type?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_question_responses_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "employee_survey_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      talent_review_cycles: {
        Row: {
          created_at: string
          end_date: string
          id: string
          org_id: string
          start_date: string
          status: Database["public"]["Enums"]["rvw_cycle_status"]
          template_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          org_id: string
          start_date: string
          status?: Database["public"]["Enums"]["rvw_cycle_status"]
          template_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          org_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["rvw_cycle_status"]
          template_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_review_cycles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "talent_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rvw_review_cycles_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "talent_review_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_review_responses: {
        Row: {
          author_role: Database["public"]["Enums"]["rvw_author_role"]
          created_at: string
          id: string
          question_id: string
          review_id: string
          updated_at: string
          value_boolean: boolean | null
          value_goal_progress: number | null
          value_rating: number | null
          value_text: string | null
        }
        Insert: {
          author_role: Database["public"]["Enums"]["rvw_author_role"]
          created_at?: string
          id?: string
          question_id: string
          review_id: string
          updated_at?: string
          value_boolean?: boolean | null
          value_goal_progress?: number | null
          value_rating?: number | null
          value_text?: string | null
        }
        Update: {
          author_role?: Database["public"]["Enums"]["rvw_author_role"]
          created_at?: string
          id?: string
          question_id?: string
          review_id?: string
          updated_at?: string
          value_boolean?: boolean | null
          value_goal_progress?: number | null
          value_rating?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rvw_review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "talent_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_review_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          questions_json: Json
          template_type: Database["public"]["Enums"]["rvw_template_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          questions_json?: Json
          template_type: Database["public"]["Enums"]["rvw_template_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          questions_json?: Json
          template_type?: Database["public"]["Enums"]["rvw_template_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_review_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "talent_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_reviews: {
        Row: {
          created_at: string
          cycle_id: string
          employee_id: string
          employee_submitted_at: string | null
          id: string
          manager_submitted_at: string | null
          reviewer_id: string
          signed_at: string | null
          status: Database["public"]["Enums"]["rvw_review_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          employee_id: string
          employee_submitted_at?: string | null
          id?: string
          manager_submitted_at?: string | null
          reviewer_id: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["rvw_review_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          employee_id?: string
          employee_submitted_at?: string | null
          id?: string
          manager_submitted_at?: string | null
          reviewer_id?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["rvw_review_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_reviews_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "talent_review_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_user_roles: {
        Row: {
          created_at: string
          id: string
          job_title: string | null
          manager_id: string | null
          org_id: string
          role: Database["public"]["Enums"]["rvw_user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_title?: string | null
          manager_id?: string | null
          org_id: string
          role: Database["public"]["Enums"]["rvw_user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_title?: string | null
          manager_id?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["rvw_user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rvw_user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "talent_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          attachment: string | null
          comments: string | null
          created_at: string | null
          entity_id: string | null
          equipment: string
          expected_max: string | null
          expected_min: string | null
          id: string
          inspector_name: string
          is_passed: boolean | null
          location: string | null
          photo_urls: string[] | null
          serial_number: string
          test_average: string
          test_type: string
          test_values: string[]
          updated_at: string | null
        }
        Insert: {
          attachment?: string | null
          comments?: string | null
          created_at?: string | null
          entity_id?: string | null
          equipment: string
          expected_max?: string | null
          expected_min?: string | null
          id?: string
          inspector_name: string
          is_passed?: boolean | null
          location?: string | null
          photo_urls?: string[] | null
          serial_number: string
          test_average: string
          test_type: string
          test_values: string[]
          updated_at?: string | null
        }
        Update: {
          attachment?: string | null
          comments?: string | null
          created_at?: string | null
          entity_id?: string | null
          equipment?: string
          expected_max?: string | null
          expected_min?: string | null
          id?: string
          inspector_name?: string
          is_passed?: boolean | null
          location?: string | null
          photo_urls?: string[] | null
          serial_number?: string
          test_average?: string
          test_type?: string
          test_values?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      training_data: {
        Row: {
          content: Json
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          embedding: string | null
          exact_match_fields: string[] | null
          id: string
          scope: Database["public"]["Enums"]["training_data_scope"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          embedding?: string | null
          exact_match_fields?: string[] | null
          id?: string
          scope?: Database["public"]["Enums"]["training_data_scope"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          embedding?: string | null
          exact_match_fields?: string[] | null
          id?: string
          scope?: Database["public"]["Enums"]["training_data_scope"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transcriptions: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          recording_id: string | null
          text: string
          user_id: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          recording_id?: string | null
          text: string
          user_id?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          recording_id?: string | null
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcriptions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "meeting_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_conversations_embeddings: {
        Row: {
          conversation_id: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          parent_conversation_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          parent_conversation_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          parent_conversation_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_conversations_embeddings_parent_conversation_id_fkey"
            columns: ["parent_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_app_items: {
        Row: {
          app_item_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          app_item_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          app_item_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_app_items_app_item_id_fkey"
            columns: ["app_item_id"]
            isOneToOne: false
            referencedRelation: "app_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          content: string
          created_at: string
          feedback_type: string
          id: string
          is_anonymous: boolean
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          feedback_type?: string
          id?: string
          is_anonymous?: boolean
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          feedback_type?: string
          id?: string
          is_anonymous?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          default_location: string
          enabled_functions: string[] | null
          id: string
          theme: string | null
          updated_at: string | null
          user_guide_progress: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_location?: string
          enabled_functions?: string[] | null
          id?: string
          theme?: string | null
          updated_at?: string | null
          user_guide_progress?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_location?: string
          enabled_functions?: string[] | null
          id?: string
          theme?: string | null
          updated_at?: string | null
          user_guide_progress?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_training_submissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: Json
          document_type: string
          embedding: string | null
          id: string
          scope: Database["public"]["Enums"]["training_data_scope"] | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: Json
          document_type: string
          embedding?: string | null
          id?: string
          scope?: Database["public"]["Enums"]["training_data_scope"] | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          document_type?: string
          embedding?: string | null
          id?: string
          scope?: Database["public"]["Enums"]["training_data_scope"] | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_unread_messages: {
        Row: {
          recipient_id: string | null
          unread_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_role: {
        Args: { role_to_assign: string; target_user_id: string }
        Returns: boolean
      }
      backfill_training_data_embeddings: { Args: never; Returns: number }
      calculate_rolling_points: { Args: { emp_id: string }; Returns: number }
      can_access_notes_board: {
        Args: { p_board_id: string; p_employee_id: string }
        Returns: boolean
      }
      can_post_to_notes_board: {
        Args: { p_board_id: string; p_employee_id: string }
        Returns: boolean
      }
      can_see_note: {
        Args: { p_employee_id: string; p_note_id: string }
        Returns: boolean
      }
      check_embedding_status: {
        Args: never
        Returns: {
          entries_missing_embeddings: number
          entries_with_embeddings: number
          total_entries: number
        }[]
      }
      clean_old_weather_entries: { Args: never; Returns: undefined }
      cleanup_expired_admin_sessions: { Args: never; Returns: undefined }
      cleanup_expired_notes: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_expired_survey_data: { Args: never; Returns: number }
      create_license: {
        Args: {
          company_name_param: string
          contact_email_param: string
          contact_name_param?: string
        }
        Returns: {
          license_code: string
          license_id: string
        }[]
      }
      expire_old_points: { Args: never; Returns: undefined }
      generate_license_code: { Args: never; Returns: string }
      get_available_employees: {
        Args: never
        Returns: {
          displayname: string
          employee_id: string
          userprincipalname: string
        }[]
      }
      get_employee_by_user_id: {
        Args: { user_id_param: string }
        Returns: {
          city: string
          country: string
          department: string
          displayname: string
          employee_id: string
          jobtitle: string
          officelocation: string
          state: string
          user_id: string
          userprincipalname: string
        }[]
      }
      get_employee_job_level: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["job_level"]
      }
      get_or_create_conversation_id: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_user_rvw_org_id: { Args: { _user_id: string }; Returns: string }
      has_review_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_rvw_role: {
        Args: {
          _role: Database["public"]["Enums"]["rvw_user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_user_role: {
        Args: { role_param: string; user_id_param: string }
        Returns: boolean
      }
      is_admin_level: { Args: { _user_id: string }; Returns: boolean }
      is_demo_user: { Args: { user_email: string }; Returns: boolean }
      is_manager_level: { Args: { _user_id: string }; Returns: boolean }
      is_notes_board_admin: {
        Args: { _board_id: string; _employee_id: string }
        Returns: boolean
      }
      is_rvw_manager_of: {
        Args: { _employee_id: string; _manager_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_type: string
          new_values?: Json
          old_values?: Json
          record_id?: string
          table_name: string
        }
        Returns: undefined
      }
      log_application_usage:
        | { Args: { action: string; app_id: string }; Returns: undefined }
        | {
            Args: { action: string; app_id: string; session_id?: string }
            Returns: string
          }
      match_documents: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: Json
          id: string
          similarity: number
        }[]
      }
      match_documents_with_scope: {
        Args: {
          include_user_scope: boolean
          match_count: number
          match_threshold: number
          query_embedding: string
          user_id: string
        }
        Returns: {
          content: Json
          document_type: string
          id: string
          scope: string
          similarity: number
          user_id: string
        }[]
      }
      process_employee_census: {
        Args: never
        Returns: {
          matched_count: number
          processed_count: number
          unmatched_count: number
          updated_managers: number
        }[]
      }
      rvw_calculate_competency_score: {
        Args: { p_review_id: string }
        Returns: number
      }
      rvw_calculate_performance_score: {
        Args: { p_review_id: string }
        Returns: number
      }
      rvw_get_employee_id: { Args: { _user_id: string }; Returns: string }
      rvw_get_matrix_position: {
        Args: { p_comp_score: number; p_perf_score: number }
        Returns: string
      }
      rvw_get_matrix_zone: {
        Args: { p_comp_score: number; p_perf_score: number }
        Returns: string
      }
      rvw_is_manager_of_review: {
        Args: { _review_id: string; _user_id: string }
        Returns: boolean
      }
      rvw_owns_review: {
        Args: { _review_id: string; _user_id: string }
        Returns: boolean
      }
      search_product_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_text: string
        }
        Returns: {
          chunk_title: string
          content_md: string
          id: string
          product_line: string
          similarity: number
          source_doc: string
        }[]
      }
      update_employee_data: {
        Args: {
          city_param: string
          country_param: string
          department_param: string
          jobtitle_param: string
          officelocation_param: string
          state_param: string
          user_id_param: string
        }
        Returns: undefined
      }
      upsert_emp_record:
        | {
            Args: {
              p_department?: string
              p_display_name: string
              p_job_level?: string
              p_location: string
              p_manager_id?: string
              p_user_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_badge_number?: string
              p_department?: string
              p_display_name: string
              p_job_level?: string
              p_location: string
              p_manager_id?: string
              p_user_id: string
            }
            Returns: string
          }
      validate_iframe_session: {
        Args: { token_hash_param: string }
        Returns: {
          is_valid: boolean
          user_data: Json
          user_id: string
        }[]
      }
    }
    Enums: {
      app_type: "application" | "calculator" | "sales_tool" | "report"
      document_type: "contact" | "company" | "sales" | "purchase_order"
      employee_location:
        | "Newton"
        | "DuBois"
        | "Redditch"
        | "Berkhamsted"
        | "Home-Office"
      function_type:
        | "magnetism_calculator"
        | "five_why"
        | "equipment_selection"
        | "sales_map"
        | "stock_calculator"
        | "qr_generator"
        | "prospect_finder"
        | "bath_rail_designer"
        | "md_flow_calculator"
        | "five_s"
        | "fmea"
      job_level: "Executive" | "Manager" | "Supervisor" | "Lead" | "Employee"
      rvw_author_role: "manager" | "employee"
      rvw_cycle_status: "draft" | "active" | "closed"
      rvw_review_status: "draft" | "pending_approval" | "published" | "signed"
      rvw_template_type: "hourly" | "salaried"
      rvw_user_role: "admin" | "manager" | "employee"
      scroll_pattern_type: "continuous" | "fade" | "slide"
      training_data_scope: "user" | "global"
      vote_type: "up" | "down"
    }
    CompositeTypes: {
      metadata_type: {
        title: string | null
        description: string | null
        source: string | null
        timestamp: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_type: ["application", "calculator", "sales_tool", "report"],
      document_type: ["contact", "company", "sales", "purchase_order"],
      employee_location: [
        "Newton",
        "DuBois",
        "Redditch",
        "Berkhamsted",
        "Home-Office",
      ],
      function_type: [
        "magnetism_calculator",
        "five_why",
        "equipment_selection",
        "sales_map",
        "stock_calculator",
        "qr_generator",
        "prospect_finder",
        "bath_rail_designer",
        "md_flow_calculator",
        "five_s",
        "fmea",
      ],
      job_level: ["Executive", "Manager", "Supervisor", "Lead", "Employee"],
      rvw_author_role: ["manager", "employee"],
      rvw_cycle_status: ["draft", "active", "closed"],
      rvw_review_status: ["draft", "pending_approval", "published", "signed"],
      rvw_template_type: ["hourly", "salaried"],
      rvw_user_role: ["admin", "manager", "employee"],
      scroll_pattern_type: ["continuous", "fade", "slide"],
      training_data_scope: ["user", "global"],
      vote_type: ["up", "down"],
    },
  },
} as const
