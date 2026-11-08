
import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  searchOutline,
  refreshOutline,
  notificationsOutline,
  arrowUpOutline,
  receiptOutline,
  chevronBackOutline,
  listOutline,
  walletOutline,
  cubeOutline,
  chevronForwardOutline,
  closeOutline
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminTransactionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showNotifs, setShowNotifs] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const [ordersRes, topupsRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/topup-requests')
      ]);

      // ORDER PAYMENTS
      const orders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : [];

      const paymentTransactions = orders.map((o: any) => ({
        id: `payment-${o.id}`,
        type: 'payment',
        amount_centavos: -o.total_amount_centavos,
        customer_name: o.customer_name || 'Customer',
        reference: `ORDER-${o.id}`,
        date: o.created_at,
        balance: 1000 - o.total_amount_centavos
      }));

      // APPROVED TOP-UPS ONLY
      const topups = Array.isArray(topupsRes.data)
        ? topupsRes.data
        : [];

      const topupTransactions = topups
        .filter((t: any) => t.status === 'approved')
        .map((t: any) => ({
          id: `topup-${t.id}`,
          type: 'topup',
          amount_centavos: t.amount_centavos,
          customer_name: t.customer_name || 'Customer',
          reference: t.reference_number || `TOPUP-${t.id}`,
          date: t.created_at,
          balance:
            t.balance_after_centavos ??
            t.wallet_balance_after_centavos ??
            null
        }));

      // COMBINE AND SORT NEWEST FIRST
      const combinedTransactions = [
        ...paymentTransactions,
        ...topupTransactions
      ].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(combinedTransactions);

    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [ordersRes, topupsRes, productsRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/topup-requests'),
        api.get('/admin/products')
      ]);

      const orders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : [];

      const topups = Array.isArray(topupsRes.data)
        ? topupsRes.data
        : [];

      const products = Array.isArray(productsRes.data)
        ? productsRes.data
        : [];

      setPendingOrders(
        orders.filter((o: any) =>
          ['pending', 'confirmed'].includes(o.order_status)
        )
      );

      setPendingTopups(
        topups.filter((t: any) => t.status === 'pending')
      );

      setLowStockProducts(
        products.filter((p: any) => p.stock_quantity <= 12)
      );

    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchTransactions();
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const notificationCount =
    pendingOrders.length +
    pendingTopups.length +
    lowStockProducts.length;

  const handleNotificationClick = () => {
    setShowNotifs(!showNotifs);

    if (!showNotifs) {
      fetchNotifications();
    }
  };

  const font = "'Plus Jakarta Sans', sans-serif";
  const display = "'Baloo 2', sans-serif";
  const ink = '#0B1F44';
  const ink2 = '#566A8A';
  const line = '#D8E5E3';
  const pri = '#2B5DB8';
  const priSoft = '#E6EEFA';
  const ok = '#12A06B';
  const okSoft = '#DDF5EA';
  const warn = '#C77700';
  const warnSoft = '#FFF1D6';
  const bad = '#D6384A';

  if (loading) {
    return (
      <div
        style={{
          padding: '50px',
          textAlign: 'center',
          color: ink
        }}
      >
        Loading...
      </div>
    );
  }

  const filteredTx = transactions.filter((t) => {
    const matchSearch =
      (t.customer_name || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (t.reference || '')
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchTab =
      activeTab === 'all' ? true : t.type === activeTab;

    return matchSearch && matchTab;
  });

  const moneyIn =
    transactions
      .filter((t) => t.type === 'topup')
      .reduce((acc, t) => acc + t.amount_centavos, 0) / 100;

  const paidForOrders = Math.abs(
    transactions
      .filter((t) => t.type === 'payment')
      .reduce((acc, t) => acc + t.amount_centavos, 0) / 100
  );

  const refunds =
    transactions
      .filter((t) => t.type === 'refund')
      .reduce((acc, t) => acc + t.amount_centavos, 0) / 100;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: font,
        fontSize: '13px',
        color: ink
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: '16px'
        }}
      >
        <div style={{ flexShrink: 1, minWidth: '200px' }}>
          <h1
            style={{
              margin: '0 0 4px 0',
              fontSize: '23px',
              fontWeight: 800,
              color: ink,
              fontFamily: display
            }}
          >
            Transactions
          </h1>

          <p
            style={{
              margin: 0,
              color: ink2,
              fontSize: '12.5px'
            }}
          >
            Every top-up, payment and refund in customer wallets ·{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          {/* SEARCH */}
          <div
            className="admin-input"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'white',
              border: `1px solid ${line}`,
              borderRadius: '10px',
              padding: '0 12px',
              height: '38px',
              width: '240px'
            }}
          >
            <IonIcon
              icon={searchOutline}
              style={{ color: ink2, fontSize: '17px' }}
            />

            <input
              type="text"
              placeholder="Search customer or ref"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '12.5px',
                color: ink,
                fontFamily: font,
                background: 'transparent'
              }}
            />
          </div>

          {/* REFRESH */}
          <button
            onClick={() => {
              fetchTransactions();
              fetchNotifications();
            }}
            className="admin-hover-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '38px',
              borderRadius: '10px',
              border: 'none',
              background: priSoft,
              cursor: 'pointer',
              fontWeight: 700,
              color: pri,
              fontSize: '12.5px'
            }}
          >
            <IonIcon icon={refreshOutline} /> Refresh
          </button>

          {/* NOTIFICATION */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleNotificationClick}
              className="admin-icon-btn"
              title={`${notificationCount} notifications`}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${line}`,
                background: 'white',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <IonIcon
                icon={notificationsOutline}
                style={{ fontSize: '19px', color: ink2 }}
              />

              {notificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: bad,
                    color: 'white',
                    borderRadius: '999px',
                    fontSize: '9px',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '0 3px'
                  }}
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '300px',
                  background: 'white',
                  border: `1px solid ${line}`,
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 10px 40px rgba(11,31,68,0.15)',
                  zIndex: 100
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px'
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 800,
                        color: ink
                      }}
                    >
                      Notifications
                    </h4>

                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '11px',
                        color: ink2
                      }}
                    >
                      Items that need your attention
                    </p>
                  </div>

                  <button
                    onClick={() => setShowNotifs(false)}
                    style={{
                      width: '27px',
                      height: '27px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#F1F5F9',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <IonIcon
                      icon={closeOutline}
                      style={{ fontSize: '16px', color: ink2 }}
                    />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '9px'
                  }}
                >
                  {/* PENDING ORDERS */}
                  <button
                    onClick={() => {
                      setShowNotifs(false);
                      navigate('/admin/orders');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      padding: '11px',
                      border: `1px solid ${line}`,
                      borderRadius: '12px',
                      background: 'white',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: warnSoft,
                        color: warn,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      <IonIcon
                        icon={receiptOutline}
                        style={{ fontSize: '19px' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 800,
                          color: ink
                        }}
                      >
                        Pending Orders
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: ink2,
                          marginTop: '2px'
                        }}
                      >
                        {pendingOrders.length} orders need attention
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: warn
                      }}
                    >
                      {pendingOrders.length}
                    </span>

                    <IonIcon
                      icon={chevronForwardOutline}
                      style={{ color: ink2 }}
                    />
                  </button>

                  {/* PENDING TOP-UPS */}
                  <button
                    onClick={() => {
                      setShowNotifs(false);
                      navigate('/admin/topups');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      padding: '11px',
                      border: `1px solid ${line}`,
                      borderRadius: '12px',
                      background: 'white',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: priSoft,
                        color: pri,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      <IonIcon
                        icon={walletOutline}
                        style={{ fontSize: '19px' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 800,
                          color: ink
                        }}
                      >
                        Pending Top-ups
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: ink2,
                          marginTop: '2px'
                        }}
                      >
                        {pendingTopups.length} requests waiting for review
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: pri
                      }}
                    >
                      {pendingTopups.length}
                    </span>

                    <IonIcon
                      icon={chevronForwardOutline}
                      style={{ color: ink2 }}
                    />
                  </button>

                  {/* LOW STOCK */}
                  <button
                    onClick={() => {
                      setShowNotifs(false);
                      navigate('/admin/products');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      padding: '11px',
                      border: `1px solid ${line}`,
                      borderRadius: '12px',
                      background: 'white',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: warnSoft,
                        color: warn,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      <IonIcon
                        icon={cubeOutline}
                        style={{ fontSize: '19px' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 800,
                          color: ink
                        }}
                      >
                        Low Stock Products
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: ink2,
                          marginTop: '2px'
                        }}
                      >
                        {lowStockProducts.length} products with 12 or fewer stocks
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: warn
                      }}
                    >
                      {lowStockProducts.length}
                    </span>

                    <IonIcon
                      icon={chevronForwardOutline}
                      style={{ color: ink2 }}
                    />
                  </button>
                </div>

                {notificationCount === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '12px 5px 2px',
                      fontSize: '11.5px',
                      color: ink2
                    }}
                  >
                    No pending notifications.
                  </div>
                )}

                <button
                  onClick={fetchNotifications}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '9px',
                    border: 'none',
                    borderRadius: '9px',
                    background: priSoft,
                    color: pri,
                    fontSize: '11.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <IonIcon
                    icon={refreshOutline}
                    style={{
                      marginRight: '5px',
                      verticalAlign: 'middle'
                    }}
                  />
                  Refresh notifications
                </button>
              </div>
            )}
          </div>

          {/* ADMIN PROFILE */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: priSoft,
              color: pri,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '12px'
            }}
          >
            SA
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}
      >
        <div
          className="admin-card"
          style={{
            background: 'white',
            borderRadius: '16px',
            border: `1px solid ${line}`,
            padding: '18px',
            boxShadow: '0 1px 2px rgba(11,31,68,.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: ink2,
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            <IonIcon icon={arrowUpOutline} /> Money in (top-ups)
          </div>

          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: ok,
              letterSpacing: '-0.025em',
              marginBottom: '4px'
            }}
          >
            ₱{moneyIn.toFixed(2)}
          </div>

          <div style={{ fontSize: '11.5px', color: ink2 }}>
            {transactions.filter((t) => t.type === 'topup').length} top-ups
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            background: 'white',
            borderRadius: '16px',
            border: `1px solid ${line}`,
            padding: '18px',
            boxShadow: '0 1px 2px rgba(11,31,68,.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: ink2,
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            <IonIcon icon={receiptOutline} /> Paid for orders
          </div>

          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: ink,
              letterSpacing: '-0.025em',
              marginBottom: '4px'
            }}
          >
            ₱{paidForOrders.toFixed(2)}
          </div>

          <div style={{ fontSize: '11.5px', color: ink2 }}>
            {transactions.filter((t) => t.type === 'payment').length} payments
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            background: 'white',
            borderRadius: '16px',
            border: `1px solid ${line}`,
            padding: '18px',
            boxShadow: '0 1px 2px rgba(11,31,68,.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: ink2,
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            <IonIcon icon={chevronBackOutline} /> Refunds
          </div>

          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: ink,
              letterSpacing: '-0.025em',
              marginBottom: '4px'
            }}
          >
            ₱{refunds.toFixed(2)}
          </div>

          <div style={{ fontSize: '11.5px', color: ink2 }}>
            {transactions.filter((t) => t.type === 'refund').length} refunds
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            background: 'white',
            borderRadius: '16px',
            border: `1px solid ${line}`,
            padding: '18px',
            boxShadow: '0 1px 2px rgba(11,31,68,.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: ink2,
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            <IonIcon icon={listOutline} /> All transactions
          </div>

          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: ink,
              letterSpacing: '-0.025em',
              marginBottom: '4px'
            }}
          >
            {transactions.length}
          </div>

          <div style={{ fontSize: '11.5px', color: ink2 }}>
            Newest first
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div
          style={{
            display: 'flex',
            background: 'white',
            border: `1px solid ${line}`,
            borderRadius: '12px',
            padding: '4px',
            gap: '4px'
          }}
        >
          {['all', 'topup', 'payment', 'refund'].map((tab) => {
            const count =
              tab === 'all'
                ? transactions.length
                : transactions.filter((t) => t.type === tab).length;

            const isActive = activeTab === tab;

            const label =
              tab === 'topup'
                ? 'Top-ups'
                : tab === 'payment'
                ? 'Payments'
                : tab === 'refund'
                ? 'Refunds'
                : 'All';

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="admin-hover-btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? ink : ink2,
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: isActive
                    ? '0 1px 3px rgba(0,0,0,0.1)'
                    : 'none'
                }}
              >
                {label}

                <span
                  style={{
                    background: isActive
                      ? tab === 'all'
                        ? pri
                        : line
                      : 'transparent',
                    color: isActive
                      ? tab === 'all'
                        ? 'white'
                        : ink2
                      : ink2,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    marginLeft: '6px'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '12.5px', color: ink2 }}>
          Read-only record. Wallet changes happen through top-up approval and orders.
        </div>
      </div>

      {/* TABLE */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          border: `1px solid ${line}`,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(11,31,68,.05)',
          padding: '0 18px'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${line}` }}>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>
                WHEN
              </th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>
                CUSTOMER
              </th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>
                TYPE
              </th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>
                REFERENCE
              </th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>
                AMOUNT
              </th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>
                BALANCE AFTER
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTx.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: ink2
                  }}
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTx.map((t) => (
                <tr
                  key={t.id}
                  className="admin-table-row"
                  style={{ borderBottom: `1px solid ${line}` }}
                >
                  <td
                    style={{
                      padding: '14px 8px',
                      fontSize: '12.5px',
                      color: ink
                    }}
                  >
                    {new Date(t.date).toLocaleString()}
                  </td>

                  <td style={{ padding: '14px 8px' }}>
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
                          borderRadius: '50%',
                          background: priSoft,
                          color: pri,
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                          fontSize: '12px'
                        }}
                      >
                        {t.customer_name?.charAt(0) || 'C'}
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '13.5px',
                          color: ink
                        }}
                      >
                        {t.customer_name}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 8px' }}>
                    <span
                      style={{
                        background:
                          t.type === 'payment'
                            ? priSoft
                            : t.type === 'topup'
                            ? okSoft
                            : warnSoft,
                        color:
                          t.type === 'payment'
                            ? pri
                            : t.type === 'topup'
                            ? ok
                            : warn,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'capitalize'
                      }}
                    >
                      {t.type === 'payment'
                        ? 'Order payment'
                        : t.type === 'topup'
                        ? 'Top-up'
                        : 'Refund'}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: '14px 8px',
                      fontSize: '12.5px',
                      color: ink2,
                      fontFamily: 'monospace'
                    }}
                  >
                    {t.reference}
                  </td>

                  <td
                    style={{
                      padding: '14px 8px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: t.amount_centavos > 0 ? ok : ink
                    }}
                  >
                    {t.amount_centavos > 0 ? '+' : ''}
                    {(t.amount_centavos / 100).toFixed(2)}
                  </td>

                  <td
                    style={{
                      padding: '14px 8px',
                      fontSize: '12.5px',
                      color: ink2
                    }}
                  >
                    {t.balance !== null && t.balance !== undefined
                      ? `₱${(t.balance / 100).toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
