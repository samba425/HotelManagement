import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glass-card overflow-hidden">
      <div class="p-4 border-b border-border-default" *ngIf="title">
        <h3 class="text-base font-semibold text-text-primary">{{ title }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table mat-table [dataSource]="data" matSort class="w-full">
          <ng-container *ngFor="let col of columns" [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header
                class="!bg-surface-tertiary !text-text-secondary !font-medium !text-xs !uppercase !tracking-wider">
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row" class="!text-text-primary !text-sm">
              {{ row[col.key] }}
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columnKeys"></tr>
          <tr mat-row *matRowDef="let row; columns: columnKeys"
              class="hover:!bg-surface-tertiary/50 transition-colors"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-table { background: transparent !important; }
    ::ng-deep .mat-mdc-row, ::ng-deep .mat-mdc-header-row { background: transparent !important; }
  `]
})
export class DataTableComponent {
  @Input() title = '';
  @Input() data: any[] = [];
  @Input() columns: { key: string; label: string }[] = [];

  get columnKeys(): string[] {
    return this.columns.map(c => c.key);
  }
}
