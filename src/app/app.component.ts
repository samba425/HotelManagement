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
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <lucide-icon name="sparkles" [size]="18"></lucide-icon>
          </div>
          <div *ngIf="!sidebarCollapsed()" class="brand-text">
            <div class="brand-name">Restaurant Analytics</div>
            <div class="brand-sub">Enterprise Platform</div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <div *ngIf="!sidebarCollapsed()" class="nav-section-label">Main Menu</div>
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="nav-active"
             class="nav-link"
             [class.nav-collapsed]="sidebarCollapsed()">
            <div class="nav-icon-wrap">
              <lucide-icon [name]="item.icon" [size]="19"></lucide-icon>
            </div>
            <span *ngIf="!sidebarCollapsed()" class="nav-label">{{ item.label }}</span>
            <div *ngIf="sidebarCollapsed()" class="nav-tooltip">{{ item.label }}</div>
          </a>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
          <button class="collapse-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            <lucide-icon [name]="sidebarCollapsed() ? 'panel-left-open' : 'panel-left-close'" [size]="17"></lucide-icon>
            <span *ngIf="!sidebarCollapsed()">Collapse</span>
          </button>
        </div>
      </aside>

      <!-- Main area -->
      <div class="main-area">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <button class="lg:hidden topbar-icon-btn" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
              <lucide-icon name="menu" [size]="19"></lucide-icon>
            </button>
            <app-branch-selector></app-branch-selector>
          </div>
          <div class="topbar-right">
            <app-date-range-picker class="hidden md:block"></app-date-range-picker>
            <div class="topbar-divider hidden md:block"></div>
            <div class="relative">
              <button class="topbar-icon-btn" (click)="notifOpen.set(!notifOpen())">
                <lucide-icon name="bell" [size]="17"></lucide-icon>
                <span class="notification-dot"></span>
              </button>
              <div *ngIf="notifOpen()" class="notif-panel">
                <div class="notif-header">
                  <span class="text-[13px] font-semibold text-text-primary">Notifications</span>
                  <span class="text-[10px] text-accent-primary cursor-pointer font-medium">Mark all read</span>
                </div>
                <div class="notif-list">
                  <div *ngFor="let n of notifications" class="notif-item" [class.notif-unread]="n.unread">
                    <div class="notif-icon" [attr.data-type]="n.type">
                      <lucide-icon [name]="n.icon" [size]="14"></lucide-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-[12px] text-text-primary leading-snug">{{ n.text }}</div>
                      <div class="text-[10px] text-text-muted mt-1">{{ n.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <app-theme-toggle></app-theme-toggle>
            <div class="avatar">
              <lucide-icon name="user" [size]="16"></lucide-icon>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Chat FAB -->
      <button class="chat-fab" [class.active]="chatOpen()" (click)="chatOpen.set(!chatOpen())">
        <lucide-icon [name]="chatOpen() ? 'x' : 'sparkles'" [size]="20"></lucide-icon>
        <span class="fab-ring" *ngIf="!chatOpen()"></span>
      </button>

      <!-- Chat panel -->
      <div *ngIf="chatOpen()" class="chat-panel">
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="chat-ai-badge">
              <lucide-icon name="brain-circuit" [size]="16"></lucide-icon>
              AI
            </div>
            <span class="chat-title">Restaurant Assistant</span>
          </div>
          <button class="topbar-icon-btn" (click)="chatOpen.set(false)">
            <lucide-icon name="x" [size]="17"></lucide-icon>
          </button>
        </div>
        <app-chatbot-panel class="flex-1 flex flex-col overflow-hidden"></app-chatbot-panel>
      </div>
    </div>
  `,
  styles: [`
    /* ── Sidebar ── */
    .sidebar {
      position: fixed;
      z-index: 40;
      height: 100vh;
      width: 260px;
      display: flex;
      flex-direction: column;
      background: var(--surface-primary);
      border-right: 1px solid var(--border-default);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }
    .sidebar.collapsed { width: 72px; }

    .sidebar-brand {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      border-bottom: 1px solid var(--border-default);
      flex-shrink: 0;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent-primary), #a78bfa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }
    .brand-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 500;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-section-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      padding: 0 12px 8px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
    }
    .nav-link:hover {
      background: var(--surface-tertiary);
      color: var(--text-primary);
    }
    .nav-link.nav-collapsed {
      justify-content: center;
      padding: 10px;
    }

    .nav-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .nav-link:hover .nav-icon-wrap {
      background: rgba(129, 140, 248, 0.08);
      color: var(--accent-primary);
    }

    .nav-active {
      background: rgba(129, 140, 248, 0.08) !important;
      color: var(--accent-primary) !important;
    }
    .nav-active .nav-icon-wrap {
      background: rgba(129, 140, 248, 0.12);
      color: var(--accent-primary);
    }

    .nav-label { white-space: nowrap; }

    .nav-tooltip {
      position: absolute;
      left: calc(100% + 10px);
      padding: 6px 12px;
      background: var(--surface-elevated);
      border: 1px solid var(--border-default);
      color: var(--text-primary);
      font-size: 12px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
      white-space: nowrap;
      z-index: 50;
    }
    .nav-link:hover .nav-tooltip { opacity: 1; }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--border-default);
      flex-shrink: 0;
    }
    .collapse-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      border-radius: var(--radius-md);
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .collapse-btn:hover {
      background: var(--surface-tertiary);
      color: var(--text-secondary);
    }

    /* ── Main area ── */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-left: 260px;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.collapsed ~ .main-area { margin-left: 72px; }

    /* ── Top bar ── */
    .topbar {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: var(--surface-primary);
      border-bottom: 1px solid var(--border-default);
      flex-shrink: 0;
      gap: 16px;
    }
    .topbar-left, .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .topbar-divider {
      width: 1px;
      height: 24px;
      background: var(--border-default);
    }
    .topbar-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .topbar-icon-btn:hover {
      background: var(--surface-tertiary);
      color: var(--text-primary);
      border-color: var(--accent-primary);
    }
    .notification-dot {
      position: absolute;
      top: 7px;
      right: 7px;
      width: 7px;
      height: 7px;
      background: var(--accent-danger);
      border-radius: 50%;
      border: 2px solid var(--surface-primary);
    }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-primary), #a78bfa);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      cursor: pointer;
      transition: box-shadow 0.2s ease;
    }
    .avatar:hover {
      box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25);
    }

    /* ── Page content ── */
    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
    }

    /* ── Chat FAB ── */
    .chat-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 50;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      border: none;
      background: linear-gradient(135deg, var(--accent-primary), #a78bfa);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
      transition: all 0.3s ease;
    }
    .chat-fab:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
    }
    .chat-fab.active {
      border-radius: 12px;
      background: var(--surface-tertiary);
      color: var(--text-secondary);
      box-shadow: var(--glass-shadow);
    }
    .fab-ring {
      position: absolute;
      inset: -4px;
      border-radius: 20px;
      border: 2px solid var(--accent-primary);
      opacity: 0;
      animation: fab-pulse 2.5s ease-in-out infinite;
    }
    @keyframes fab-pulse {
      0%, 100% { opacity: 0; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.08); }
    }

    /* ── Chat panel ── */
    .chat-panel {
      position: fixed;
      right: 0;
      top: 0;
      height: 100vh;
      width: 100%;
      max-width: 440px;
      z-index: 50;
      background: var(--surface-primary);
      border-left: 1px solid var(--border-default);
      box-shadow: -16px 0 48px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    :is(.dark) .chat-panel {
      box-shadow: -16px 0 48px rgba(0, 0, 0, 0.4);
    }
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .chat-header {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      border-bottom: 1px solid var(--border-default);
      flex-shrink: 0;
    }
    .chat-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chat-ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(129, 140, 248, 0.1);
      color: var(--accent-primary);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    .chat-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* ── Notification Panel ── */
    .notif-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 340px;
      max-height: 420px;
      background: var(--glass-bg);
      backdrop-filter: blur(24px) saturate(1.2);
      -webkit-backdrop-filter: blur(24px) saturate(1.2);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      z-index: 100;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: notif-in 0.25s cubic-bezier(0.16,1,0.3,1) both;
    }

    @keyframes notif-in {
      from { opacity: 0; transform: translateY(-6px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-default);
    }

    .notif-list {
      overflow-y: auto;
      flex: 1;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 18px;
      transition: background 0.15s;
      cursor: pointer;
      border-bottom: 1px solid var(--border-subtle);
    }

    .notif-item:hover { background: rgba(129,140,248,0.04); }

    .notif-unread { background: rgba(129,140,248,0.03); }

    .notif-icon {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notif-icon[data-type="success"] { background: rgba(16,185,129,0.1); color: #34d399; }
    .notif-icon[data-type="warning"] { background: rgba(245,158,11,0.1); color: #fbbf24; }
    .notif-icon[data-type="info"]    { background: rgba(59,130,246,0.1); color: #60a5fa; }

    @media (max-width: 1024px) {
      .sidebar { display: none; }
      .main-area { margin-left: 0 !important; }
    }
  `],
})
export class AppComponent implements OnInit {
  private branchService = inject(BranchService);
  private branchState = inject(BranchState);

  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  chatOpen = signal(false);
  notifOpen = signal(false);

  notifications = [
    { icon: 'trending-up', type: 'success', text: 'Manhattan revenue exceeded daily target by 12%', time: '5 min ago', unread: true },
    { icon: 'alert-triangle', type: 'warning', text: 'Vegas AC costs 15% above budget', time: '22 min ago', unread: true },
    { icon: 'users', type: 'info', text: 'Chicago evening shift fully staffed', time: '1 hr ago', unread: true },
    { icon: 'package', type: 'info', text: 'Seafood delivery confirmed for Miami', time: '2 hrs ago', unread: false },
    { icon: 'star', type: 'success', text: 'Beverly Hills received 5-star review', time: '3 hrs ago', unread: false },
    { icon: 'zap', type: 'warning', text: 'SF electricity usage spike detected', time: '4 hrs ago', unread: false },
  ];

  navItems: NavItem[] = [
    { icon: 'layout-dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'building-2', label: 'Branch Analytics', route: '/branches/br-001' },
    { icon: 'trending-up', label: 'Sales Insights', route: '/sales' },
    { icon: 'package-search', label: 'Supply Chain', route: '/supply-chain' },
    { icon: 'users', label: 'Labor', route: '/labor' },
    { icon: 'zap', label: 'Utilities', route: '/utilities' },
    { icon: 'brain-circuit', label: 'Predictions', route: '/predictions' },
  ];

  ngOnInit(): void {
    this.branchService.getBranches().subscribe(branches => {
      this.branchState.setBranches(branches);
    });
  }
}
