import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#14151A',
            color: '#FAF9F6',
            fontSize: '14px',
            borderRadius: '9999px',
            padding: '10px 20px',
          },
          success: { iconTheme: { primary: '#7A8B6F', secondary: '#FAF9F6' } },
          error: { iconTheme: { primary: '#C4622D', secondary: '#FAF9F6' } },
        }}
      />
    </div>
  );
};

export default MainLayout;
