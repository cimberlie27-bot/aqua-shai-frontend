import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Navigate, useLocation } from 'react-router-dom';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import RiderRegisterPage from './pages/RiderRegisterPage'; // ✅ Import natin ito
import CustomerApp from './CustomerApp';
import AdminApp from './AdminApp';
import RiderApp from './RiderApp';

import { CartProvider } from './context/CartContext';

setupIonicReact();

const App: React.FC = () => {
  const storedUser = localStorage.getItem('vitasip_user');
  const user = storedUser ? JSON.parse(storedUser) : {};
  
  const isAdmin = user && user.role === 'admin';
  const isRider = user && user.role === 'rider';
  const isVerified = user && user.is_verified;
  const isLoggedIn = !!localStorage.getItem('vitasip_token');
  
  const location = useLocation();

  // 1. KUNG NASA PUBLIC PAGES, WALANG DASHBOARD
  if (
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/rider-register' || // ✅ IDINAGDAG
    location.pathname === '/pending-approval'
  ) {
    return (
      <IonRouterOutlet>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rider-register" element={<RiderRegisterPage />} /> {/* ✅ IDINAGDAG */}
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </IonRouterOutlet>
    );
  }

  // 2. KUNG HINDI NAKA-LOGIN, I-REDIRECT SA LOGIN
  if (!isLoggedIn) {
    return (
      <IonRouterOutlet>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rider-register" element={<RiderRegisterPage />} /> {/* ✅ IDINAGDAG */}
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </IonRouterOutlet>
    );
  }

  // 3. KUNG NAKA-LOGIN PERO HINDI VERIFIED (Rider na pending)
  if (isRider && !isVerified && location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  // 4. KUNG ADMIN
  if (isAdmin) {
    return <AdminApp />;
  }

  // 5. KUNG RIDER (Verified na)
  if (isRider) {
    return <RiderApp />;
  }

  // 6. KUNG CUSTOMER
  return <CustomerApp />;
};

const RootApp: React.FC = () => (
  <IonApp>
    <CartProvider>
      <IonReactRouter>
        <AppRouting />
      </IonReactRouter>
    </CartProvider>
  </IonApp>
);

const AppRouting = () => {
  return <App />;
};

export default RootApp;