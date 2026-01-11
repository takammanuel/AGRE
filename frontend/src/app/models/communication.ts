// src/app/models/communication.ts

export interface Notification {
  id: number;
  titre: string;
  message: string;
  requete_id?: number;
  utilisateur_id: number;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  contenu: string;
  emetteur_id: number;
  recepteur_id: number;
  read_at: string | null;
  created_at: string;
  emetteur?: {
    id: number;
    nom: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
