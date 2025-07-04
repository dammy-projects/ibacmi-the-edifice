export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics: {
        Row: {
          flipbook_id: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          flipbook_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          flipbook_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_flipbook_id_fkey"
            columns: ["flipbook_id"]
            isOneToOne: false
            referencedRelation: "flipbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          flipbook_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          flipbook_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          flipbook_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_flipbook_id_fkey"
            columns: ["flipbook_id"]
            isOneToOne: false
            referencedRelation: "flipbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      flipbook_categories: {
        Row: {
          category_id: string
          flipbook_id: string
        }
        Insert: {
          category_id: string
          flipbook_id: string
        }
        Update: {
          category_id?: string
          flipbook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flipbook_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flipbook_categories_flipbook_id_fkey"
            columns: ["flipbook_id"]
            isOneToOne: false
            referencedRelation: "flipbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      flipbook_files: {
        Row: {
          conversion_status: string | null
          converted_pages: number | null
          file_name: string
          file_path: string
          file_size: number | null
          flipbook_id: string | null
          id: string
          mime_type: string | null
          total_pages: number | null
          uploaded_at: string | null
        }
        Insert: {
          conversion_status?: string | null
          converted_pages?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          flipbook_id?: string | null
          id?: string
          mime_type?: string | null
          total_pages?: number | null
          uploaded_at?: string | null
        }
        Update: {
          conversion_status?: string | null
          converted_pages?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          flipbook_id?: string | null
          id?: string
          mime_type?: string | null
          total_pages?: number | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flipbook_files_flipbook_id_fkey"
            columns: ["flipbook_id"]
            isOneToOne: false
            referencedRelation: "flipbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      flipbook_tags: {
        Row: {
          flipbook_id: string
          tag_id: string
        }
        Insert: {
          flipbook_id: string
          tag_id: string
        }
        Update: {
          flipbook_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flipbook_tags_flipbook_id_fkey"
            columns: ["flipbook_id"]
            isOneToOne: false
            referencedRelation: "flipbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flipbook_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      flipbooks: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          publication_date: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          publication_date?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          publication_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          flipbook_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          flipbook_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          flipbook_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_flipbook_id_fkey"
            columns: ["flipbook_id"]
            isOneToOne: false
            referencedRelation: "flipbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string | null
          flipbook_id: string | null
          id: string
          image_url: string
          page_number: number
          text_content: string | null
        }
        Insert: {
          created_at?: string | null
          flipbook_id?: string | null
          id?: string
          image_url: string
          page_number: number
          text_content?: string | null
        }
        Update: {
          created_at?: string | null
          flipbook_id?: string | null
          id?: string
          image_url?: string
          page_number?: number
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_flipbook_id_fkey"
            columns: ["flipbook_id"]
            isOneToOne: false
            referencedRelation: "flipbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          profile_image: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          account_type?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          profile_image?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          account_type?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          profile_image?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
