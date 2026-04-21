import * as React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { ArrowUpIcon, Circle, MinusIcon, PlusIcon, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@coston/ui/avatar';
import { Button } from '@coston/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@coston/ui/card';
import { Checkbox } from '@coston/ui/checkbox';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@coston/ui/chart';
import { Input } from '@coston/ui/input';
import { Label } from '@coston/ui/label';
import { RadioGroup, RadioGroupItem } from '@coston/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@coston/ui/select';
import { Separator } from '@coston/ui/separator';
import { Switch } from '@coston/ui/switch';
import { Textarea } from '@coston/ui/textarea';

// --- Stats Card ---
const revenueData = [
  { revenue: 10400, subscription: 40 },
  { revenue: 14405, subscription: 90 },
  { revenue: 9400, subscription: 200 },
  { revenue: 8200, subscription: 278 },
  { revenue: 7000, subscription: 89 },
  { revenue: 9600, subscription: 239 },
  { revenue: 11244, subscription: 78 },
  { revenue: 26475, subscription: 89 },
];
const statsConfig = {
  revenue: { label: 'Revenue', color: 'var(--primary)' },
  subscription: { label: 'Subscriptions', color: 'var(--primary)' },
} satisfies ChartConfig;

function CardsStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-3xl">$15,231.89</CardTitle>
          <CardDescription>+20.1% from last month</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer config={statsConfig} className="h-[90px] w-full">
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="revenue"
                stroke="var(--color-revenue)"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="relative flex flex-col overflow-hidden pb-0">
        <CardHeader>
          <CardDescription>Subscriptions</CardDescription>
          <CardTitle className="text-3xl">+2,350</CardTitle>
          <CardDescription>+180.1% from last month</CardDescription>
        </CardHeader>
        <CardContent className="relative mt-auto flex-1 p-0">
          <ChartContainer config={statsConfig} className="relative h-[90px] w-full">
            <AreaChart data={revenueData} margin={{ left: 0, right: 0 }}>
              <Area
                dataKey="subscription"
                fill="var(--color-subscription)"
                fillOpacity={0.05}
                stroke="var(--color-subscription)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Create Account ---
function CardsCreateAccount() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your email below to create your account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-6">
          <Button variant="outline">GitHub</Button>
          <Button variant="outline">Google</Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="email-create">Email</Label>
          <Input id="email-create" type="email" placeholder="m@example.com" />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="password-create">Password</Label>
          <Input id="password-create" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create account</Button>
      </CardFooter>
    </Card>
  );
}

// --- Chat ---
function CardsChat() {
  const [messages, setMessages] = React.useState([
    { role: 'agent', content: 'Hi, how can I help you today?' },
    { role: 'user', content: "Hey, I'm having trouble with my account." },
    { role: 'agent', content: 'What seems to be the problem?' },
    { role: 'user', content: "I can't log in." },
  ]);
  const [input, setInput] = React.useState('');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="flex items-center gap-4">
          <Avatar className="border">
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium leading-none">Sofia Davis</p>
            <p className="text-xs text-muted-foreground">m@example.com</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              {message.content}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!input.trim()) return;
            setMessages([...messages, { role: 'user', content: input }]);
            setInput('');
          }}
          className="relative w-full"
        >
          <Input
            placeholder="Type your message..."
            className="pr-10"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 size-6 -translate-y-1/2 rounded-full"
            disabled={!input.trim()}
          >
            <ArrowUpIcon className="size-3.5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

// --- Cookie Settings ---
function CardsCookieSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cookie Settings</CardTitle>
        <CardDescription>Manage your cookie settings here.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="necessary" className="flex flex-col items-start">
            <span>Strictly Necessary</span>
            <span className="font-normal leading-snug text-muted-foreground">
              These cookies are essential in order to use the website.
            </span>
          </Label>
          <Switch id="necessary" defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="functional" className="flex flex-col items-start">
            <span>Functional Cookies</span>
            <span className="font-normal leading-snug text-muted-foreground">
              These cookies allow personalized functionality.
            </span>
          </Label>
          <Switch id="functional" />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Save preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Report Issue ---
