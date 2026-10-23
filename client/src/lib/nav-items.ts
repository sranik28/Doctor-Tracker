import { LayoutDashboard, type LucideIcon, Stethoscope, Users } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Doctors', href: '/doctors', icon: Stethoscope },
  { title: 'Patients', href: '/patients', icon: Users },
];

export const isNavItemActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
