export interface BranchLocation {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Branch {
  branchId: string;
  name: string;
  ownerName: string;
  contactEmail: string;
  totalRooms: number;
  starRating: number;
  squareFootage: number;
  location: BranchLocation;
  heroImage?: string;
}
