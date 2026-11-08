
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Route } from 'react-router-dom';
import {
  homeOutline,
  waterOutline,
  cartOutline,
  walletOutline,
  documentsOutline
} from 'ionicons/icons';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import WalletPage from './pages/WalletPage';
import OrdersPage from './pages/OrdersPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ProfilePage from './pages/ProfilePage';
import TopUpPage from './pages/TopUpPage';

const CustomerApp: React.FC = () => {

  // Empty cart by default
  const cartCount = 0;

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/home" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<OrderSuccessPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/topup" element={<TopUpPage />} />
      </IonRouterOutlet>

      <IonTabBar
        slot="bottom"
        style={{
          '--background': 'white',
          borderTop: '1px solid #D8E5E3'
        } as any}
      >

        {/* HOME */}
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>

        {/* ORDER */}
        <IonTabButton tab="shop" href="/shop">
          <IonIcon icon={waterOutline} />
          <IonLabel>Order</IonLabel>
        </IonTabButton>

        {/* CART */}
        <IonTabButton tab="cart" href="/cart">
          <IonIcon icon={cartOutline} />

          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '16px',
              background: '#DC2626',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}

          <IonLabel>Cart</IonLabel>
        </IonTabButton>

        {/* WALLET */}
        <IonTabButton tab="wallet" href="/wallet">
          <IonIcon icon={walletOutline} />
          <IonLabel>Wallet</IonLabel>
        </IonTabButton>

        {/* ORDERS */}
        <IonTabButton tab="orders" href="/orders">
          <IonIcon icon={documentsOutline} />
          <IonLabel>Orders</IonLabel>
        </IonTabButton>

      </IonTabBar>
    </IonTabs>
  );
};

export default CustomerApp;
