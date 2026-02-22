export interface Establishment {
  id: string;
  name: string;
  slug: string;
  address: string;
  googleMapsUrl: string;
  instagramUrl?: string;
  logo?: string;
  logo_url?: string;
  logo_secondary_url?: string;
  primaryColor: string;
  secondaryColor: string;
  enableInstagramWheel: boolean;
  createdAt: string;
  ownerId?: string;
}

export interface WheelSegment {
  id: string;
  establishmentId: string;
  title: string;
  color: string;
  type: "prize" | "no-prize";
  probability: number;
  order: number;
}

export interface Participant {
  id: string;
  establishmentId: string;
  email: string;
  phone: string;
  hasSpunWheel1: boolean;
  hasSpunWheel2: boolean;
  prize1?: string;
  prize2?: string;
  createdAt: string;
}

export interface GameSession {
  establishmentId: string;
  participantId: string;
  currentStep: "email" | "review" | "wheel1" | "result1" | "instagram" | "wheel2" | "result2";
  prize1?: string;
  prize2?: string;
}