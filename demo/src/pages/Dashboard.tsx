import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { DataTable } from '@/components/dashboard/data-table';
import { SectionCards } from '@/components/dashboard/section-cards';
import { ChartBarMixed } from '@/components/dashboard/chart-bar-mixed';
import { ChartPieDonut } from '@/components/dashboard/chart-pie-donut';

import data from '@/components/dashboard/data.json';

export function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
          <ChartPieDonut />
          <ChartBarMixed />
        </div>
      </div>
    </div>
  );
}
