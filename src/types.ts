export interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  joinDate?: string;
  theme?: "light" | "dark";
  language?: "id" | "en";
  focusTarget?: number; // target focus hours per day
}

export type ActivityCategory = 'Pekerjaan' | 'Belajar' | 'Kesehatan' | 'Rumah' | 'Lainnya';
export type ActivityPriority = 'Tinggi' | 'Sedang' | 'Rendah';

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ActivityCategory;
  priority: ActivityPriority;
  startTime: string; // HH:MM or YYYY-MM-DDTHH:MM
  endTime: string; // HH:MM or YYYY-MM-DDTHH:MM
  isCompleted: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ActivityStats {
  total: number;
  completed: number;
  pending: number;
  byCategory: Record<ActivityCategory, number>;
  byPriority: Record<ActivityPriority, number>;
}

