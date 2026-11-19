import { BarChart3, CalendarDays, LayoutDashboard, Trash2 } from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Daily Menu", icon: CalendarDays },
  { href: "/admin/waste", label: "Waste Log", icon: Trash2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];
