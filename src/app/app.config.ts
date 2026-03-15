import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';
import {
  LUCIDE_ICONS, LucideIconProvider,
  LayoutDashboard, Building2, TrendingUp, PackageSearch, Users, Zap,
  BrainCircuit, MessageSquareDot, PanelLeftClose, PanelLeftOpen,
  Bell, Menu, X, ChevronRight, Sun, Moon, MapPin, CalendarRange,
  DollarSign, BedDouble, BarChart3, PiggyBank, ArrowUpRight, ArrowDownRight, Minus,
  Send, Copy, User, CalendarDays, Sparkles, Settings,
  Store, ShoppingCart, Crown, Flame, Activity, PieChart, Wallet, Utensils,
  Package, Beef, Tags, Truck, BookOpen, ClipboardList, Brain, CalendarHeart, Thermometer,
  Calendar, Droplets, AlertTriangle, Star, Search, Filter, ChevronDown,
  Download, Eye, MoreHorizontal, CircleDot, CheckCircle2, Clock,
} from 'lucide-angular';

const allIcons = {
  LayoutDashboard, Building2, TrendingUp, PackageSearch, Users, Zap,
  BrainCircuit, MessageSquareDot, PanelLeftClose, PanelLeftOpen,
  Bell, Menu, X, ChevronRight, Sun, Moon, MapPin, CalendarRange,
  DollarSign, BedDouble, BarChart3, PiggyBank, ArrowUpRight, ArrowDownRight, Minus,
  Send, Copy, User, CalendarDays, Sparkles, Settings,
  Store, ShoppingCart, Crown, Flame, Activity, PieChart, Wallet, Utensils,
  Package, Beef, Tags, Truck, BookOpen, ClipboardList, Brain, CalendarHeart, Thermometer,
  Calendar, Droplets, AlertTriangle, Star, Search, Filter, ChevronDown,
  Download, Eye, MoreHorizontal, CircleDot, CheckCircle2, Clock,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    provideAnimationsAsync(),
    { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(allIcons) },
  ],
};
