import { Injectable, signal, computed } from '@angular/core';
import { Branch } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchState {
  readonly branches = signal<Branch[]>([]);
  readonly selectedBranchId = signal<string | null>(null);

  readonly selectedBranch = computed(() => {
    const id = this.selectedBranchId();
    return this.branches().find(b => b.branchId === id) ?? null;
  });

  readonly allBranchesLabel = computed(() =>
    this.selectedBranchId() === null ? 'All Restaurants' : this.selectedBranch()?.name ?? ''
  );

  setBranches(branches: Branch[]): void {
    this.branches.set(branches);
  }

  selectBranch(branchId: string | null): void {
    this.selectedBranchId.set(branchId);
  }
}
