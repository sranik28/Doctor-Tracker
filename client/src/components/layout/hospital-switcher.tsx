'use client';

import { Building2, Check, ChevronsUpDown, Stethoscope } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useDoctorFilterOptions } from '@/hooks/use-doctors';
import { useSelectedHospital } from '@/hooks/use-selected-hospital';

const ALL_HOSPITALS = 'All hospitals';

/** Picks the hospital every list and chart in the admin panel is scoped to. */
export function HospitalSwitcher() {
  const { isMobile } = useSidebar();
  const { hospital, setHospital } = useSelectedHospital();
  const { data: options } = useDoctorFilterOptions();

  // Keep a saved hospital selectable even if it is no longer in the list.
  const hospitals = options?.hospitals ?? [];
  const items = hospital && !hospitals.includes(hospital) ? [hospital, ...hospitals] : hospitals;
  const Icon = hospital ? Building2 : Stethoscope;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={hospital ?? ALL_HOSPITALS}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <span
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{hospital ?? ALL_HOSPITALS}</span>
                <span className="truncate text-xs text-muted-foreground">Doctor Tracker</span>
              </span>
              <ChevronsUpDown className="ml-auto" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="max-h-80 min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Hospitals
            </DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setHospital(undefined)} className="gap-2 p-2">
              <span className="flex size-6 items-center justify-center rounded-md border">
                <Stethoscope className="size-3.5 shrink-0" aria-hidden="true" />
              </span>
              {ALL_HOSPITALS}
              {!hospital && <Check className="ml-auto" aria-label="Selected" />}
            </DropdownMenuItem>
            {items.length > 0 && <DropdownMenuSeparator />}
            {items.map((name) => (
              <DropdownMenuItem key={name} onSelect={() => setHospital(name)} className="gap-2 p-2">
                <span className="flex size-6 items-center justify-center rounded-md border">
                  <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                </span>
                <span className="truncate">{name}</span>
                {hospital === name && <Check className="ml-auto" aria-label="Selected" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
