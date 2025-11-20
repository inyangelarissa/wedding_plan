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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booking_requests: {
        Row: {
          created_at: string
          event_id: string
          guest_count: number | null
          id: string
          message: string | null
          request_date: string
          requester_id: string
          status: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_count?: number | null
          id?: string
          message?: string | null
          request_date: string
          requester_id: string
          status?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_count?: number | null
          id?: string
          message?: string | null
          request_date?: string
          requester_id?: string
          status?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          budget: number | null
          couple_id: string
          created_at: string
          description: string | null
          event_date: string
          guest_count: number | null
          id: string
          planner_id: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at: string
          venue_location: string | null
        }
        Insert: {
          budget?: number | null
          couple_id: string
          created_at?: string
          description?: string | null
          event_date: string
          guest_count?: number | null
          id?: string
          planner_id?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at?: string
          venue_location?: string | null
        }
        Update: {
          budget?: number | null
          couple_id?: string
          created_at?: string
          description?: string | null
          event_date?: string
          guest_count?: number | null
          id?: string
          planner_id?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          updated_at?: string
          venue_location?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_inquiries: {
        Row: {
          created_at: string
          event_id: string
          id: string
          inquirer_id: string
          message: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          inquirer_id: string
          message?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          inquirer_id?: string
          message?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_inquiries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_inquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          approval_status: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          created_at: string
          description: string | null
          id: string
          location: string | null
          portfolio_images: string[] | null
          price_range: string | null
          rating: number | null
          rejection_reason: string | null
          review_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          portfolio_images?: string[] | null
          price_range?: string | null
          rating?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string | null
          business_name?: string
          category?: Database["public"]["Enums"]["vendor_category"]
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          portfolio_images?: string[] | null
          price_range?: string | null
          rating?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venue_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean
          notes: string | null
          updated_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_availability_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          amenities: string[] | null
          approval_status: string | null
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string
          manager_id: string
          name: string
          price_per_day: number | null
          rating: number | null
          rejection_reason: string | null
          review_count: number | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          approval_status?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location: string
          manager_id: string
          name: string
          price_per_day?: number | null
          rating?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          approval_status?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string
          manager_id?: string
          name?: string
          price_per_day?: number | null
          rating?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      event_status:
        | "planning"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "couple" | "planner" | "vendor" | "venue_manager" | "admin"
      vendor_category:
        | "catering"
        | "decoration"
        | "photography"
        | "videography"
        | "entertainment"
        | "cultural_performers"
        | "florist"
        | "makeup_artist"
        | "transportation"
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
      event_status: [
        "planning",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["couple", "planner", "vendor", "venue_manager", "admin"],
      vendor_category: [
        "catering",
        "decoration",
        "photography",
        "videography",
        "entertainment",
        "cultural_performers",
        "florist",
        "makeup_artist",
        "transportation",
      ],
    },
  },
} as const
