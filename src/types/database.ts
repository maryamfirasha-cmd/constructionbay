export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          whatsapp: string | null
          avatar_url: string | null
          is_supplier: boolean
          bio: string | null
          location: string | null
          website: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          whatsapp?: string | null
          avatar_url?: string | null
          is_supplier?: boolean
          bio?: string | null
          location?: string | null
          website?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          whatsapp?: string | null
          avatar_url?: string | null
          is_supplier?: boolean
          bio?: string | null
          location?: string | null
          website?: string | null
          verified?: boolean
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          price: number | null
          price_unit: string | null
          currency: string
          category: string
          listing_type: string
          location: string | null
          images: string[] | null
          status: string
          condition: string | null
          quantity: number | null
          unit: string | null
          views: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          price?: number | null
          price_unit?: string | null
          currency?: string
          category: string
          listing_type: string
          location?: string | null
          images?: string[] | null
          status?: string
          condition?: string | null
          quantity?: number | null
          unit?: string | null
          views?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          price?: number | null
          price_unit?: string | null
          currency?: string
          category?: string
          listing_type?: string
          location?: string | null
          images?: string[] | null
          status?: string
          condition?: string | null
          quantity?: number | null
          unit?: string | null
          views?: number
          featured?: boolean
          updated_at?: string
        }
      }
      wanted_requests: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          budget: number | null
          currency: string
          location: string | null
          urgency: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          budget?: number | null
          currency?: string
          location?: string | null
          urgency?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string | null
          budget?: number | null
          currency?: string
          location?: string | null
          urgency?: string | null
          status?: string
          updated_at?: string
        }
      }
    }
  }
}
