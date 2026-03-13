import { Injectable } from '@angular/core';
import { FinancialOperation, KpiData } from '../models/financial.model';

@Injectable({ providedIn: 'root' })
export class KpiEngineService {
  calculateOccupancyRate(roomsOccupied: number, totalRooms: number): number {
    return totalRooms > 0 ? (roomsOccupied / totalRooms) * 100 : 0;
  }

  calculateADR(totalRevenue: number, roomsOccupied: number): number {
    return roomsOccupied > 0 ? totalRevenue / roomsOccupied : 0;
  }

  calculateRevPAR(totalRevenue: number, totalAvailableRooms: number): number {
    return totalAvailableRooms > 0 ? totalRevenue / totalAvailableRooms : 0;
  }

  calculateGOPPAR(revenue: number, operationalCosts: number, totalAvailableRooms: number): number {
    return totalAvailableRooms > 0 ? (revenue - operationalCosts) / totalAvailableRooms : 0;
  }

  calculateFoodCostPercent(ingredientCost: number, foodRevenue: number): number {
    return foodRevenue > 0 ? (ingredientCost / foodRevenue) * 100 : 0;
  }

  calculateLaborCostPercent(laborCost: number, totalRevenue: number): number {
    return totalRevenue > 0 ? (laborCost / totalRevenue) * 100 : 0;
  }

  buildKpiFromFinancials(
    current: FinancialOperation[],
    previous: FinancialOperation[],
    totalRooms: number
  ): KpiData[] {
    const sumCurrent = this.aggregateFinancials(current);
    const sumPrevious = this.aggregateFinancials(previous);

    const currentRevenue = sumCurrent.dailyRevenue;
    const prevRevenue = sumPrevious.dailyRevenue;
    const revenueTrend = this.getTrend(currentRevenue, prevRevenue);

    const currentOcc = this.calculateOccupancyRate(sumCurrent.roomsOccupied, totalRooms * current.length);
    const prevOcc = this.calculateOccupancyRate(sumPrevious.roomsOccupied, totalRooms * previous.length);

    const currentRevPAR = this.calculateRevPAR(sumCurrent.dailyRevenue, totalRooms * current.length);
    const prevRevPAR = this.calculateRevPAR(sumPrevious.dailyRevenue, totalRooms * previous.length);

    const currentGOPPAR = this.calculateGOPPAR(sumCurrent.dailyRevenue, sumCurrent.operationalCosts, totalRooms * current.length);
    const prevGOPPAR = this.calculateGOPPAR(sumPrevious.dailyRevenue, sumPrevious.operationalCosts, totalRooms * previous.length);

    return [
      {
        label: 'Total Revenue',
        value: currentRevenue,
        previousValue: prevRevenue,
        format: 'currency',
        trend: revenueTrend.direction,
        trendPercentage: revenueTrend.percentage,
        icon: 'dollar-sign',
        accent: 'blue',
        sparklineData: current.map(f => f.dailyRevenue),
      },
      {
        label: 'Occupancy Rate',
        value: currentOcc,
        previousValue: prevOcc,
        format: 'percentage',
        trend: this.getTrend(currentOcc, prevOcc).direction,
        trendPercentage: this.getTrend(currentOcc, prevOcc).percentage,
        icon: 'bed-double',
        accent: 'cyan',
        sparklineData: current.map(f => this.calculateOccupancyRate(f.roomsOccupied, totalRooms)),
      },
      {
        label: 'RevPAR',
        value: currentRevPAR,
        previousValue: prevRevPAR,
        format: 'currency',
        trend: this.getTrend(currentRevPAR, prevRevPAR).direction,
        trendPercentage: this.getTrend(currentRevPAR, prevRevPAR).percentage,
        icon: 'bar-chart-3',
        accent: 'violet',
        sparklineData: current.map(f => this.calculateRevPAR(f.dailyRevenue, totalRooms)),
      },
      {
        label: 'GOPPAR',
        value: currentGOPPAR,
        previousValue: prevGOPPAR,
        format: 'currency',
        trend: this.getTrend(currentGOPPAR, prevGOPPAR).direction,
        trendPercentage: this.getTrend(currentGOPPAR, prevGOPPAR).percentage,
        icon: 'piggy-bank',
        accent: 'emerald',
        sparklineData: current.map(f => this.calculateGOPPAR(f.dailyRevenue, f.operationalCosts, totalRooms)),
      },
    ];
  }

  private aggregateFinancials(records: FinancialOperation[]): FinancialOperation {
    return records.reduce(
      (acc, r) => ({
        branchId: r.branchId,
        date: r.date,
        roomsOccupied: acc.roomsOccupied + r.roomsOccupied,
        dailyRevenue: acc.dailyRevenue + r.dailyRevenue,
        operationalCosts: acc.operationalCosts + r.operationalCosts,
        grossOperatingProfit: acc.grossOperatingProfit + r.grossOperatingProfit,
        averageDailyRate: acc.averageDailyRate + r.averageDailyRate,
        revPAR: acc.revPAR + r.revPAR,
      }),
      { branchId: '', date: '', roomsOccupied: 0, dailyRevenue: 0, operationalCosts: 0, grossOperatingProfit: 0, averageDailyRate: 0, revPAR: 0 }
    );
  }

  private getTrend(current: number, previous: number): { direction: 'up' | 'down' | 'flat'; percentage: number } {
    if (previous === 0) return { direction: 'flat', percentage: 0 };
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return {
      direction: pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'flat',
      percentage: Math.abs(Math.round(pct * 10) / 10),
    };
  }
}
