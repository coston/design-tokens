import * as React from 'react';
import {
  ChevronRight,
  File,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  Info,
  Search,
  Download,
  Pencil,
  FolderInput,
  Share2,
  Trash2,
  ExternalLink,
  FileSpreadsheet,
  FileCode,
  Music,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type FileItem = {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  modified: string;
  created: string;
  type: string;
  folder: string;
  path: string;
  icon: React.ElementType;
};

const files: FileItem[] = [
  {
    id: '1',
    name: 'Q4 Report.pdf',
    size: '2.4 MB',
    sizeBytes: 2516582,
    modified: '2026-04-18',
    created: '2026-03-01',
    type: 'PDF',
    folder: 'Documents',
    path: '/Documents/Q4 Report.pdf',
    icon: FileText,
  },
  {
    id: '2',
    name: 'Budget 2026.xlsx',
    size: '845 KB',
    sizeBytes: 865280,
    modified: '2026-04-15',
    created: '2026-01-12',
    type: 'Spreadsheet',
    folder: 'Documents',
    path: '/Documents/Budget 2026.xlsx',
    icon: FileSpreadsheet,
  },
  {
    id: '3',
    name: 'Hero Banner.png',
    size: '3.1 MB',
    sizeBytes: 3250585,
    modified: '2026-04-12',
    created: '2026-04-10',
    type: 'Image',
    folder: 'Images',
    path: '/Images/Hero Banner.png',
    icon: FileImage,
  },
  {
    id: '4',
    name: 'Logo.svg',
    size: '12 KB',
    sizeBytes: 12288,
    modified: '2026-04-10',
    created: '2025-09-05',
    type: 'Image',
    folder: 'Images',
    path: '/Images/Logo.svg',
    icon: FileImage,
  },
  {
    id: '5',
    name: 'Product Demo.mp4',
    size: '148 MB',
    sizeBytes: 155189248,
    modified: '2026-04-08',
    created: '2026-04-07',
    type: 'Video',
    folder: 'Videos',
    path: '/Videos/Product Demo.mp4',
    icon: FileVideo,
  },
  {
    id: '6',
    name: 'Meeting Notes.docx',
    size: '56 KB',
    sizeBytes: 57344,
    modified: '2026-04-05',
    created: '2026-03-30',
    type: 'Document',
    folder: 'Documents',
    path: '/Documents/Meeting Notes.docx',
    icon: FileText,
  },
  {
    id: '7',
    name: 'app.config.ts',
    size: '4 KB',
    sizeBytes: 4096,
    modified: '2026-04-02',
    created: '2025-11-15',
    type: 'Code',
    folder: 'Documents',
    path: '/Documents/app.config.ts',
    icon: FileCode,
  },
  {
    id: '8',
    name: 'Team Photo.jpg',
    size: '5.6 MB',
    sizeBytes: 5872025,
    modified: '2026-03-28',
    created: '2026-03-28',
    type: 'Image',
    folder: 'Images',
    path: '/Images/Team Photo.jpg',
    icon: FileImage,
  },
  {
    id: '9',
    name: 'Onboarding.mp4',
    size: '89 MB',
    sizeBytes: 93323264,
    modified: '2026-03-20',
    created: '2026-02-14',
    type: 'Video',
    folder: 'Videos',
    path: '/Videos/Onboarding.mp4',
    icon: FileVideo,
  },
  {
    id: '10',
    name: 'Podcast Ep12.mp3',
    size: '42 MB',
    sizeBytes: 44040192,
    modified: '2026-03-15',
    created: '2026-03-15',
    type: 'Audio',
    folder: 'Documents',
    path: '/Documents/Podcast Ep12.mp3',
    icon: Music,
  },
];

type FolderNode = {
  name: string;
  children: string[];
};

const folders: FolderNode[] = [
  {
    name: 'Documents',
    children: ['Reports', 'Notes', 'Config'],
  },
  {
    name: 'Images',
    children: ['Banners', 'Logos', 'Photos'],
  },
  {
    name: 'Videos',
    children: ['Demos', 'Tutorials'],
  },
];

function FolderTree({
  selectedFolder,
  onSelectFolder,
}: {
  selectedFolder: string | null;
  onSelectFolder: (name: string) => void;
}) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelectFolder('')}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
          selectedFolder === '' && 'bg-primary/10 text-primary font-medium'
        )}
      >
        <Folder className="h-4 w-4 text-muted-foreground" />
        All Files
      </button>
      {folders.map(folder => (
        <FolderCollapsible
          key={folder.name}
          folder={folder}
          selectedFolder={selectedFolder}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </div>
  );
}

function FolderCollapsible({
  folder,
  selectedFolder,
  onSelectFolder,
}: {
  folder: FolderNode;
  selectedFolder: string | null;
  onSelectFolder: (name: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center">
        <CollapsibleTrigger asChild>
          <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent">
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
                open && 'rotate-90'
              )}
            />
          </button>
        </CollapsibleTrigger>
        <button
          onClick={() => onSelectFolder(folder.name)}
          className={cn(
            'flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
            selectedFolder === folder.name && 'bg-primary/10 text-primary font-medium'
          )}
        >
          {open ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          {folder.name}
        </button>
      </div>
      <CollapsibleContent>
        <div className="ml-6 space-y-0.5 border-l pl-2">
          {folder.children.map(child => (
            <button
              key={child}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Folder className="h-3.5 w-3.5" />
              {child}
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FileTypeIcon({ file }: { file: FileItem }) {
  const Icon = file.icon;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
}

export function FilesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>('');

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === '' || file.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex flex-1 flex-col p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Files</h1>
        <p className="text-muted-foreground">Browse, manage, and preview your documents.</p>
      </div>

      <div className="h-[calc(100vh-12rem)] overflow-hidden rounded-lg border border-border/50">
        <ResizablePanelGroup orientation="horizontal">
          {/* Left Panel - Folder Tree */}
          <ResizablePanel defaultSize="18%" minSize="12%" maxSize="30%">
            <div className="flex h-full flex-col">
              <div className="border-b border-border/40 px-3 py-2">
                <p className="text-sm font-medium">Folders</p>
              </div>
              <ScrollArea className="flex-1 p-2">
                <FolderTree selectedFolder={selectedFolder} onSelectFolder={setSelectedFolder} />
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - File List */}
          <ResizablePanel defaultSize="57%" minSize="30%">
            <div className="flex h-full flex-col">
              <div className="border-b border-border/40 px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="h-9 pl-9"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[80px]">Size</TableHead>
                      <TableHead className="w-[100px]">Modified</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[40px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map(file => (
                      <ContextMenu key={file.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow className="cursor-default">
                            <TableCell>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <button className="flex items-center gap-2 text-sm hover:underline">
                                    <FileTypeIcon file={file} />
                                    {file.name}
                                  </button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-72" side="right">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                      <FileTypeIcon file={file} />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">{file.path}</p>
                                      <Separator className="my-1.5" />
                                      <div className="text-xs text-muted-foreground">
                                        <p>Size: {file.size}</p>
                                        <p>Created: {file.created}</p>
                                        <p>Modified: {file.modified}</p>
                                      </div>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{file.size}</TableCell>
                            <TableCell className="text-muted-foreground">{file.modified}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{file.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Info className="h-3.5 w-3.5" />
                                  </Button>
                                </SheetTrigger>
                                <SheetContent>
                                  <SheetHeader>
                                    <SheetTitle>{file.name}</SheetTitle>
                                    <SheetDescription>File details and actions</SheetDescription>
                                  </SheetHeader>
                                  <div className="mt-6 space-y-6">
                                    <div className="flex items-center justify-center rounded-lg bg-muted p-8">
                                      <file.icon className="h-16 w-16 text-muted-foreground" />
                                    </div>

                                    <div className="space-y-3">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">File name</span>
                                        <span className="font-medium">{file.name}</span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Size</span>
                                        <span className="font-medium">{file.size}</span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Type</span>
                                        <Badge variant="outline">{file.type}</Badge>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Location</span>
                                        <span className="font-medium">{file.path}</span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Created</span>
                                        <span className="font-medium">{file.created}</span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Modified</span>
                                        <span className="font-medium">{file.modified}</span>
                                      </div>
                                    </div>

                                    <Separator />

                                    <div className="flex flex-col gap-2">
                                      <Button className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                      </Button>
                                      <Button variant="outline" className="w-full">
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                      </Button>
                                      <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </SheetContent>
                              </Sheet>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <FolderInput className="mr-2 h-4 w-4" />
                            Move
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                    {filteredFiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          <File className="mx-auto mb-2 h-8 w-8" />
                          No files found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Preview / Summary */}
          <ResizablePanel defaultSize="25%" minSize="15%" maxSize="40%">
            <div className="flex h-full flex-col">
              <div className="border-b border-border/40 px-3 py-2">
                <p className="text-sm font-medium">Summary</p>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-lg bg-muted/50 p-4">
                    <Folder className="h-8 w-8 text-muted-foreground/70" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium">{selectedFolder || 'All Files'}</p>
                    <p className="text-xs text-muted-foreground">
                      {filteredFiles.length} file
                      {filteredFiles.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      File Types
                    </p>
                    {Object.entries(
                      filteredFiles.reduce(
                        (acc, f) => {
                          acc[f.type] = (acc[f.type] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>
                      )
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span>{type}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Size
                    </p>
                    <p className="text-lg font-semibold">
                      {(
                        filteredFiles.reduce((acc, f) => acc + f.sizeBytes, 0) /
                        1024 /
                        1024
                      ).toFixed(1)}{' '}
                      MB
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Recent Activity
                    </p>
                    {filteredFiles.slice(0, 3).map(file => (
                      <div key={file.id} className="flex items-center gap-2">
                        <FileTypeIcon file={file} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.modified}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
