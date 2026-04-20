import * as React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AlertCircle,
  Archive,
  ArchiveX,
  Clock,
  File,
  Forward,
  Inbox,
  MessagesSquare,
  MoreVertical,
  Reply,
  ReplyAll,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Mail = {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: string[];
};

const mails: Mail[] = [
  {
    id: '1',
    name: 'William Smith',
    email: 'william@example.com',
    subject: 'Meeting Tomorrow',
    text: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William",
    date: '2023-10-22T09:00:00',
    read: true,
    labels: ['meeting', 'work', 'important'],
  },
  {
    id: '2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    subject: 'Re: Project Update',
    text: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job.\n\nI have a few minor suggestions that I'll include in the attached document.\n\nBest regards, Alice",
    date: '2023-10-22T10:30:00',
    read: true,
    labels: ['work', 'important'],
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    subject: 'Weekend Plans',
    text: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun.\n\nIf you're interested, let me know!\n\nBest, Bob",
    date: '2023-04-10T11:45:00',
    read: true,
    labels: ['personal'],
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    subject: 'Re: Question about Budget',
    text: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation of resources.\n\nI've attached a detailed analysis for your reference.\n\nThanks, Emily",
    date: '2023-03-25T13:15:00',
    read: false,
    labels: ['work', 'budget'],
  },
  {
    id: '5',
    name: 'Michael Wilson',
    email: 'michael@example.com',
    subject: 'Important Announcement',
    text: 'I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach to the upcoming product launch.\n\nPlease be prepared to share your insights during the meeting.\n\nRegards, Michael',
    date: '2023-03-10T15:00:00',
    read: false,
    labels: ['meeting', 'work', 'important'],
  },
  {
    id: '6',
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    subject: 'Re: Feedback on Proposal',
    text: "Thank you for your feedback on the proposal. It looks great! I'm pleased to hear that you found it promising.\n\nI've attached the revised proposal for your review.\n\nBest regards, Sarah",
    date: '2023-02-15T16:30:00',
    read: true,
    labels: ['work'],
  },
  {
    id: '7',
    name: 'David Lee',
    email: 'david@example.com',
    subject: 'New Project Idea',
    text: "I have an exciting new project idea to discuss with you. It involves expanding our services to target a niche market.\n\nI've prepared a detailed proposal outlining the potential benefits and the strategy for execution.\n\nBest regards, David",
    date: '2023-01-28T17:45:00',
    read: false,
    labels: ['meeting', 'work', 'important'],
  },
  {
    id: '8',
    name: 'Sophia White',
    email: 'sophia@example.com',
    subject: 'Team Dinner',
    text: "Let's have a team dinner next week to celebrate our success. I've made reservations at a lovely restaurant.\n\nPlease confirm your availability. Looking forward to it!\n\nBest, Sophia",
    date: '2022-11-05T20:30:00',
    read: false,
    labels: ['meeting', 'work'],
  },
];

const navLinks = [
  { title: 'Inbox', label: '128', icon: Inbox, variant: 'default' as const },
  { title: 'Drafts', label: '9', icon: File, variant: 'ghost' as const },
  { title: 'Sent', label: '', icon: Send, variant: 'ghost' as const },
  { title: 'Junk', label: '23', icon: ArchiveX, variant: 'ghost' as const },
  { title: 'Trash', label: '', icon: Trash2, variant: 'ghost' as const },
  { title: 'Archive', label: '', icon: Archive, variant: 'ghost' as const },
];

const navLinks2 = [
  { title: 'Social', label: '972', icon: Users2, variant: 'ghost' as const },
  { title: 'Updates', label: '342', icon: AlertCircle, variant: 'ghost' as const },
  { title: 'Forums', label: '128', icon: MessagesSquare, variant: 'ghost' as const },
  { title: 'Shopping', label: '8', icon: ShoppingCart, variant: 'ghost' as const },
];

function getBadgeVariant(label: string): 'default' | 'outline' | 'secondary' {
  if (label === 'work') return 'default';
  if (label === 'personal') return 'outline';
  return 'secondary';
}

