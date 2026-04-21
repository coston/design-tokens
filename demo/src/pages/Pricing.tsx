import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@coston/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@coston/ui/card';
import { Separator } from '@coston/ui/separator';
import { Switch } from '@coston/ui/switch';

const plans = [
  {
    id: 'plus',
    name: 'Plus',
    description: 'For personal use',
    monthlyPrice: '$19',
    yearlyPrice: '$15',
    features: [
      { text: 'Up to 5 team members' },
      { text: 'Basic components library' },
      { text: 'Community support' },
      { text: '1GB storage space' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    monthlyPrice: '$49',
    yearlyPrice: '$35',
    features: [
      { text: 'Unlimited team members' },
      { text: 'Advanced components' },
      { text: 'Priority support' },
      { text: 'Unlimited storage' },
    ],
  },
];

export function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="flex flex-1 flex-col items-center py-16 px-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight lg:text-5xl">Pricing</h2>
          <p className="text-muted-foreground lg:text-xl">Check out our affordable pricing plans</p>
          <div className="flex items-center gap-3 text-lg">
            Monthly
            <Switch checked={isYearly} onCheckedChange={() => setIsYearly(!isYearly)} />
            Yearly
          </div>
        </div>

        <div className="flex max-w-3xl flex-col items-stretch gap-6 lg:flex-row">
          {plans.map(plan => (
            <Card key={plan.id} className="flex w-80 flex-col justify-between text-left">
              <CardHeader>
                <CardTitle>
                  <p>{plan.name}</p>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <span className="text-4xl font-bold">
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <p className="text-muted-foreground">
                  Billed{' '}
                  {isYearly
                    ? `$${Number(plan.yearlyPrice.slice(1)) * 12}`
                    : `$${Number(plan.monthlyPrice.slice(1)) * 12}`}{' '}
                  annually
                </p>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                {plan.id === 'pro' && (
                  <p className="mb-3 font-semibold">Everything in Plus, and:</p>
                )}
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button className="w-full">
                  Purchase
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
