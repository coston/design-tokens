import * as React from 'react';
import { AlertCircle, Info, ShieldAlert, Trash2, User, Bell, Paintbrush } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@coston/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@coston/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@coston/ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@coston/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@coston/ui/breadcrumb';
import { Button } from '@coston/ui/button';
import { Card, CardContent } from '@coston/ui/card';
import { Input } from '@coston/ui/input';
import { Label } from '@coston/ui/label';
import { Progress } from '@coston/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@coston/ui/select';
import { Separator } from '@coston/ui/separator';
import { Skeleton } from '@coston/ui/skeleton';
import { Slider } from '@coston/ui/slider';
import { Switch } from '@coston/ui/switch';

export function SettingsPage() {
  const [showSkeleton, setShowSkeleton] = React.useState(false);
  const [emailNotif, setEmailNotif] = React.useState(true);
  const [pushNotif, setPushNotif] = React.useState(false);
  const [smsNotif, setSmsNotif] = React.useState(false);
  const [digestFrequency, setDigestFrequency] = React.useState([3]);
  const [fontSize, setFontSize] = React.useState([16]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Email not verified</AlertTitle>
        <AlertDescription>
          Your email address has not been verified. Please check your inbox for a verification link.
        </AlertDescription>
      </Alert>

      {/* Accordion Sections */}
      <Card>
        <CardContent className="pt-6">
          <Accordion type="multiple" defaultValue={['profile', 'notifications']}>
            {/* Profile Section */}
            <AccordionItem value="profile">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Profile Photo</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Change
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Toggle skeleton loading preview
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSkeleton(!showSkeleton)}
                    >
                      {showSkeleton ? 'Show Fields' : 'Show Skeletons'}
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      {showSkeleton ? (
                        <Skeleton className="h-9 w-full" />
                      ) : (
                        <Input id="firstName" defaultValue="Jane" placeholder="First name" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      {showSkeleton ? (
                        <Skeleton className="h-9 w-full" />
                      ) : (
                        <Input id="lastName" defaultValue="Doe" placeholder="Last name" />
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      {showSkeleton ? (
                        <Skeleton className="h-9 w-full" />
                      ) : (
                        <Input
                          id="email"
                          type="email"
                          defaultValue="jane.doe@example.com"
                          placeholder="Email address"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    {showSkeleton ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Select defaultValue="utc-8">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                          <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                          <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                          <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button>Save Profile</Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notifications Section */}
            <AccordionItem value="notifications">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive text message alerts for critical updates
                        </p>
                      </div>
                      <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Email Digest Frequency</Label>
                      <span className="text-sm text-muted-foreground">
                        Every {digestFrequency[0]} {digestFrequency[0] === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <Slider
                      value={digestFrequency}
                      onValueChange={setDigestFrequency}
                      min={1}
                      max={7}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Daily</span>
                      <span>Weekly</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>Save Preferences</Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Appearance Section */}
            <AccordionItem value="appearance">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" />
                  Appearance
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Font Size</Label>
                      <span className="text-sm text-muted-foreground">{fontSize[0]}px</span>
                    </div>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={12}
                      max={24}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12px</span>
                      <span>18px</span>
                      <span>24px</span>
                    </div>
                    <p
                      className="rounded-md border p-3 text-muted-foreground"
                      style={{ fontSize: `${fontSize[0]}px` }}
                    >
                      This is a preview of your selected font size.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Storage Used</Label>
                      <span className="text-sm text-muted-foreground">2.4 GB of 5 GB</span>
                    </div>
                    <Progress value={48} />
                    <p className="text-xs text-muted-foreground">
                      You have used 48% of your available storage. Upgrade your plan for more space.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button>Save Appearance</Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Danger Zone */}
            <AccordionItem value="danger">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Danger Zone
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Actions in this section are irreversible. Deleting your account will
                      permanently remove all of your data, including files, settings, and history.
                      This cannot be undone.
                    </AlertDescription>
                  </Alert>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all of your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
