import * as React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings,
  Mail,
  LayoutDashboard,
  Trash2,
  CheckCheck,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '@/components/ui/menubar';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

type NotificationType = 'info' | 'warning' | 'success';

interface Notification {
  id: string;
  avatar: string;
  name: string;
  title: string;
  description: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    avatar: 'JD',
    name: 'Jane Doe',
    title: 'New comment on your post',
    description:
      'Left a comment on "Q4 Design System Updates" — "This looks great, love the new color tokens!"',
    timestamp: '2 minutes ago',
    type: 'info',
    read: false,
  },
  {
    id: '2',
    avatar: 'SM',
    name: 'System Monitor',
    title: 'Build failed for main branch',
    description: 'CI pipeline failed at step 3/5: lint errors detected in tokens.config.ts',
    timestamp: '15 minutes ago',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    avatar: 'AK',
    name: 'Alex Kim',
    title: 'Invited you to a project',
    description: 'You have been invited to collaborate on "Brand Refresh 2026"',
    timestamp: '1 hour ago',
    type: 'info',
    read: false,
  },
  {
    id: '4',
    avatar: 'CI',
    name: 'CI/CD Pipeline',
    title: 'Deployment successful',
    description: 'Production deployment v2.4.1 completed successfully. All health checks passed.',
    timestamp: '2 hours ago',
    type: 'success',
    read: true,
  },
  {
    id: '5',
    avatar: 'RP',
    name: 'Rachel Park',
    title: 'Payment received',
    description:
      'Invoice #1042 for $2,400.00 has been paid. Funds will be available in 2-3 business days.',
    timestamp: '3 hours ago',
    type: 'success',
    read: true,
  },
  {
    id: '6',
    avatar: 'TW',
    name: 'Tom Wilson',
    title: 'Mentioned you in a thread',
    description: '@you "Can you review the spacing tokens before we ship? Need your sign-off."',
    timestamp: '5 hours ago',
    type: 'info',
    read: false,
  },
  {
    id: '7',
    avatar: 'SY',
    name: 'System',
    title: 'Storage quota warning',
    description: 'Your workspace is using 85% of available storage. Consider archiving old assets.',
    timestamp: '8 hours ago',
    type: 'warning',
    read: true,
  },
  {
    id: '8',
    avatar: 'MJ',
    name: 'Maria Johnson',
    title: 'Shared a file with you',
    description: 'Shared "brand-guidelines-v3.pdf" (4.2 MB) to your Documents folder.',
    timestamp: '1 day ago',
    type: 'info',
    read: true,
  },
  {
    id: '9',
    avatar: 'BL',
    name: 'Bot',
    title: 'Weekly digest ready',
    description: 'Your weekly activity summary is ready: 12 commits, 5 reviews, 3 deployments.',
    timestamp: '1 day ago',
    type: 'success',
    read: true,
  },
  {
    id: '10',
    avatar: 'DK',
    name: 'Derek Kim',
    title: 'New team member joined',
    description: 'Sarah Chen has joined the Design Systems team. Say hello!',
    timestamp: '2 days ago',
    type: 'info',
    read: true,
  },
];

const badgeVariantMap: Record<NotificationType, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const typeIconMap: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5" />,
  warning: <AlertTriangle className="h-3.5 w-3.5" />,
  success: <CheckCircle2 className="h-3.5 w-3.5" />,
};

export function NotificationsPage() {
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 px-4 lg:px-6">
      {/* Menubar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Manage your alerts and activity feed.</p>
        </div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Filter</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setFilter('all')}>All</MenubarItem>
              <MenubarItem onClick={() => setFilter('unread')}>Unread</MenubarItem>
              <MenubarItem onClick={() => setFilter('read')}>Read</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Sort</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Newest first</MenubarItem>
              <MenubarItem>Oldest first</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Actions</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Command palette + Toast demo */}
        <div className="flex flex-col gap-6 lg:col-span-1 lg:self-stretch [&>*:last-child]:flex-1">
          {/* Command palette */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription>Search commands and notification categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <Command className="rounded-lg border">
                <CommandInput placeholder="Search actions..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Navigation">
                    <CommandItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </CommandItem>
                    <CommandItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Mail
                    </CommandItem>
                    <CommandItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Actions">
                    <CommandItem>
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Mark all read
                    </CommandItem>
                    <CommandItem>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear notifications
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CardContent>
          </Card>

          {/* Toast demo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Toast Notifications</CardTitle>
              <CardDescription>Trigger different toast styles.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success('Changes saved', {
                    description: 'Your preferences have been updated.',
                  })
                }
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                Success
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.error('Something went wrong', {
                    description: 'Please try again later.',
                  })
                }
              >
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-red-500" />
                Error
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info('New update available', {
                    description: 'Version 2.5.0 is ready to install.',
                  })
                }
              >
                <Info className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast('Item archived', {
                    description: 'The notification has been archived.',
                    action: {
                      label: 'Undo',
                      onClick: () => toast.info('Undo successful'),
                    },
                  })
                }
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                With Action
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Notification list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Activity Feed
                  {filter !== 'all' && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filter}
                    </Badge>
                  )}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {filtered.length} notification
                  {filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                <div className="flex flex-col">
                  {filtered.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <div
                        className={cn(
                          'flex items-start gap-3 px-6 py-4 transition-colors hover:bg-accent/50',
                          !notification.read && 'bg-muted/30'
                        )}
                      >
                        {/* Unread indicator */}
                        <div className="mt-2 flex-shrink-0">
                          {!notification.read ? (
                            <span className="block h-2 w-2 rounded-full bg-blue-500" />
                          ) : (
                            <span className="block h-2 w-2" />
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="text-xs">{notification.avatar}</AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{notification.title}</span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px] px-1.5 py-0 gap-1 flex-shrink-0',
                                badgeVariantMap[notification.type]
                              )}
                            >
                              {typeIconMap[notification.type]}
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground/70">
                            {notification.name} &middot; {notification.timestamp}
                          </p>
                        </div>
                      </div>
                      {index < filtered.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(p => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                {[1, 2, 3].map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(p => Math.min(3, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
