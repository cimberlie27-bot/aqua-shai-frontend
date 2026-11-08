import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';

import {
  gridOutline,
  receiptOutline,
  bicycleOutline,
  cubeOutline,
  peopleOutline,
  ticketOutline,
  logOutOutline,
  walletOutline,
  storefrontOutline,
  barChartOutline,
  listOutline,
  waterOutline
} from 'ionicons/icons';

import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminRidersPage from './pages/AdminRidersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminTopupsPage from './pages/AdminTopupsPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminVouchersPage from './pages/AdminVouchersPage';

import { api } from './services/api';
import './AdminStyles.css';

type MenuItem = {
  icon: any;
  label: string;
  path: string;
  badge?: number;
};

const AdminApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingTopups, setPendingTopups] = useState(0);
  const [unverifiedCustomers, setUnverifiedCustomers] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);

  const fetchBadges = async () => {
    try {
      const [ordRes, topupRes, custRes, prodRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/topup-requests'),
        api.get('/admin/customers'),
        api.get('/admin/products')
      ]);

      const orders = Array.isArray(ordRes.data) ? ordRes.data : [];
      const topups = Array.isArray(topupRes.data) ? topupRes.data : [];
      const customers = Array.isArray(custRes.data) ? custRes.data : [];
      const products = Array.isArray(prodRes.data) ? prodRes.data : [];

      setPendingOrders(
        orders.filter((o: any) =>
          ['confirmed', 'ready_to_pickup'].includes(o.order_status)
        ).length
      );

      setPendingTopups(
        topups.filter((t: any) => t.status === 'pending').length
      );

      setUnverifiedCustomers(
        customers.filter((c: any) => !c.is_verified).length
      );

      setLowStockProducts(
        products.filter((p: any) => p.stock_quantity <= 12).length
      );

    } catch (err) {
      console.error('Error fetching admin badges:', err);
    }
  };

  useEffect(() => {
    fetchBadges();

    const interval = setInterval(fetchBadges, 10000);

    const handleRefresh = () => {
      fetchBadges();
    };

    window.addEventListener('refreshBadges', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshBadges', handleRefresh);
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      icon: gridOutline,
      label: 'Dashboard',
      path: '/admin'
    },
    {
      icon: receiptOutline,
      label: 'Orders',
      path: '/admin/orders',
      badge: pendingOrders
    },
    {
      icon: bicycleOutline,
      label: 'Dispatch',
      path: '/admin/dispatch'
    },
    {
      icon: barChartOutline,
      label: 'Reports',
      path: '/admin/reports'
    },
    {
      icon: walletOutline,
      label: 'Top-up requests',
      path: '/admin/topups',
      badge: pendingTopups
    },
    {
      icon: listOutline,
      label: 'Transactions',
      path: '/admin/transactions'
    },
    {
      icon: cubeOutline,
      label: 'Products',
      path: '/admin/products',
      badge: lowStockProducts
    },
    {
      icon: peopleOutline,
      label: 'Customers',
      path: '/admin/customers',
      badge: unverifiedCustomers
    },
    {
      icon: ticketOutline,
      label: 'Vouchers',
      path: '/admin/vouchers'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('vitasip_token');
    localStorage.removeItem('vitasip_user');
    navigate('/login');
  };

  const bg = '#EEF6F4';
  const surface = '#FFFFFF';
  const ink = '#0B1F44';
  const ink2 = '#566A8A';
  const line = '#D8E5E3';
  const pri = '#2B5DB8';

  const font = "'Plus Jakarta Sans', sans-serif";
  const display = "'Baloo 2', sans-serif";

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '248px minmax(0,1fr)',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: bg,
        fontFamily: font,
        color: ink
      }}
    >

      {/* SIDEBAR */}
      <aside
        style={{
          background: surface,
          borderRight: `1px solid ${line}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 14px 16px',
          height: '100vh',
          overflowY: 'auto'
        }}
      >

        {/* LOGO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 8px 14px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '13px',
              background: 'linear-gradient(145deg, #3A72D1, #1B3D84)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              flexShrink: 0
            }}
          >
            <IonIcon
              icon={waterOutline}
              style={{ fontSize: '20px' }}
            />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 800,
                color: ink,
                fontFamily: display,
                lineHeight: 1.1,
                letterSpacing: 0
              }}
            >
              Aqua Shai
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: ink2,
                fontWeight: 600
              }}
            >
              Station Console
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {menuItems.map((item, index) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin' &&
                location.pathname.startsWith(item.path + '/'));

            return (
              <div key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    padding: '12px 8px',
                    fontWeight: 600,
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: font,
                    background: 'transparent'
                  }}
                >
                  <IonIcon
                    icon={item.icon}
                    style={{ fontSize: '18px' }}
                  />

                  <span style={{ flex: 1 }}>
                    {item.label}
                  </span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      style={{
                        background: pri,
                        color: '#fff',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 8px'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {index !== menuItems.length - 1 && (
                  <div
                    style={{
                      height: '1px',
                      background: line,
                      margin: '0 8px'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* STATION INFO */}
        <div
          style={{
            marginTop: 'auto',
            border: `1px solid ${line}`,
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: bg
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: surface,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: `1px solid ${line}`,
                flexShrink: 0
              }}
            >
              <IonIcon
                icon={storefrontOutline}
                style={{
                  color: ink2,
                  fontSize: '18px'
                }}
              />
            </div>

            <div>
              <h4
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 700,
                  color: ink,
                  fontFamily: font
                }}
              >
                Peñaranda Station
              </h4>

              <p
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: ink2,
                  fontFamily: font
                }}
              >
                Station Admin
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="admin-hover-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: ink2,
              fontSize: '12px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '4px 0',
              fontFamily: font
            }}
          >
            <IonIcon icon={logOutOutline} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto',
          background: bg,
          padding: '18px 28px 40px 28px'
        }}
      >
        <Routes>
          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrdersPage />}
          />

          <Route
            path="/admin/dispatch"
            element={<AdminRidersPage />}
          />

          <Route
            path="/admin/reports"
            element={<AdminReportsPage />}
          />

          <Route
            path="/admin/topups"
            element={<AdminTopupsPage />}
          />

          <Route
            path="/admin/transactions"
            element={<AdminTransactionsPage />}
          />

          <Route
            path="/admin/products"
            element={<AdminProductsPage />}
          />

          <Route
            path="/admin/customers"
            element={<AdminCustomersPage />}
          />

          <Route
            path="/admin/vouchers"
            element={<AdminVouchersPage />}
          />

          <Route
            path="/"
            element={<Navigate to="/admin" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/admin" replace />}
          />
        </Routes>
      </main>
    </div>
  );
};

export default AdminApp;