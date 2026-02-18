import { Establishment, WheelSegment, Participant } from "@/types";

const STORAGE_KEYS = {
  ESTABLISHMENTS: "prizmo_establishments",
  SEGMENTS: "prizmo_segments",
  PARTICIPANTS: "prizmo_participants",
};

// Generate URL-friendly slug from establishment name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const storageService = {
  // Establishments
  getEstablishments(): Establishment[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.ESTABLISHMENTS);
    return data ? JSON.parse(data) : [];
  },

  getEstablishmentById(id: string): Establishment | null {
    const establishments = this.getEstablishments();
    return establishments.find((e) => e.id === id) || null;
  },

  saveEstablishment(establishment: Establishment): void {
    const establishments = this.getEstablishments();
    const index = establishments.findIndex((e) => e.id === establishment.id);
    
    // Generate slug if not provided
    if (!establishment.slug) {
      establishment.slug = generateSlug(establishment.name);
    }
    
    if (index >= 0) {
      establishments[index] = establishment;
    } else {
      establishments.push(establishment);
    }
    localStorage.setItem(STORAGE_KEYS.ESTABLISHMENTS, JSON.stringify(establishments));
  },

  getEstablishmentBySlug(slug: string): Establishment | null {
    const establishments = this.getEstablishments();
    return establishments.find((e) => e.slug === slug) || null;
  },

  // Wheel Segments
  getSegments(establishmentId: string): WheelSegment[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.SEGMENTS);
    const allSegments: WheelSegment[] = data ? JSON.parse(data) : [];
    return allSegments.filter((s) => s.establishmentId === establishmentId);
  },

  saveSegments(establishmentId: string, segments: WheelSegment[]): void {
    const data = localStorage.getItem(STORAGE_KEYS.SEGMENTS);
    const allSegments: WheelSegment[] = data ? JSON.parse(data) : [];
    const filtered = allSegments.filter((s) => s.establishmentId !== establishmentId);
    const updated = [...filtered, ...segments];
    localStorage.setItem(STORAGE_KEYS.SEGMENTS, JSON.stringify(updated));
  },

  // Participants
  getParticipants(establishmentId: string): Participant[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    const allParticipants: Participant[] = data ? JSON.parse(data) : [];
    return allParticipants.filter((p) => p.establishmentId === establishmentId);
  },

  getParticipantByEmail(establishmentId: string, email: string): Participant | null {
    const participants = this.getParticipants(establishmentId);
    return participants.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  },

  saveParticipant(participant: Participant): void {
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    const participants: Participant[] = data ? JSON.parse(data) : [];
    const index = participants.findIndex((p) => p.id === participant.id);
    if (index >= 0) {
      participants[index] = participant;
    } else {
      participants.push(participant);
    }
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  },

  initializeDemoData(): void {
    const establishments = this.getEstablishments();
    if (establishments.length === 0) {
      const demoEstablishment: Establishment = {
        id: "demo-restaurant",
        name: "Restaurant Demo",
        slug: "demo-restaurant",
        address: "123 Rue de la Gastronomie, Paris",
        googleMapsUrl: "https://www.google.com/maps",
        instagramUrl: "https://www.instagram.com",
        primaryColor: "#8b5cf6",
        secondaryColor: "#d946ef",
        enableInstagramWheel: true,
        createdAt: new Date().toISOString(),
      };
      this.saveEstablishment(demoEstablishment);

      const demoSegments: WheelSegment[] = [
        { id: "1", establishmentId: "demo-restaurant", title: "Boisson maison offerte", color: "#8b5cf6", type: "prize", probability: 25, order: 1 },
        { id: "2", establishmentId: "demo-restaurant", title: "Merci !", color: "#ec4899", type: "no-prize", probability: 20, order: 2 },
        { id: "3", establishmentId: "demo-restaurant", title: "Dessert offert", color: "#f59e0b", type: "prize", probability: 20, order: 3 },
        { id: "4", establishmentId: "demo-restaurant", title: "Merci !", color: "#10b981", type: "no-prize", probability: 15, order: 4 },
        { id: "5", establishmentId: "demo-restaurant", title: "Café offert", color: "#3b82f6", type: "prize", probability: 15, order: 5 },
        { id: "6", establishmentId: "demo-restaurant", title: "Merci !", color: "#ef4444", type: "no-prize", probability: 5, order: 6 },
      ];
      this.saveSegments("demo-restaurant", demoSegments);
    }
    },

    deleteEstablishment(id: string): void {
        // Supprimer l'établissement
        const establishments = this.getEstablishments();
        const filtered = establishments.filter((e) => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.ESTABLISHMENTS, JSON.stringify(filtered));

        // Supprimer les segments associés
        const segData = localStorage.getItem(STORAGE_KEYS.SEGMENTS);
        const allSegments: WheelSegment[] = segData ? JSON.parse(segData) : [];
        localStorage.setItem(STORAGE_KEYS.SEGMENTS, JSON.stringify(allSegments.filter((s) => s.establishmentId !== id)));

        // Supprimer les participants associés
        const partData = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
        const allParticipants: Participant[] = partData ? JSON.parse(partData) : [];
        localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(allParticipants.filter((p) => p.establishmentId !== id)));
    },
  
};