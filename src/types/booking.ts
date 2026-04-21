export type BookingStatus = "OPEN" | "BOOKED" | "EXPIRED" | "CANCELLED";
export type TripType = "ONE_WAY" | "ROUND_TRIP" | "LOCAL_RENTAL" | "AIRPORT_TRANSFER";
export type FuelType = "PETROL" | "DIESEL" | "CNG";

export interface Booking {
  id: string;
  status: BookingStatus;
  pickupCity: string;
  dropCity: string;
  date: string;
  time: string;
  vehicleType: string;        // free text — no longer an enum
  vehicleName: string | null;
  tripType: TripType | null;
  fuelType: FuelType | null;
  hasCarrier: boolean;
  postedAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  bookedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
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
  pickupCityId?: string;
  dropCityId?: string;
  vehicleType?: string;
  dateFrom?: string;
  dateTo?: string;
  partnerId?: string;
}
