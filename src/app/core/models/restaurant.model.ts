export interface Restaurant {
  restaurantId: string;
  branchId: string;
  name: string;
  cuisineType: string;
  seatingCapacity: number;
}

export interface MenuItem {
  dishId: string;
  restaurantId: string;
  name: string;
  sellingPrice: number;
  category: string;
  preparationTimeMinutes: number;
}

export interface DailySale {
  date: string;
  dishId: string;
  unitsSold: number;
  totalRevenue: number;
}
