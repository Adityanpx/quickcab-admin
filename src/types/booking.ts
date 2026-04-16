export type BookingStatus = "OPEN" | "BOOKED" | "EXPIRED" | "CANCELLED";
export type VehicleType =
  | "SEDAN"
  | "SUV"
  | "HATCHBACK"
  | "TEMPO_TRAVELLER"
  | "BUS"
  | "LUXURY";

export interface Booking {
  id: string;
  status: BookingStatus;
  pickupCity: string;
  dropCity: string;
  date: string;
  time: string;
  vehicleType: VehicleType;
  originalFare: number | null;
  postedAmount: number;
  customerName: string | null;
  customerMobile: string | null;
  coinsAwarded: boolean;
  createdAt: string;
  updatedAt: string;
  postedBy: {
    id: string;
    name: string;
    mobile: string;
    partnerProfile: { subType: string } | null;
  };
  acceptedBy: {
    id: string;
    name: string;
    mobile: string;
    partnerProfile: { subType: string } | null;
  } | null;
}

export interface BookingListFilters {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  city?: string;
  vehicleType?: VehicleType;
  dateFrom?: string;
  dateTo?: string;
}
