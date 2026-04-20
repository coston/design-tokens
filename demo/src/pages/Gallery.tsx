import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Image, Film, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
}

const featuredItems: FeaturedItem[] = [
  {
    id: '1',
    title: 'Summer Campaign',
    subtitle: '48 assets — Brand photography',
    gradient: 'from-rose-500 to-orange-400',
  },
  {
    id: '2',
    title: 'Product Launch',
    subtitle: '32 assets — Product renders',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    id: '3',
    title: 'Team Offsite',
    subtitle: '124 assets — Event photography',
    gradient: 'from-cyan-500 to-blue-400',
  },
  {
    id: '4',
    title: 'Brand Guidelines',
    subtitle: '16 assets — Design system docs',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    id: '5',
    title: 'Q1 Marketing',
    subtitle: '67 assets — Social media',
    gradient: 'from-amber-500 to-yellow-400',
  },
];

interface GalleryItem {
  id: string;
  title: string;
  date: string;
  type: 'Photo' | 'Video' | 'Document';
  gradient: string;
  ratio: number;
}

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Hero Banner',
    date: 'Apr 18, 2026',
    type: 'Photo',
    gradient: 'from-pink-400 to-rose-500',
    ratio: 4 / 3,
  },
  {
    id: '2',
    title: 'Product Demo',
    date: 'Apr 15, 2026',
    type: 'Video',
    gradient: 'from-sky-400 to-indigo-500',
    ratio: 1,
  },
  {
    id: '3',
    title: 'Style Guide',
    date: 'Apr 12, 2026',
    type: 'Document',
    gradient: 'from-lime-400 to-green-500',
    ratio: 4 / 3,
  },
  {
    id: '4',
    title: 'Team Photo',
    date: 'Apr 10, 2026',
    type: 'Photo',
    gradient: 'from-fuchsia-400 to-purple-500',
    ratio: 1,
  },
  {
    id: '5',
    title: 'Promo Reel',
    date: 'Apr 8, 2026',
    type: 'Video',
    gradient: 'from-orange-400 to-red-500',
    ratio: 4 / 3,
  },
  {
    id: '6',
    title: 'Icon Set',
    date: 'Apr 5, 2026',
    type: 'Photo',
    gradient: 'from-teal-400 to-cyan-500',
    ratio: 1,
  },
  {
    id: '7',
    title: 'Onboarding Flow',
    date: 'Apr 2, 2026',
    type: 'Document',
    gradient: 'from-yellow-400 to-amber-500',
    ratio: 4 / 3,
  },
  {
    id: '8',
    title: 'Brand Intro',
    date: 'Mar 30, 2026',
    type: 'Video',
    gradient: 'from-violet-400 to-indigo-500',
    ratio: 1,
  },
  {
    id: '9',
    title: 'Social Templates',
    date: 'Mar 28, 2026',
    type: 'Photo',
    gradient: 'from-rose-400 to-pink-500',
    ratio: 4 / 3,
  },
];

const typeIconMap: Record<string, React.ReactNode> = {
  Photo: <Image className="h-3 w-3" />,
  Video: <Film className="h-3 w-3" />,
  Document: <FileText className="h-3 w-3" />,
};

export function GalleryPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = React.useState('all');

  const filteredItems = galleryItems.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photos') return item.type === 'Photo';
    if (activeTab === 'videos') return item.type === 'Video';
    if (activeTab === 'documents') return item.type === 'Document';
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Browse, filter, and manage your media assets.
          </p>
        </div>
        <Drawer>
          <DrawerTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Upload Files</DrawerTitle>
                <DrawerDescription>
                  Drag and drop files or click to browse from your device.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 text-center transition-colors hover:border-muted-foreground/50">
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium">Drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, MP4, PDF up to 50MB</p>
                </div>
              </div>
              <DrawerFooter>
                <Button>Upload</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Navigation menu */}
      <NavigationMenu>
        <NavigationMenuList>
          {[
            { label: 'All', value: 'all' },
            { label: 'Photos', value: 'photos' },
            { label: 'Videos', value: 'videos' },
            { label: 'Documents', value: 'documents' },
          ].map(tab => (
            <NavigationMenuItem key={tab.value}>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  activeTab === tab.value && 'bg-primary text-primary-foreground'
                )}
                onClick={() => setActiveTab(tab.value)}
                href="#"
              >
                {tab.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Featured carousel */}
      <div>
        <h2 className="mb-3 text-lg font-medium">Featured Collections</h2>
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent className="-ml-4">
            {featuredItems.map(item => (
              <CarouselItem key={item.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <AspectRatio ratio={16 / 9}>
                      <div
                        className={cn(
                          'flex h-full w-full flex-col items-start justify-end bg-gradient-to-r p-4',
                          item.gradient
                        )}
                      >
                        <h3 className="text-lg font-semibold text-white drop-shadow-sm">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/80">{item.subtitle}</p>
                      </div>
                    </AspectRatio>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[200px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        <Select defaultValue="newest">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gallery grid */}
      <div className="grid min-h-[400px] grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => (
          <Card key={item.id} className="group overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-0">
              <AspectRatio ratio={item.ratio}>
                <div
                  className={cn(
                    'flex h-full w-full flex-col items-start justify-end bg-gradient-to-r p-4 transition-opacity group-hover:opacity-90',
                    item.gradient
                  )}
                >
                  <Badge
                    variant="secondary"
                    className="mb-2 gap-1 bg-white/20 text-white backdrop-blur-sm text-[10px]"
                  >
                    {typeIconMap[item.type]}
                    {item.type}
                  </Badge>
                  <h3 className="text-sm font-semibold text-white drop-shadow-sm">{item.title}</h3>
                  <p className="text-xs text-white/70">{item.date}</p>
                </div>
              </AspectRatio>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
