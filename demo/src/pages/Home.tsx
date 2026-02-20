import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Settings, User, LogOut, BookOpen, Code, Palette } from 'lucide-react';

export function HomePage() {
  const [name, setName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <Badge variant="secondary" className="mb-2">
          @coston/design-tokens
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Design Tokens</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Production-ready CSS variables built with OKLCH colors and semantic naming.
          Framework-agnostic design tokens that work with React, Vue, Svelte, Angular, vanilla
          JavaScript, or any CSS-in-JS solution.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with CSS variables (works with any framework)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Install the package</h3>
            <pre className="bg-background border border-border rounded-md p-3 text-sm overflow-x-auto">
              <code>{`npm install @coston/design-tokens`}</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Import in your global CSS file</h3>
            <pre className="bg-background border border-border rounded-md p-3 text-sm overflow-x-auto">
              <code>{`/* styles.css */
@import '@coston/design-tokens/tokens.css';`}</code>
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Or import in JS:{' '}
              <code className="bg-muted px-1 py-0.5 rounded">
                import '@coston/design-tokens/tokens.css'
              </code>
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Use CSS variables in your styles</h3>
            <pre className="bg-background border border-border rounded-md p-3 text-sm overflow-x-auto">
              <code>{`.button {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
}

.card {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}`}</code>
            </pre>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Optional:</strong> Using Tailwind? Import{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">tailwind.css</code> instead for
              utility classes.
            </p>
            <pre className="bg-background border border-border rounded-md p-3 text-sm overflow-x-auto">
              <code>{`/* styles.css */
@import '@coston/design-tokens/tailwind.css';

/* Then use Tailwind classes: */
<div className="bg-primary text-primary-foreground">
  <button className="bg-secondary text-secondary-foreground">
    Click me
  </button>
</div>`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Palette className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>OKLCH Colors</CardTitle>
            <CardDescription>
              Perceptually uniform color space for consistent, accessible design tokens
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Code className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Semantic Tokens</CardTitle>
            <CardDescription>
              Named tokens like primary, secondary, muted that work across light/dark themes
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Settings className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>CSS Variables</CardTitle>
            <CardDescription>
              Pure CSS custom properties, no JavaScript runtime or build step needed
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Component Examples */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Live Examples</h2>
        <p className="text-muted-foreground mb-6">
          See the design tokens in action with real UI components
        </p>

        <Tabs defaultValue="buttons" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>All button styles using semantic design tokens</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>Different button sizes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu</CardTitle>
                <CardDescription>Menu component with semantic token colors</CardDescription>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Open Menu <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>Uses card tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card uses the default card background and foreground colors from the design
                    tokens.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card className="bg-secondary text-secondary-foreground">
                <CardHeader>
                  <CardTitle>Secondary Card</CardTitle>
                  <CardDescription className="text-secondary-foreground/70">
                    Uses secondary tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm opacity-70">
                    This card explicitly uses secondary background and foreground colors.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="secondary">
                    Action
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-muted text-muted-foreground">
                <CardHeader>
                  <CardTitle className="text-foreground">Muted Card</CardTitle>
                  <CardDescription>Uses muted tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">This card uses muted colors for subtle content.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">
                    Action
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="mt-6">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Form Example</CardTitle>
                <CardDescription>Input fields with proper focus states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Input id="message" placeholder="Type your message..." className="h-20" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Submit</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="dialogs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dialog Component</CardTitle>
                <CardDescription>Modal dialogs using popover tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This dialog uses the popover background and foreground tokens for proper
                        contrast and elevation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Dialog content can include forms, text, or any other components. The
                        background automatically adapts to light and dark modes.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
