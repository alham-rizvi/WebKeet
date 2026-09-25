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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          blurb: string
          cover_image: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          blurb?: string
          cover_image?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          blurb?: string
          cover_image?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      completions: {
        Row: {
          completed_at: string
          id: string
          lab_id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lab_id: string
          points_awarded: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lab_id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completions_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          body: string
          created_at: string
          id: string
          lab_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          lab_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          lab_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_authors: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          organization: string | null
          profile_url: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          organization?: string | null
          profile_url: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          organization?: string | null
          profile_url?: string
        }
        Relationships: []
      }
      lab_instances: {
        Row: {
          access_url: string | null
          created_at: string
          error_message: string | null
          expires_at: string
          external_id: string | null
          id: string
          lab_id: string
          started_at: string
          status: Database["public"]["Enums"]["instance_status"]
          stopped_at: string | null
          user_id: string
        }
        Insert: {
          access_url?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string
          external_id?: string | null
          id?: string
          lab_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["instance_status"]
          stopped_at?: string | null
          user_id: string
        }
        Update: {
          access_url?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string
          external_id?: string | null
          id?: string
          lab_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["instance_status"]
          stopped_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_instances_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          author_id: string
          category: string
          cover_image: string | null
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["lab_difficulty"]
          docker_image: string
          engine: string
          estimated_minutes: number
          hints: string[]
          id: string
          lesson_path: string
          objectives: string[]
          points: number
          prerequisites: string[]
          published: boolean
          scenario: string
          slug: string
          solution: string
          tags: string[]
          title: string
          tools: string[]
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          cover_image?: string | null
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["lab_difficulty"]
          docker_image?: string
          engine?: string
          estimated_minutes?: number
          hints?: string[]
          id?: string
          lesson_path: string
          objectives?: string[]
          points: number
          prerequisites?: string[]
          published?: boolean
          scenario?: string
          slug: string
          solution?: string
          tags?: string[]
          title: string
          tools?: string[]
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          cover_image?: string | null
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["lab_difficulty"]
          docker_image?: string
          engine?: string
          estimated_minutes?: number
          hints?: string[]
          id?: string
          lesson_path?: string
          objectives?: string[]
          points?: number
          prerequisites?: string[]
          published?: boolean
          scenario?: string
          slug?: string
          solution?: string
          tags?: string[]
          title?: string
          tools?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "labs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "lab_authors"
            referencedColumns: ["id"]
          },
        ]
      }
      learn_paths: {
        Row: {
          cover_image: string | null
          description: string
          id: string
          level: string
          slug: string
          sort_order: number
          summary: string
          title: string
        }
        Insert: {
          cover_image?: string | null
          description?: string
          id?: string
          level?: string
          slug: string
          sort_order?: number
          summary?: string
          title: string
        }
        Update: {
          cover_image?: string | null
          description?: string
          id?: string
          level?: string
          slug?: string
          sort_order?: number
          summary?: string
          title?: string
        }
        Relationships: []
      }
      path_labs: {
        Row: {
          lab_slug: string
          path_id: string
          position: number
        }
        Insert: {
          lab_slug: string
          path_id: string
          position?: number
        }
        Update: {
          lab_slug?: string
          path_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "path_labs_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learn_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          acceptable_use_accepted_at: string | null
          avatar_url: string | null
          bio: string | null
          completed_count: number
          created_at: string
          display_name: string
          id: string
          points: number
          terms_accepted_at: string | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          acceptable_use_accepted_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          completed_count?: number
          created_at?: string
          display_name?: string
          id: string
          points?: number
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          acceptable_use_accepted_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          completed_count?: number
          created_at?: string
          display_name?: string
          id?: string
          points?: number
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      instance_status:
        | "provisioning"
        | "running"
        | "stopped"
        | "expired"
        | "failed"
      lab_difficulty: "Beginner" | "Intermediate" | "Advanced"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
      instance_status: [
        "provisioning",
        "running",
        "stopped",
        "expired",
        "failed",
      ],
      lab_difficulty: ["Beginner", "Intermediate", "Advanced"],
    },
  },
} as const