export function MailPage() {
  const [selectedId, setSelectedId] = React.useState<string>(mails[0].id);
  const selected = mails.find(m => m.id === selectedId) || null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="grid h-[calc(100vh-3rem)] grid-cols-[220px_1fr_1fr] overflow-hidden">
        {/* Nav sidebar */}
        <div className="flex flex-col border-r border-border/50">
          <div className="p-2">
            <Button variant="default" className="w-full justify-start gap-2" size="sm">
              <Inbox className="h-4 w-4" /> Alicia Koch
            </Button>
          </div>
          <Separator />
          <nav className="grid gap-1 p-2">
            {navLinks.map(link => (
              <Tooltip key={link.title}>
                <TooltipTrigger asChild>
                  <Button variant={link.variant} size="sm" className="justify-start">
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.title}
                    {link.label && (
                      <span
                        className={cn(
                          'ml-auto',
                          link.variant === 'default' ? 'text-background' : 'text-muted-foreground'
                        )}
                      >
                        {link.label}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{link.title}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <Separator />
          <nav className="grid gap-1 p-2">
            {navLinks2.map(link => (
              <Button key={link.title} variant="ghost" size="sm" className="justify-start">
                <link.icon className="mr-2 h-4 w-4" />
                {link.title}
                {link.label && <span className="ml-auto text-muted-foreground">{link.label}</span>}
              </Button>
            ))}
          </nav>
        </div>

        {/* Mail list */}
        <div className="flex flex-col border-r border-border/50">
          <Tabs defaultValue="all" className="flex h-full flex-col">
            <div className="flex items-center px-4 py-1.5">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all">All mail</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" className="pl-8" />
              </div>
            </div>
            <TabsContent value="all" className="m-0 min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 p-4 pt-0">
                  {mails.map(item => (
                    <button
                      key={item.id}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-lg border border-border/50 p-3 text-left text-sm transition-all hover:bg-accent',
                        selectedId === item.id && 'bg-primary/10 border-primary/30'
                      )}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{item.name}</div>
                            {!item.read && (
                              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <div
                            className={cn(
                              'ml-auto text-xs',
                              selectedId === item.id ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="text-xs font-medium">{item.subject}</div>
                      </div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {item.text.substring(0, 300)}
                      </div>
                      {item.labels.length > 0 && (
                        <div className="flex items-center gap-2">
                          {item.labels.map(label => (
                            <Badge key={label} variant={getBadgeVariant(label)}>
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="unread" className="m-0 min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 p-4 pt-0">
                  {mails
                    .filter(m => !m.read)
                    .map(item => (
                      <button
                        key={item.id}
                        className={cn(
                          'flex flex-col items-start gap-2 rounded-lg border border-border/50 p-3 text-left text-sm transition-all hover:bg-accent',
                          selectedId === item.id && 'bg-primary/10 border-primary/30'
                        )}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div className="flex w-full flex-col gap-1">
                          <div className="flex items-center">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">{item.name}</div>
                              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                            </div>
                            <div className="ml-auto text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                            </div>
                          </div>
                          <div className="text-xs font-medium">{item.subject}</div>
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {item.text.substring(0, 300)}
                        </div>
                      </button>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Mail display */}
        <div className="flex h-full flex-col">
          <div className="flex items-center p-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!selected}>
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!selected}>
                    <ArchiveX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to junk</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!selected}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to trash</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!selected}>
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Snooze</TooltipContent>
              </Tooltip>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!selected}>
                    <Reply className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!selected}>
                    <ReplyAll className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply all</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!selected}>
                    <Forward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!selected}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Star thread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
          {selected ? (
            <div className="flex flex-1 flex-col">
              <div className="flex items-start p-4">
                <div className="flex items-start gap-4 text-sm">
                  <Avatar>
                    <AvatarFallback>
                      {selected.name
                        .split(' ')
                        .map(c => c[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">{selected.name}</div>
                    <div className="line-clamp-1 text-xs">{selected.subject}</div>
                    <div className="line-clamp-1 text-xs">
                      <span className="font-medium">Reply-To:</span> {selected.email}
                    </div>
                  </div>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(selected.date), 'PPpp')}
                </div>
              </div>
              <Separator />
              <div className="flex-1 whitespace-pre-wrap p-4 text-sm">{selected.text}</div>
              <Separator className="mt-auto" />
              <div className="p-4">
                <form>
                  <div className="grid gap-4">
                    <Textarea className="p-4" placeholder={`Reply ${selected.name}...`} />
                    <div className="flex items-center">
                      <Label htmlFor="mute" className="flex items-center gap-2 text-xs font-normal">
                        <Switch id="mute" /> Mute this thread
                      </Label>
                      <Button size="sm" className="ml-auto" onClick={e => e.preventDefault()}>
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No message selected</div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
