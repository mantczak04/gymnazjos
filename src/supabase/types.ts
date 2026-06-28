export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          name: string;
          logging_type: "weighted_reps" | "reps_only";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logging_type: "weighted_reps" | "reps_only";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logging_type?: "weighted_reps" | "reps_only";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_templates: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_template_exercises: {
        Row: {
          id: string;
          template_id: string;
          exercise_id: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          exercise_id: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          exercise_id?: string;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_template_exercises_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "workout_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_template_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          }
        ];
      };
      workout_sessions: {
        Row: {
          id: string;
          template_id: string;
          started_at: string;
          finished_at: string;
          post_workout_feeling: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          started_at: string;
          finished_at: string;
          post_workout_feeling: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          started_at?: string;
          finished_at?: string;
          post_workout_feeling?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "workout_templates";
            referencedColumns: ["id"];
          }
        ];
      };
      workout_session_exercises: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          order_index: number;
          source: "template" | "ad_hoc";
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id: string;
          order_index: number;
          source: "template" | "ad_hoc";
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          exercise_id?: string;
          order_index?: number;
          source?: "template" | "ad_hoc";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_session_exercises_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_session_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          }
        ];
      };
      workout_sets: {
        Row: {
          id: string;
          session_exercise_id: string;
          set_index: number;
          reps: number;
          weight: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_exercise_id: string;
          set_index: number;
          reps: number;
          weight?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_exercise_id?: string;
          set_index?: number;
          reps?: number;
          weight?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_session_exercise_id_fkey";
            columns: ["session_exercise_id"];
            isOneToOne: false;
            referencedRelation: "workout_session_exercises";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          nutrition_basis: "per_100g" | "per_100ml" | "per_unit";
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          unit_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nutrition_basis: "per_100g" | "per_100ml" | "per_unit";
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          unit_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nutrition_basis?: "per_100g" | "per_100ml" | "per_unit";
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          unit_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meal_templates: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meal_template_ingredients: {
        Row: {
          id: string;
          meal_template_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_template_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_template_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_template_ingredients_meal_template_id_fkey";
            columns: ["meal_template_id"];
            isOneToOne: false;
            referencedRelation: "meal_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_template_ingredients_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_food_entries: {
        Row: {
          id: string;
          entry_date: string;
          entry_type: "meal" | "product";
          name_snapshot: string;
        };
        Insert: {
          id?: string;
          entry_date: string;
          entry_type: "meal" | "product";
          name_snapshot: string;
        };
        Update: {
          id?: string;
          entry_date?: string;
          entry_type?: "meal" | "product";
          name_snapshot?: string;
        };
        Relationships: [];
      };
      daily_food_entry_ingredients: {
        Row: {
          id: string;
          daily_food_entry_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          nutrition_basis_snapshot: "per_100g" | "per_100ml" | "per_unit";
          calories_snapshot: number;
          protein_snapshot: number;
          carbs_snapshot: number;
          fat_snapshot: number;
          unit_name_snapshot: string | null;
          quantity: number;
        };
        Insert: {
          id?: string;
          daily_food_entry_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          nutrition_basis_snapshot: "per_100g" | "per_100ml" | "per_unit";
          calories_snapshot: number;
          protein_snapshot: number;
          carbs_snapshot: number;
          fat_snapshot: number;
          unit_name_snapshot?: string | null;
          quantity: number;
        };
        Update: {
          id?: string;
          daily_food_entry_id?: string;
          product_id?: string | null;
          product_name_snapshot?: string;
          nutrition_basis_snapshot?: "per_100g" | "per_100ml" | "per_unit";
          calories_snapshot?: number;
          protein_snapshot?: number;
          carbs_snapshot?: number;
          fat_snapshot?: number;
          unit_name_snapshot?: string | null;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "daily_food_entry_ingredients_daily_food_entry_id_fkey";
            columns: ["daily_food_entry_id"];
            isOneToOne: false;
            referencedRelation: "daily_food_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_food_entry_ingredients_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_nutrition_targets: {
        Row: {
          id: number;
          calories_target: number;
          protein_target: number;
          carbs_target: number;
          fat_target: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          calories_target?: number;
          protein_target?: number;
          carbs_target?: number;
          fat_target?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          calories_target?: number;
          protein_target?: number;
          carbs_target?: number;
          fat_target?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      exercise_logging_type: "weighted_reps" | "reps_only";
      workout_session_exercise_source: "template" | "ad_hoc";
      nutrition_basis: "per_100g" | "per_100ml" | "per_unit";
      daily_food_entry_type: "meal" | "product";
    };
    CompositeTypes: Record<string, never>;
  };
};
