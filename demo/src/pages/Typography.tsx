import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bookmark, Calendar, Clock, Heart, MessageCircle, Share2 } from 'lucide-react';

function FontShowcase() {
  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle>Font Showcase</CardTitle>
        <CardDescription>View theme fonts in different styles</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">Sans-Serif</h3>
            <div className="space-y-1 font-sans">
              <div className="font-light">Light Weight Text</div>
              <div>Regular Weight Text</div>
              <div className="font-medium">Medium Weight Text</div>
              <div className="font-semibold">Semibold Weight Text</div>
              <div className="font-bold">Bold Weight Text</div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">Serif</h3>
            <div className="space-y-1 font-serif">
              <div className="font-light">Light Weight Text</div>
              <div>Regular Weight Text</div>
              <div className="font-medium">Medium Weight Text</div>
              <div className="font-semibold">Semibold Weight Text</div>
              <div className="font-bold">Bold Weight Text</div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">Monospace</h3>
            <div className="space-y-1 font-mono">
              <div className="font-light">Light Weight Text</div>
              <div>Regular Weight Text</div>
              <div className="font-medium">Medium Weight Text</div>
              <div className="font-semibold">Semibold Weight Text</div>
              <div className="font-bold">Bold Weight Text</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BlogPost() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 bg-card px-4 py-2">
        <div className="flex gap-2">
          <div className="size-3 rounded-full bg-red-500" />
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <article className="space-y-8">
          <header className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Technology</Badge>
              <Badge variant="outline">Web Development</Badge>
              <Badge variant="outline">React</Badge>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight lg:text-5xl">
              The Future of Web Development: Embracing Modern Technologies
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Discover how cutting-edge technologies are reshaping the landscape of web development,
              from AI-powered tools to revolutionary frameworks.
            </p>
            <div className="flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Jane Doe</p>
                  <p className="text-sm text-muted-foreground">Senior Developer</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Dec 15, 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>8 min read</span>
                </div>
              </div>
            </div>
          </header>

          <Separator />

          <div className="aspect-video overflow-hidden rounded-lg bg-muted" />

          <div className="max-w-none space-y-4">
            <p className="text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris.
            </p>
            <h2 className="mt-8 mb-4 text-2xl font-bold">The Evolution of Modern Frameworks</h2>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
            <blockquote className="my-6 border-l-4 border-primary pl-6 text-lg italic">
              &quot;The best way to predict the future is to create it. In web development,
              we&apos;re not just following trends — we&apos;re setting them.&quot;
            </blockquote>
            <h3 className="mt-6 mb-3 text-xl font-semibold">Key Technologies Shaping the Future</h3>
            <ul className="my-4 list-disc space-y-2 pl-6">
              <li>Artificial Intelligence and Machine Learning integration</li>
              <li>Edge computing and serverless architectures</li>
              <li>Progressive Web Applications (PWAs)</li>
              <li>WebAssembly for high-performance applications</li>
              <li>Advanced CSS features and container queries</li>
            </ul>
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-2 font-semibold">Pro Tip</h4>
                <p className="text-sm text-muted-foreground">
                  Always stay updated with the latest web standards and best practices. The web
                  development landscape evolves rapidly, and continuous learning is key.
                </p>
              </CardContent>
            </Card>
            <h2 className="mt-8 mb-4 text-2xl font-bold">Looking Ahead</h2>
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
              consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span>42</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>12</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Save for later</span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Jane Doe</h3>
                  <p className="mb-2 text-muted-foreground">Senior Developer & Tech Writer</p>
                  <p className="text-sm">
                    Jane is a passionate developer with over 8 years of experience in web
                    development. She specializes in React, TypeScript, and modern web technologies.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="self-start">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </Card>
  );
}

export function TypographyPage() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_2fr] lg:p-6">
      <div className="sticky top-4 hidden max-h-[calc(100vh-6rem)] overflow-hidden lg:block">
        <FontShowcase />
      </div>
      <BlogPost />
    </div>
  );
}
