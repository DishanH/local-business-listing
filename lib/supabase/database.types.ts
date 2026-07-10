// Hand-authored to match supabase/migrations/*.sql.
// Once the project is linked to a live Supabase project, prefer regenerating
// this file with the Supabase CLI so it never drifts from the real schema:
//
//   npx supabase gen types typescript --project-id <project-ref> --schema public > lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'customer' | 'business_owner' | 'admin'
export type BusinessStatus = 'draft' | 'pending_review' | 'published' | 'suspended' | 'archived'
export type BusinessOwnerRole = 'owner' | 'manager' | 'staff'
export type PostType = 'offer' | 'event' | 'update'
export type MessageSenderType = 'customer' | 'business' | 'system'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          parent_id: string | null
          slug: string
          name: string
          icon: string | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          slug: string
          name: string
          icon?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: []
      }
      filters: {
        Row: {
          id: string
          category_id: string | null
          slug: string
          label: string
          group_name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          slug: string
          label: string
          group_name?: string
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['filters']['Insert']>
        Relationships: []
      }
      cities: {
        Row: {
          id: string
          slug: string
          name: string
          region: string | null
          country: string
          lat: number
          lng: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          region?: string | null
          country?: string
          lat: number
          lng: number
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['cities']['Insert']>
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          slug: string
          name: string
          tagline: string | null
          description: string | null
          category_id: string
          subcategory_id: string | null
          status: BusinessStatus
          price_level: number | null
          email: string | null
          phone: string | null
          website: string | null
          address_line1: string | null
          address_line2: string | null
          city_id: string | null
          postal_code: string | null
          lat: number | null
          lng: number | null
          cover_image_url: string | null
          is_featured: boolean
          avg_rating: number
          review_count: number
          keywords: string[]
          created_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          tagline?: string | null
          description?: string | null
          category_id: string
          subcategory_id?: string | null
          status?: BusinessStatus
          price_level?: number | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city_id?: string | null
          postal_code?: string | null
          lat?: number | null
          lng?: number | null
          cover_image_url?: string | null
          is_featured?: boolean
          avg_rating?: number
          review_count?: number
          keywords?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
        Relationships: []
      }
      business_owners: {
        Row: {
          business_id: string
          profile_id: string
          role: BusinessOwnerRole
          created_at: string
        }
        Insert: {
          business_id: string
          profile_id: string
          role?: BusinessOwnerRole
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['business_owners']['Insert']>
        Relationships: []
      }
      business_filters: {
        Row: { business_id: string; filter_id: string }
        Insert: { business_id: string; filter_id: string }
        Update: Partial<Database['public']['Tables']['business_filters']['Insert']>
        Relationships: []
      }
      business_images: {
        Row: {
          id: string
          business_id: string
          url: string
          alt_text: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['business_images']['Insert']>
        Relationships: []
      }
      business_hours: {
        Row: {
          id: string
          business_id: string
          day_of_week: number
          open_minute: number | null
          close_minute: number | null
        }
        Insert: {
          id?: string
          business_id: string
          day_of_week: number
          open_minute?: number | null
          close_minute?: number | null
        }
        Update: Partial<Database['public']['Tables']['business_hours']['Insert']>
        Relationships: []
      }
      business_offering_sections: {
        Row: {
          id: string
          business_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['business_offering_sections']['Insert']>
        Relationships: []
      }
      business_offerings: {
        Row: {
          id: string
          business_id: string
          section_id: string | null
          name: string
          description: string | null
          price_cents: number | null
          price_label: string | null
          tag: string | null
          image_url: string | null
          is_available: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          section_id?: string | null
          name: string
          description?: string | null
          price_cents?: number | null
          price_label?: string | null
          tag?: string | null
          image_url?: string | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['business_offerings']['Insert']>
        Relationships: []
      }
      business_specials: {
        Row: {
          id: string
          business_id: string
          day_of_week: number | null
          name: string
          description: string | null
          price_cents: number | null
          price_label: string | null
          starts_on: string | null
          ends_on: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          day_of_week?: number | null
          name: string
          description?: string | null
          price_cents?: number | null
          price_label?: string | null
          starts_on?: string | null
          ends_on?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['business_specials']['Insert']>
        Relationships: []
      }
      business_posts: {
        Row: {
          id: string
          business_id: string
          author_id: string | null
          type: PostType
          title: string
          body: string
          badge: string | null
          published_at: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          author_id?: string | null
          type: PostType
          title: string
          body: string
          badge?: string | null
          published_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['business_posts']['Insert']>
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          business_id: string
          author_id: string
          rating: number
          body: string | null
          owner_reply: string | null
          owner_reply_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          author_id: string
          rating: number
          body?: string | null
          owner_reply?: string | null
          owner_reply_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
        Relationships: []
      }
      favorites: {
        Row: { profile_id: string; business_id: string; created_at: string }
        Insert: { profile_id: string; business_id: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>
        Relationships: []
      }
      notes: {
        Row: { profile_id: string; business_id: string; body: string; updated_at: string }
        Insert: { profile_id: string; business_id: string; body?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          business_id: string
          customer_id: string
          last_message_at: string | null
          customer_unread_count: number
          business_unread_count: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id: string
          last_message_at?: string | null
          customer_unread_count?: number
          business_unread_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string | null
          sender_type: MessageSenderType
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id?: string | null
          sender_type: MessageSenderType
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          target_table: string | null
          target_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          target_table?: string | null
          target_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_audit_log']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      owns_business: { Args: { target_business_id: string }; Returns: boolean }
      ensure_profile: { Args: Record<string, never>; Returns: undefined }
      become_business_owner: { Args: Record<string, never>; Returns: undefined }
    }
    Enums: {
      user_role: UserRole
      business_status: BusinessStatus
      business_owner_role: BusinessOwnerRole
      post_type: PostType
      message_sender_type: MessageSenderType
    }
  }
}
