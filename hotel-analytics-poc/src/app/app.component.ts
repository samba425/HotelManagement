import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BranchSelectorComponent } from './shared/components/branch-selector/branch-selector.component';
import { DateRangePickerComponent } from './shared/components/date-range-picker/date-range-picker.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { ChatbotPanelComponent } from './features/chatbot/chatbot-panel.component';
import { BranchState } from './core/state/branch.state';
import { BranchService } from './core/services/branch.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    BranchSelectorComponent,
    DateRangePickerComponent,
    ThemeToggleComponent,
    ChatbotPanelComponent,
  ],
  template: `
    <div class="gradient-mesh-bg"></div>

    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="fixed lg:relative z-40 h-full flex flex-col bg-surface-primary/80 backdrop-blur-xl border-r border-border-default transition-all duration-300 ease-out"
        [style.width.px]="sidebarCollapsed() ? 72 : 260"
        [class.translate-x-0]="!mobileMenuOpen() || sidebarCollapsed()"
        [class.-translate-x-full]="false">

        <!-- Logo area -->
        <div class="h-16 flex items-center px-4 border-b border-border-default">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold text-sm">H</span>
            </div>
            <div *ngIf="!sidebarCollapsed()" class="animate-fade-in">
              <div class="font-semibold text-sm text-text-primary leading-tight">Hotel Analytics</div>
              <div class="text-[10px] text-text-secondary">Enterprise Dashboard</div>
            </div>
          </div>
        </div>

        <!-- Nav items -->
        <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active-nav"
             class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/70 transition-all duration-200 group relative"
             [class.justify-center]="sidebarCollapsed()">
            <lucide-icon [name]="item.icon" [size]="20"
              class="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
            </lucide-icon>
            <span *ngIf="!sidebarCollapsed()"
              class="text-sm font-medium truncate animate-fade-in">
              {{ item.label }}
            </span>
            <div *ngIf="sidebarCollapsed()"
              class="absolute left-full ml-2 px-2 py-1 bg-surface-primary text-text-primary text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {{ item.label }}
            </div>
          </a>
        </nav>

        <!-- Collapse toggle -->
        <div class="p-3 border-t border-border-default">
          <button
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/70 transition-all"
            (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            <lucide-icon [name]="sidebarCollapsed() ? 'panel-left-open' : 'panel-left-close'" [size]="18"></lucide-icon>
            <span *ngIf="!sidebarCollapsed()" class="text-xs font-medium">Collapse</span>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top bar -->
        <header class="h-16 flex items-center justify-between px-6 bg-surface-primary/60 backdrop-blur-xl border-b border-border-default flex-shrink-0">
          <div class="flex items-center gap-4">
            <button class="lg:hidden" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
              <lucide-icon name="menu" [size]="20" class="text-text-secondary"></lucide-icon>
            </button>
            <app-branch-selector></app-branch-selector>
          </div>
          <div class="flex items-center gap-3">
            <app-date-range-picker class="hidden md:block"></app-date-range-picker>
            <div class="w-px h-6 bg-border-default hidden md:block"></div>
            <button class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-tertiary transition-colors relative">
              <lucide-icon name="bell" [size]="18" class="text-text-secondary"></lucide-icon>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-danger rounded-full"></span>
            </button>
            <app-theme-toggle></app-theme-toggle>
          </div>
        </header>

        <!-- Router outlet -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Chatbot FAB -->
      <button
        class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 flex items-center justify-center group"
        (click)="chatOpen.set(!chatOpen())">
        <lucide-icon [name]="chatOpen() ? 'x' : 'message-square-dot'" [size]="22"></lucide-icon>
        <span class="absolute inset-0 rounded-full bg-accent-primary/30 animate-pulse-ring pointer-events-none"
              *ngIf="!chatOpen()"></span>
      </button>

      <!-- Chatbot Panel -->
      <div *ngIf="chatOpen()"
           class="fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 bg-surface-primary/95 backdrop-blur-2xl border-l border-border-default shadow-2xl animate-slide-right flex flex-col">
        <div class="h-16 flex items-center justify-between px-6 border-b border-border-default bg-gradient-to-r from-accent-primary/10 to-purple-600/10">
          <div class="flex items-center gap-2">
            <lucide-icon name="brain-circuit" [size]="20" class="text-accent-primary"></lucide-icon>
            <span class="font-semibold text-text-primary">Hotel AI Assistant</span>
          </div>
          <button (click)="chatOpen.set(false)"
            class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-tertiary transition-colors">
            <lucide-icon name="x" [size]="18" class="text-text-secondary"></lucide-icon>
          </button>
        </div>
        <app-chatbot-panel class="flex-1 flex flex-col overflow-hidden"></app-chatbot-panel>
      </div>
    </div>
  `,
  styles: [`
    .active-nav {
      background: var(--surface-tertiary);
      color: var(--accent-primary) !important;
      font-weight: 600;
    }
    .active-nav lucide-icon { color: var(--accent-primary); }
  `],
})
export class AppComponent implements OnInit {
  private branchService = inject(BranchService);
  private branchState = inject(BranchState);

  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  chatOpen = signal(false);

  navItems: NavItem[] = [
    { icon: 'layout-dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'building-2', label: 'Branch Analytics', route: '/branches/br-001' },
    { icon: 'trending-up', label: 'Sales Insights', route: '/sales' },
    { icon: 'package-search', label: 'Supply Chain', route: '/supply-chain' },
    { icon: 'users', label: 'Labor', route: '/labor' },
    { icon: 'zap', label: 'Utilities', route: '/branches/br-001' },
    { icon: 'brain-circuit', label: 'Predictions', route: '/predictions' },
  ];

  ngOnInit(): void {
    this.branchService.getBranches().subscribe(branches => {
      this.branchState.setBranches(branches);
    });
  }
}
