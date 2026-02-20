import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/Home';
import { TokensPage } from '@/pages/Tokens';
import { ThemeCreatorPage } from '@/pages/ThemeCreator';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/theme-creator" element={<ThemeCreatorPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
