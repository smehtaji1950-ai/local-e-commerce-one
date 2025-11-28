import React from 'react';
import { AppProvider, useApp } from './store/context';
import { UserRole } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthView from './views/AuthView';
import CustomerView from './views/CustomerView';
import ShopkeeperView from './views/ShopkeeperView';
import RiderView from './views/RiderView';
import AdminView from './views/AdminView';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {currentUser.role === UserRole.CUSTOMER && <CustomerView />}
        {currentUser.role === UserRole.SHOPKEEPER && <ShopkeeperView />}
        {currentUser.role === UserRole.RIDER && <RiderView />}
        {currentUser.role === UserRole.ADMIN && <AdminView />}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
