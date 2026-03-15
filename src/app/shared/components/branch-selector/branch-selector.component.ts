import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LucideAngularModule } from 'lucide-angular';
import { BranchState } from '../../../core/state/branch.state';

@Component({
  selector: 'app-branch-selector',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-tertiary/50 hover:bg-surface-tertiary transition-colors">
      <lucide-icon name="map-pin" [size]="16" class="text-accent-primary"></lucide-icon>
      <select
        class="bg-transparent text-sm font-medium text-text-primary outline-none cursor-pointer appearance-none pr-6"
        [value]="branchState.selectedBranchId() ?? 'all'"
        (change)="onBranchChange($event)">
        <option value="all">All Restaurants</option>
        <option *ngFor="let branch of branchState.branches()" [value]="branch.branchId">
          {{ branch.name }}
        </option>
      </select>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class BranchSelectorComponent {
  branchState = inject(BranchState);

  onBranchChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.branchState.selectBranch(value === 'all' ? null : value);
  }
}
