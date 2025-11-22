
export enum Page {
  Home,
  Dashboard,
}

export interface Profile {
  fullName: string;
  sectionYear: string;
  contactNumber: string;
}

export interface LostItemReport {
  id: string;
  profile: Profile;
  itemName: string;
  dateLost: string;
  lastKnownLocation: string;
  description: string;
  image: string; // base64 encoded image or URL
}

export interface FoundItemReport {
  id: string;
  itemName: string;
  image: string; // base64 encoded image or URL
  description: string;
  locationFound: string;
  dateFound: string;
  finderName?: string;
  finderContact?: string;
}

export interface MatchResult {
  id: string;
  confidence: number;
  reasoning: string;
}
