import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        ...defaultClassNames,
        root: cn(defaultClassNames.root, className),
        months: cn(defaultClassNames.months, 'relative'),
        month: cn(defaultClassNames.month, 'space-y-4'),
        month_caption: cn(
          defaultClassNames.month_caption,
          'flex justify-center pt-1 relative items-center mb-2 h-7'
        ),
        caption_label: cn(defaultClassNames.caption_label, 'text-sm font-medium'),
        nav: cn(
          defaultClassNames.nav,
          'absolute inset-x-1 top-0 flex items-center justify-between h-7'
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent opacity-50 hover:opacity-100'
        ),
        button_next: cn(
          defaultClassNames.button_next,
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent opacity-50 hover:opacity-100'
        ),
        month_grid: cn(defaultClassNames.month_grid, 'w-full border-collapse'),
        weekdays: cn(defaultClassNames.weekdays, 'flex'),
        weekday: cn(
          defaultClassNames.weekday,
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center'
        ),
        week: cn(defaultClassNames.week, 'flex w-full mt-2'),
        day: cn(defaultClassNames.day, 'h-9 w-9 text-center text-sm p-0 relative'),
        day_button: cn(
          defaultClassNames.day_button,
          'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-normal hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        ),
        selected: cn(
          defaultClassNames.selected,
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-md'
        ),
        today: cn(defaultClassNames.today, 'bg-accent text-accent-foreground rounded-md'),
        outside: cn(defaultClassNames.outside, 'text-muted-foreground opacity-50'),
        disabled: cn(defaultClassNames.disabled, 'text-muted-foreground opacity-50'),
        hidden: cn(defaultClassNames.hidden, 'invisible'),
        range_start: cn(defaultClassNames.range_start, 'rounded-l-md'),
        range_end: cn(defaultClassNames.range_end, 'rounded-r-md'),
        range_middle: cn(defaultClassNames.range_middle, 'bg-accent text-accent-foreground'),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
