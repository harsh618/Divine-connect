// TypeScript interfaces for RBAC schemas

// User roles
export type UserRole = 'CLIENT' | 'PRIEST' | 'HOTEL_ADMIN' | 'ASTROLOGER' | 'SUPER_ADMIN';

// Verification tiers for priests
export type VerificationTier = 'STANDARD' | 'GOLD' | 'ELITE';

// Room types for hotels
export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'DORMITORY';

// User entity interface
export interface User {
  id: string;
  created_date: string;
  updated_date: string;
  created_by: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user'; // Built-in Base44 role
  app_role: UserRole;
  phone?: string;
  avatar_url?: string;
  preferred_language?: string;
  is_active: boolean;
}

// Priest Profile interface
export interface PriestProfile {
  id: string;
  created_date: string;
  updated_date: string;
  created_by: string;
  user_id: string;
  display_name: string;
  bio?: string;
  verification_tier: VerificationTier;
  skills: string[];
  attached_temples: string[];
  is_verified: boolean;
  years_of_experience?: number;
  languages?: string[];
  city?: string;
  rating_average: number;
  total_bookings: number;
  consultation_rate?: number;
  is_available: boolean;
  is_deleted: boolean;
}

// Distance to temple info
export interface DistanceToTemple {
  temple_id: string;
  temple_name: string;
  distance_km: number;
  walking_time_mins?: number;
}

// Room inventory item
export interface RoomInventory {
  room_type: RoomType;
  total_rooms: number;
  available_rooms: number;
  price_per_night: number;
  max_occupancy: number;
}

// Hotel entity interface
export interface Hotel {
  id: string;
  created_date: string;
  updated_date: string;
  created_by: string;
  name: string;
  description?: string;
  address?: string;
  city: string;
  state?: string;
  pincode?: string;
  amenities: string[];
  distance_to_temple?: DistanceToTemple;
  room_inventory: RoomInventory[];
  images?: string[];
  thumbnail_url?: string;
  contact_phone?: string;
  contact_email?: string;
  rating_average: number;
  total_reviews: number;
  admin_user_id?: string;
  is_featured: boolean;
  is_active: boolean;
  is_deleted: boolean;
}

// Helper type for creating new records (without system fields)
export type CreatePriestProfile = Omit<PriestProfile, 'id' | 'created_date' | 'updated_date' | 'created_by'>;
export type CreateHotel = Omit<Hotel, 'id' | 'created_date' | 'updated_date' | 'created_by'>;