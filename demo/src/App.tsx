import { Routes, Route } from 'react-router-dom';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SiteHeader } from '@/components/dashboard/site-header';
import { SidebarInset, SidebarProvider } from '@coston/ui/sidebar';
import { Toaster } from '@coston/ui/sonner';
import { DashboardPage } from '@/pages/Dashboard';
import { CardsPage } from '@/pages/Cards';
import { PricingPage } from '@/pages/Pricing';
import { TypographyPage } from '@/pages/Typography';
import { ColorsPage } from '@/pages/Colors';
import { MailPage } from '@/pages/Mail';
import { SettingsPage } from '@/pages/Settings';
import { FilesPage } from '@/pages/Files';
import { NotificationsPage } from '@/pages/Notifications';
import { GalleryPage } from '@/pages/Gallery';

function App() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/mail" element={<MailPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/typography" element={<TypographyPage />} />
            <Route path="/colors" element={<ColorsPage />} />
          </Routes>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
