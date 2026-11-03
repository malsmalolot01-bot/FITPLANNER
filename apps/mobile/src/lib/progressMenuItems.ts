import { CreditCard, Flame, Receipt, TrendingUp, type LucideIcon } from 'lucide-react';

export interface ProgressMenuItem {
  path: string;
  label: string;
  icon?: LucideIcon;
  /** Stays clickable when the user's subscription is expired. */
  allowWhenLocked?: boolean;
}

// To extend the menu later, add one line here.
export const PROGRESS_MENU_ITEMS: ProgressMenuItem[] = [
  { path: '/progress', label: 'Weight Progress', icon: TrendingUp },
  { path: '/calories', label: 'Calories Burned', icon: Flame },
  { path: '/payment-history', label: 'Payment History', icon: Receipt, allowWhenLocked: true },
  { path: '/subscription', label: 'Subscription', icon: CreditCard, allowWhenLocked: true },
];