function CardsReportIssue() {
  const id = React.useId();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an issue</CardTitle>
        <CardDescription>What area are you having problems with?</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor={`area-${id}`}>Area</Label>
            <Select defaultValue="billing">
              <SelectTrigger id={`area-${id}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor={`severity-${id}`}>Severity</Label>
            <Select defaultValue="2">
              <SelectTrigger id={`severity-${id}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Severity 1 (Highest)</SelectItem>
                <SelectItem value="2">Severity 2</SelectItem>
                <SelectItem value="3">Severity 3</SelectItem>
                <SelectItem value="4">Severity 4 (Lowest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor={`subject-${id}`}>Subject</Label>
          <Input id={`subject-${id}`} placeholder="I need help with..." />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor={`desc-${id}`}>Description</Label>
          <Textarea
            id={`desc-${id}`}
            placeholder="Please include all relevant information."
            className="min-h-28"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button size="sm">Submit</Button>
      </CardFooter>
    </Card>
  );
}

// --- Share ---
const people = [
  { name: 'Olivia Martin', email: 'm@example.com' },
  { name: 'Isabella Nguyen', email: 'b@example.com' },
  { name: 'Sofia Davis', email: 'p@example.com' },
];

function CardsShare() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Share this document</CardTitle>
        <CardDescription>Anyone with the link can view this document.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Input value="http://example.com/link/to/document" className="h-8" readOnly />
          <Button size="sm" variant="outline" className="shadow-none">
            Copy Link
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col gap-4">
          <div className="text-sm font-medium">People with access</div>
          <div className="grid gap-6">
            {people.map(person => (
              <div key={person.email} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{person.name}</p>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                  </div>
                </div>
                <Select defaultValue="edit">
                  <SelectTrigger className="ml-auto pr-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="view">Can view</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- GitHub Card ---
function GithubCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle>design-tokens</CardTitle>
            <CardDescription>
              Semantic design tokens built with OKLCH colors. Accessible. Customizable. Open Source.
            </CardDescription>
          </div>
          <Button variant="secondary" className="flex items-center gap-2 px-3 shadow-none">
            <Star /> Star
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Circle className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" /> TypeScript
          </div>
          <div className="flex items-center">
            <Star className="mr-1 h-3 w-3" /> 1.2k
          </div>
          <div>Updated April 2025</div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Activity Goal ---
const goalData = [
  { goal: 400 },
  { goal: 300 },
  { goal: 200 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 239 },
  { goal: 300 },
  { goal: 200 },
  { goal: 278 },
  { goal: 189 },
  { goal: 349 },
];
const goalConfig = { goal: { label: 'Goal', color: 'var(--primary)' } } satisfies ChartConfig;

function CardsActivityGoal() {
  const [goal, setGoal] = React.useState(350);
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Move Goal</CardTitle>
        <CardDescription>Set your daily activity goal.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-full"
            onClick={() => setGoal(Math.max(200, goal - 10))}
            disabled={goal <= 200}
          >
            <MinusIcon />
          </Button>
          <div className="text-center">
            <div className="text-4xl font-bold tabular-nums tracking-tighter">{goal}</div>
            <div className="text-xs uppercase text-muted-foreground">Calories/day</div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-full"
            onClick={() => setGoal(Math.min(400, goal + 10))}
            disabled={goal >= 400}
          >
            <PlusIcon />
          </Button>
        </div>
        <ChartContainer config={goalConfig} className="max-h-20 w-full">
          <BarChart data={goalData}>
            <Bar dataKey="goal" radius={4} fill="var(--color-goal)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="secondary">
          Set Goal
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Exercise Minutes ---
const exerciseData = [
  { average: 400, today: 240, day: 'Monday' },
  { average: 300, today: 139, day: 'Tuesday' },
  { average: 200, today: 980, day: 'Wednesday' },
  { average: 278, today: 390, day: 'Thursday' },
  { average: 189, today: 480, day: 'Friday' },
  { average: 239, today: 380, day: 'Saturday' },
  { average: 349, today: 430, day: 'Sunday' },
];
const exerciseConfig = {
  today: { label: 'Today', color: 'var(--primary)' },
  average: { label: 'Average', color: 'var(--primary)' },
} satisfies ChartConfig;

function CardsExerciseMinutes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Minutes</CardTitle>
        <CardDescription>
          Your exercise minutes are ahead of where you normally are.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={exerciseConfig} className="h-[200px] w-full">
          <LineChart data={exerciseData} margin={{ top: 5, right: 10, left: 16, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={v => v.slice(0, 3)}
            />
            <Line
              type="monotone"
              dataKey="today"
              strokeWidth={2}
              stroke="var(--color-today)"
              dot={{ fill: 'var(--color-today)' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="average"
              stroke="var(--color-average)"
              strokeOpacity={0.5}
              dot={{ fill: 'var(--color-average)', opacity: 0.5 }}
              activeDot={{ r: 5 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// --- Forms ---
const plans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'Perfect for small businesses.',
    price: '$10',
  },
  { id: 'pro', name: 'Pro Plan', description: 'More features and storage.', price: '$20' },
];

function CardsForms() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upgrade your subscription</CardTitle>
        <CardDescription>
          You are currently on the free plan. Upgrade to get all features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="form-name">Name</Label>
              <Input id="form-name" placeholder="Evil Rabbit" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="form-email">Email</Label>
              <Input id="form-email" placeholder="example@acme.com" />
            </div>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">Plan</legend>
            <RadioGroup defaultValue="starter" className="grid gap-3 sm:grid-cols-2">
              {plans.map(plan => (
                <Label
                  className="has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-primary/5 flex items-start gap-3 rounded-lg border p-3"
                  key={plan.id}
                >
                  <RadioGroupItem value={plan.id} className="data-[state=checked]:border-primary" />
                  <div className="grid gap-1 font-normal">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-xs leading-snug text-muted-foreground">
                      {plan.description}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-notes">Notes</Label>
            <Textarea id="form-notes" placeholder="Enter notes" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="font-normal">
                I agree to the terms and conditions
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="newsletter" defaultChecked />
              <Label htmlFor="newsletter" className="font-normal">
                Allow us to send you emails
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Upgrade Plan</Button>
      </CardFooter>
    </Card>
  );
}

// --- Main Cards Page ---
export function CardsPage() {
  return (
    <div className="grid gap-4 p-4 lg:p-6 xl:grid-cols-2">
      <div className="flex flex-col gap-4">
        <CardsStats />
        <CardsCreateAccount />
        <CardsCookieSettings />
        <CardsChat />
        <GithubCard />
      </div>
      <div className="flex flex-col gap-4">
        <CardsActivityGoal />
        <CardsExerciseMinutes />
        <CardsReportIssue />
        <CardsForms />
        <CardsShare />
      </div>
    </div>
  );
}
