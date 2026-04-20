import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpCircleIcon,
  BellIcon,
  CreditCardIcon,
  FileIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MailIcon,
  PaletteIcon,
  SettingsIcon,
  TagIcon,
  TypeIcon,
} from 'lucide-react';

import { NavUser } from '@/components/dashboard/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
  },
  application: [
    { title: 'Dashboard', url: '/', icon: LayoutDashboardIcon },
    { title: 'Mail', url: '/mail', icon: MailIcon },
    { title: 'Files', url: '/files', icon: FileIcon },
    { title: 'Notifications', url: '/notifications', icon: BellIcon },
  ],
  showcase: [
    { title: 'Cards', url: '/cards', icon: CreditCardIcon },
    { title: 'Gallery', url: '/gallery', icon: ImageIcon },
    { title: 'Settings', url: '/settings', icon: SettingsIcon },
    { title: 'Pricing', url: '/pricing', icon: TagIcon },
    { title: 'Typography', url: '/typography', icon: TypeIcon },
    { title: 'Colors', url: '/colors', icon: PaletteIcon },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Design Tokens</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.application.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Showcase</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.showcase.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
