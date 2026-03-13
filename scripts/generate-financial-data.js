/**
 * Generates financial-operations.json for Hotel Analytics POC
 * 30 days (Feb 11 - Mar 12, 2026) × 6 branches = 180 records
 */

const fs = require('fs');
const path = require('path');

const BRANCH_CONFIG = [
  { branchId: 'br-001', totalRooms: 280, adrMin: 450, adrMax: 550, weekdayOcc: [70, 82], weekendOcc: [88, 96] },
  { branchId: 'br-002', totalRooms: 240, adrMin: 380, adrMax: 480, weekdayOcc: [65, 78], weekendOcc: [85, 95] },
  { branchId: 'br-003', totalRooms: 200, adrMin: 420, adrMax: 520, weekdayOcc: [68, 80], weekendOcc: [86, 94] },
  { branchId: 'br-004', totalRooms: 260, adrMin: 280, adrMax: 380, weekdayOcc: [62, 76], weekendOcc: [82, 92] },
  { branchId: 'br-005', totalRooms: 180, adrMin: 350, adrMax: 450, weekdayOcc: [66, 78], weekendOcc: [84, 93] },
  { branchId: 'br-006', totalRooms: 320, adrMin: 300, adrMax: 500, weekdayOcc: [72, 85], weekendOcc: [90, 98] },
];

// Valentine's Day Feb 14 - slight boost
const HOLIDAY_BOOST = { '2026-02-14': 1.05, '2026-02-15': 1.03 };

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDateRange(start, end) {
  const dates = [];
  const d = new Date(start);
  const e = new Date(end);
  while (d <= e) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function isWeekend(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 5 || day === 6; // Fri, Sat
}

function generateRecords() {
  const records = [];
  const dates = getDateRange('2026-02-11', '2026-03-12');

  dates.forEach((date, dateIdx) => {
    const weekend = isWeekend(date);
    const holidayBoost = HOLIDAY_BOOST[date] || 1;

    BRANCH_CONFIG.forEach((branch, branchIdx) => {
      const seed = dateIdx * 1000 + branchIdx;
      const [occMin, occMax] = weekend ? branch.weekendOcc : branch.weekdayOcc;
      const occBase = occMin + seededRandom(seed) * (occMax - occMin);
      const occPct = Math.min(98, Math.max(55, occBase * holidayBoost)) / 100;

      const adrBase = branch.adrMin + seededRandom(seed + 1) * (branch.adrMax - branch.adrMin);
      const adr = Math.round(adrBase * (0.97 + seededRandom(seed + 2) * 0.06));

      const roomsOccupied = Math.round(branch.totalRooms * occPct);
      const dailyRevenue = roomsOccupied * adr;
      const costRatio = 0.55 + seededRandom(seed + 3) * 0.10;
      const operationalCosts = Math.round(dailyRevenue * costRatio);
      const grossOperatingProfit = dailyRevenue - operationalCosts;
      const revPAR = Math.round(dailyRevenue / branch.totalRooms);

      records.push({
        branchId: branch.branchId,
        date,
        roomsOccupied,
        dailyRevenue,
        operationalCosts,
        grossOperatingProfit,
        averageDailyRate: adr,
        revPAR,
      });
    });
  });

  return records;
}

const records = generateRecords();
const outputPath = path.join(__dirname, '../src/assets/mock-data/financial-operations.json');
fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Generated ${records.length} records to ${outputPath}`);
