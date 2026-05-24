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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          created_by: string | null
          doctor_id: string | null
          doctor_name: string | null
          duration_min: number
          id: string
          notes: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string
          reference_id: string
          scheduled_at: string
          service: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          booking_channel: string
          room_chair: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          duration_min?: number
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone: string
          reference_id: string
          scheduled_at: string
          service: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          booking_channel?: string
          room_chair?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          duration_min?: number
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string
          reference_id?: string
          scheduled_at?: string
          service?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          booking_channel?: string
          room_chair?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          active: boolean
          bio: string | null
          color_code: string
          created_at: string
          email: string | null
          experience: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          qualifications: string | null
          role: string | null
          specialty: string | null
          updated_at: string
          user_id: string | null
          consultation_fee: number | null
          specialties: string[] | null
        }
        Insert: {
          active?: boolean
          bio?: string | null
          color_code?: string
          created_at?: string
          email?: string | null
          experience?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          qualifications?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string | null
          consultation_fee?: number | null
          specialties?: string[] | null
        }
        Update: {
          active?: boolean
          bio?: string | null
          color_code?: string
          created_at?: string
          email?: string | null
          experience?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          qualifications?: string | null
          role?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string | null
          consultation_fee?: number | null
          specialties?: string[] | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          dob: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          medical_notes: string | null
          phone: string
          updated_at: string
          notes: string | null
          primary_doctor_id: string | null
          primary_service: string | null
          tags: string[] | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          dob?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          medical_notes?: string | null
          phone: string
          updated_at?: string
          notes?: string | null
          primary_doctor_id?: string | null
          primary_service?: string | null
          tags?: string[] | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          dob?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          medical_notes?: string | null
          phone?: string
          updated_at?: string
          notes?: string | null
          primary_doctor_id?: string | null
          primary_service?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_primary_doctor_id_fkey"
            columns: ["primary_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_articles: {
        Row: {
          active: boolean
          body: Json
          category: string
          created_at: string
          cta_service: string | null
          gallery: Json
          hero_image_key: string | null
          id: string
          lead: string | null
          meta_description: string | null
          meta_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: Json
          category: string
          created_at?: string
          cta_service?: string | null
          gallery?: Json
          hero_image_key?: string | null
          id?: string
          lead?: string | null
          meta_description?: string | null
          meta_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: Json
          category?: string
          created_at?: string
          cta_service?: string | null
          gallery?: Json
          hero_image_key?: string | null
          id?: string
          lead?: string | null
          meta_description?: string | null
          meta_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          category: string
          created_at: string
          doctor_name: string | null
          icon: string | null
          id: string
          image_key: string | null
          sort_order: number
          summary: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          doctor_name?: string | null
          icon?: string | null
          id?: string
          image_key?: string | null
          sort_order?: number
          summary?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          doctor_name?: string | null
          icon?: string | null
          id?: string
          image_key?: string | null
          sort_order?: number
          summary?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean
          city: string | null
          created_at: string
          id: string
          image_key: string | null
          name: string
          quote: string
          rating: number
          sort_order: number
          treatment: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          city?: string | null
          created_at?: string
          id?: string
          image_key?: string | null
          name: string
          quote: string
          rating?: number
          sort_order?: number
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string | null
          created_at?: string
          id?: string
          image_key?: string | null
          name?: string
          quote?: string
          rating?: number
          sort_order?: number
          treatment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      treatment_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          plan_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          plan_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          plan_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_documents_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          appointment_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["treatment_status"]
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["treatment_status"]
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["treatment_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      billing_invoices: {
        Row: {
          id: string
          patient_id: string | null
          appointment_id: string | null
          invoice_number: string
          total_amount: number
          discount_amount: number | null
          tax_rate: number | null
          tax_amount: number | null
          final_amount: number
          paid_amount: number | null
          due_amount: number | null
          status: string
          pdf_url: string | null
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          appointment_id?: string | null
          invoice_number: string
          total_amount?: number
          discount_amount?: number | null
          tax_rate?: number | null
          tax_amount?: number | null
          final_amount?: number
          paid_amount?: number | null
          status?: string
          pdf_url?: string | null
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          appointment_id?: string | null
          invoice_number?: string
          total_amount?: number
          discount_amount?: number | null
          tax_rate?: number | null
          tax_amount?: number | null
          final_amount?: number
          paid_amount?: number | null
          status?: string
          pdf_url?: string | null
          due_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          }
        ]
      }
      declined_payments: {
        Row: {
          id: string
          invoice_id: string
          patient_id: string | null
          patient_name: string
          invoice_number: string
          declined_amount: number
          reason: string | null
          declined_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          patient_id?: string | null
          patient_name: string
          invoice_number: string
          declined_amount: number
          reason?: string | null
          declined_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          patient_id?: string | null
          patient_name?: string
          invoice_number?: string
          declined_amount?: number
          reason?: string | null
          declined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "declined_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declined_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_transactions: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_method: string
          transaction_ref: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_method: string
          transaction_ref?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_method?: string
          transaction_ref?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_family_links: {
        Row: {
          patient_id: string
          relative_id: string
          relationship: string
          created_at: string
        }
        Insert: {
          patient_id: string
          relative_id: string
          relationship: string
          created_at?: string
        }
        Update: {
          patient_id?: string
          relative_id?: string
          relationship?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_family_links_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_family_links_relative_id_fkey"
            columns: ["relative_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      clinical_files: {
        Row: {
          id: string
          record_id: string | null
          patient_id: string
          file_url: string
          file_name: string | null
          file_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          record_id?: string | null
          patient_id: string
          file_url: string
          file_name?: string | null
          file_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          record_id?: string | null
          patient_id?: string
          file_url?: string
          file_name?: string | null
          file_type?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_files_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      clinical_records: {
        Row: {
          id: string
          patient_id: string
          appointment_id: string | null
          doctor_id: string | null
          diagnosis: string | null
          procedure_notes: string | null
          tooth_chart_data: Json
          clinical_notes: string | null
          voice_note_url: string | null
          follow_up_recommendations: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          appointment_id?: string | null
          doctor_id?: string | null
          diagnosis?: string | null
          procedure_notes?: string | null
          tooth_chart_data?: Json
          clinical_notes?: string | null
          voice_note_url?: string | null
          follow_up_recommendations?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          appointment_id?: string | null
          doctor_id?: string | null
          diagnosis?: string | null
          procedure_notes?: string | null
          tooth_chart_data?: Json
          clinical_notes?: string | null
          voice_note_url?: string | null
          follow_up_recommendations?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      prescriptions: {
        Row: {
          id: string
          record_id: string | null
          medicine_name: string
          dosage: string
          frequency: string
          duration: string
          instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          record_id?: string | null
          medicine_name: string
          dosage: string
          frequency: string
          duration: string
          instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          record_id?: string | null
          medicine_name?: string
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "clinical_records"
            referencedColumns: ["id"]
          }
        ]
      }
      doctor_shifts: {
        Row: {
          id: string
          doctor_id: string
          shift_date: string
          shift_start: string
          shift_end: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          shift_date: string
          shift_start: string
          shift_end: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          shift_date?: string
          shift_start?: string
          shift_end?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_shifts_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_blockings: {
        Row: {
          id: string
          doctor_id: string | null
          start_at: string
          end_at: string
          block_type: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id?: string | null
          start_at: string
          end_at: string
          block_type: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string | null
          start_at?: string
          end_at?: string
          block_type?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_blockings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      staff: {
        Row: {
          id: string
          user_id: string | null
          name: string
          role: string
          phone: string | null
          email: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          role: string
          phone?: string | null
          email?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          role?: string
          phone?: string | null
          email?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          id: string
          staff_id: string
          check_in: string
          check_out: string | null
          attendance_date: string
          created_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          check_in: string
          check_out?: string | null
          attendance_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          check_in?: string
          check_out?: string | null
          attendance_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory: {
        Row: {
          id: string
          name: string
          item_type: string
          stock_qty: number
          min_stock_alert: number
          vendor_name: string | null
          vendor_contact: string | null
          purchase_price: number | null
          purchase_date: string | null
          expiry_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          item_type: string
          stock_qty?: number
          min_stock_alert?: number
          vendor_name?: string | null
          vendor_contact?: string | null
          purchase_price?: number | null
          purchase_date?: string | null
          expiry_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          item_type?: string
          stock_qty?: number
          min_stock_alert?: number
          vendor_name?: string | null
          vendor_contact?: string | null
          purchase_price?: number | null
          purchase_date?: string | null
          expiry_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: string
          patient_id: string | null
          appointment_id: string | null
          channel: string
          template_type: string
          recipient: string
          sent_status: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          appointment_id?: string | null
          channel: string
          template_type: string
          recipient: string
          sent_status?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          appointment_id?: string | null
          channel?: string
          template_type?: string
          recipient?: string
          sent_status?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          }
        ]
      }
      clinic_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_booked_slots: {
        Args: { _from: string; _to: string }
        Returns: {
          doctor_name: string
          scheduled_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "doctor"
      appointment_status: "pending" | "approved" | "completed" | "cancelled" | "no_show"
      message_status: "new" | "read" | "archived"
      treatment_status: "planned" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
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
      app_role: ["admin", "staff", "doctor"],
      appointment_status: ["pending", "approved", "completed", "cancelled", "no_show"],
      message_status: ["new", "read", "archived"],
      treatment_status: ["planned", "in_progress", "completed", "cancelled"],
    },
  },
} as const
