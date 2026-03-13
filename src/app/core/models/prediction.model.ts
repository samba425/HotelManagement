export interface PredictionRecommendations {
  inventoryBuffer: string;
  staffingAction: string;
  utilityCostProjection: string;
}

export interface DemandForecastItem {
  dishId: string;
  predictedUnits: number;
}

export interface Prediction {
  branchId: string;
  eventName: string;
  eventDate: string;
  predictedOccupancy: number;
  predictedCovers: number;
  recommendations: PredictionRecommendations;
  demandForecast: DemandForecastItem[];
}
