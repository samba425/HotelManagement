import { Component, Input, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatSortModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-wrapper">
      <!-- Header -->
      <div class="table-top">
        <div class="table-title-area">
          <h3 class="table-title">{{ title }}</h3>
          <span *ngIf="filteredData().length" class="table-count">{{ filteredData().length }} items</span>
        </div>
        <div class="table-actions">
          <div class="table-search">
            <lucide-icon name="search" [size]="14" class="search-icon"></lucide-icon>
            <input type="text" placeholder="Search..." [ngModel]="searchQuery()"
                   (ngModelChange)="searchQuery.set($event)" class="search-input">
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table mat-table [dataSource]="filteredData()" matSort class="w-full modern-table">
          <ng-container *ngFor="let col of columns; let ci = index" [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="table-header-cell">
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row; let ri = index" class="table-body-cell"
                [class.font-semibold]="ci === 0">
              <span *ngIf="!isStatusCol(col.key)">{{ row[col.key] }}</span>
              <span *ngIf="isStatusCol(col.key)" class="status-badge" [attr.data-status]="getStatusType(row[col.key])">
                <span class="status-dot"></span>
                {{ row[col.key] }}
              </span>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columnKeys"></tr>
          <tr mat-row *matRowDef="let row; columns: columnKeys; let ri = index"
              class="table-row"
              [style.animation-delay.ms]="ri * 30"></tr>
        </table>
      </div>

      <!-- Empty -->
      <div *ngIf="!filteredData().length" class="table-empty">
        <lucide-icon name="search" [size]="28" class="text-text-muted"></lucide-icon>
        <p class="text-[13px] text-text-muted mt-2">No results found</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .table-wrapper {
      background: var(--glass-bg);
      backdrop-filter: blur(20px) saturate(1.2);
      -webkit-backdrop-filter: blur(20px) saturate(1.2);
      border: 1px solid var(--glass-border);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: var(--glass-shadow);
    }

    .table-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-default);
      gap: 12px;
      flex-wrap: wrap;
    }

    .table-title-area {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .table-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .table-count {
      font-size: 11px;
      color: var(--text-muted);
      background: var(--surface-tertiary);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .table-actions { display: flex; gap: 8px; }

    .table-search {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      padding: 6px 10px 6px 30px;
      font-size: 12px;
      background: var(--surface-tertiary);
      border: 1px solid var(--border-default);
      border-radius: 10px;
      color: var(--text-primary);
      outline: none;
      width: 200px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(129,140,248,0.1);
    }

    .search-input::placeholder { color: var(--text-muted); }

    /* Table styling */
    ::ng-deep .modern-table { background: transparent !important; }
    ::ng-deep .modern-table .mat-mdc-header-row { background: transparent !important; }
    ::ng-deep .modern-table .mat-mdc-row { background: transparent !important; }

    .table-header-cell {
      background: var(--surface-tertiary) !important;
      color: var(--text-secondary) !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.06em !important;
      padding: 10px 16px !important;
      border-bottom: 1px solid var(--border-default) !important;
    }

    .table-body-cell {
      color: var(--text-primary) !important;
      font-size: 13px !important;
      padding: 12px 16px !important;
      border-bottom: 1px solid var(--border-subtle) !important;
    }

    .table-row {
      transition: background 0.15s ease !important;
      animation: table-row-in 0.3s ease both;
    }

    .table-row:hover { background: rgba(129,140,248,0.04) !important; }

    @keyframes table-row-in {
      from { opacity: 0; transform: translateX(-4px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Status badges */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-badge[data-status="good"] { background: rgba(16,185,129,0.1); color: #34d399; }
    .status-badge[data-status="good"] .status-dot { background: #10b981; }

    .status-badge[data-status="warn"] { background: rgba(245,158,11,0.1); color: #fbbf24; }
    .status-badge[data-status="warn"] .status-dot { background: #f59e0b; }

    .status-badge[data-status="bad"] { background: rgba(239,68,68,0.1); color: #f87171; }
    .status-badge[data-status="bad"] .status-dot { background: #ef4444; }

    .status-badge[data-status="neutral"] { background: rgba(100,116,139,0.1); color: #94a3b8; }
    .status-badge[data-status="neutral"] .status-dot { background: #64748b; }

    .table-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 20px;
    }
  `]
})
export class DataTableComponent {
  @Input() title = '';
  @Input() data: any[] = [];
  @Input() columns: { key: string; label: string }[] = [];
  @Input() statusColumns: string[] = ['status', 'priority', 'level', 'risk'];

  searchQuery = signal('');

  filteredData = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.data;
    return this.data.filter(row =>
      this.columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  });

  get columnKeys(): string[] {
    return this.columns.map(c => c.key);
  }

  isStatusCol(key: string): boolean {
    return this.statusColumns.some(s => key.toLowerCase().includes(s));
  }

  getStatusType(val: any): string {
    const v = String(val ?? '').toLowerCase();
    if (['high', 'critical', 'danger', 'bad', 'overdue'].some(k => v.includes(k))) return 'bad';
    if (['medium', 'warning', 'moderate', 'pending'].some(k => v.includes(k))) return 'warn';
    if (['low', 'good', 'ok', 'normal', 'on track', 'active', 'completed'].some(k => v.includes(k))) return 'good';
    return 'neutral';
  }
}
