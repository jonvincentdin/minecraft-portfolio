// Hand-written from supabase/migrations/20261024000000_portfolio_content.sql, in the shape
// `supabase gen types typescript` produces. Regenerate it once the schema is applied to a project.
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
 public: {
  Tables: {
   portfolio_editors: {
    Row: { portfolio_id: string; user_id: string; role: 'owner' | 'editor'; created_at: string };
    Insert: never; Update: never; Relationships: [];
   };
   portfolio_drafts: {
    Row: { portfolio_id: string; schema_version: number; content: Json; revision: number; recovery: Json | null; updated_at: string; updated_by: string | null };
    Insert: never; Update: never; Relationships: [];
   };
   portfolio_publications: {
    Row: { portfolio_id: string; schema_version: number; content: Json; revision: number; published_at: string; published_by: string | null };
    Insert: never; Update: never; Relationships: [];
   };
   media_assets: {
    Row: { id: string; portfolio_id: string; file: string; owner_id: string | null; mime: string; size_bytes: number; width: number; height: number; alt: string; created_at: string; published_at: string | null };
    Insert: never; Update: never; Relationships: [];
   };
  };
  Views: { [_ in never]: never };
  Functions: {
   save_draft: { Args: { expected_revision: number; content: Json }; Returns: number };
   import_draft: { Args: { expected_revision: number; content: Json }; Returns: number };
   publish_draft: { Args: { expected_revision: number }; Returns: number };
   register_media: { Args: { mime: string; size_bytes: number; width: number; height: number; alt?: string }; Returns: string };
   remove_unused_media: { Args: { file: string }; Returns: undefined };
  };
  Enums: { [_ in never]: never };
  CompositeTypes: { [_ in never]: never };
 };
}
