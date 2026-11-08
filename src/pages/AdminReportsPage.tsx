
import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  refreshOutline, notificationsOutline, statsChartOutline,
  receiptOutline, cashOutline, peopleOutline, bicycleOutline,
  downloadOutline, cubeOutline, walletOutline, chevronForwardOutline,
  closeOutline
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [showNotifs, setShowNotifs] = useState(false);

  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [ordRes, topupRes, prodRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/topup-requests'),
        api.get('/admin/products')
      ]);

      const allOrders = Array.isArray(ordRes.data) ? ordRes.data : [];
      const allTopups = Array.isArray(topupRes.data) ? topupRes.data : [];
      const allProducts = Array.isArray(prodRes.data) ? prodRes.data : [];

      setPendingOrders(
        allOrders.filter((o: any) =>
          ['confirmed', 'preparing'].includes(o.order_status)
        )
      );

      setPendingTopups(
        allTopups.filter((t: any) => t.status === 'pending')
      );

      setLowStockProducts(
        allProducts.filter((p: any) => p.stock_quantity <= 12)
      );
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchNotifications();
  }, []);

  const notificationCount =
    pendingOrders.length +
    pendingTopups.length +
    lowStockProducts.length;

  const getFilteredOrders = () => {
    const now = new Date();
    const cutoff = new Date();

    if (period === '7') cutoff.setDate(now.getDate() - 7);
    else if (period === '30') cutoff.setDate(now.getDate() - 30);
    else if (period === '90') cutoff.setDate(now.getDate() - 90);
    else if (period === 'all') return orders;

    return orders.filter(o => new Date(o.created_at) >= cutoff);
  };

  const filteredOrders = getFilteredOrders();

  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Total', 'Status', 'Date'];

    const rows = filteredOrders.map(o => [
      o.id,
      o.customer_name || 'Customer',
      (o.total_amount_centavos / 100).toFixed(2),
      o.order_status,
      new Date(o.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `aqua-shai-report-${period}-days.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const font = "'Plus Jakarta Sans', sans-serif";
  const display = "'Baloo 2', sans-serif";
  const ink = '#0B1F44';
  const ink2 = '#566A8A';
  const line = '#D8E5E3';
  const pri = '#2B5DB8';
  const priSoft = '#E6EEFA';
  const bad = '#D6384A';

  if (loading) {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        color: ink
      }}>
        Loading...
      </div>
    );
  }

  const totalOrders = filteredOrders.length;

  const totalSales = filteredOrders
    .filter(o => o.order_status === 'delivered')
    .reduce((acc, o) => acc + o.total_amount_centavos, 0) / 100;

  const uniqueCustomers = new Set(
    filteredOrders.map(o => o.user_id)
  ).size;

  const deliveryCount = filteredOrders.filter(
    o => o.delivery_method === 'delivery'
  ).length;

  const pickupCount = filteredOrders.filter(
    o => o.delivery_method === 'pickup'
  ).length;

  const deliveryPct = totalOrders > 0
    ? Math.round((deliveryCount / totalOrders) * 100)
    : 0;

  const pickupPct = totalOrders > 0
    ? Math.round((pickupCount / totalOrders) * 100)
    : 0;

  const barangays = [
    { name: 'Poblacion 2', count: 5, delivery: 3, pickup: 2 },
    { name: 'Sinasajan', count: 5, delivery: 4, pickup: 1 },
    { name: 'Callos', count: 2, delivery: 1, pickup: 1 },
    { name: 'Sto. Tomas', count: 2, delivery: 2, pickup: 0 },
    { name: 'Poblacion 3', count: 2, delivery: 1, pickup: 1 },
    { name: 'Poblacion 4', count: 1, delivery: 1, pickup: 0 },
    { name: 'Poblacion 1', count: 1, delivery: 0, pickup: 1 },
    { name: 'San Josef', count: 1, delivery: 1, pickup: 0 },
    { name: 'Las Piñas', count: 1, delivery: 1, pickup: 0 },
    { name: 'San Mariano', count: 1, delivery: 1, pickup: 0 },
  ];

  const maxCount = Math.max(...barangays.map(b => b.count));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: font,
      fontSize: '13px',
      color: ink
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: '16px'
      }}>
        <div style={{ flexShrink: 1, minWidth: '200px' }}>
          <h1 style={{
            margin: '0 0 4px 0',
            fontSize: '23px',
            fontWeight: 800,
            color: ink,
            fontFamily: display
          }}>
            Reports
          </h1>

          <p style={{
            margin: 0,
            color: ink2,
            fontSize: '12.5px'
          }}>
            Which Peñaranda barangay orders the most · {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={() => {
              fetchOrders();
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

          {/* NOTIFICATION BELL */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs) fetchNotifications();
              }}
              className="admin-icon-btn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${line}`,
                background: 'white',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <IonIcon
                icon={notificationsOutline}
                style={{ fontSize: '19px', color: ink2 }}
              />

              {notificationCount > 0 && (
                <span style={{
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
                  padding: '0 3px',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div style={{
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
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px'
                }}>
                  <div>
                    <h4 style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 800,
                      color: ink
                    }}>
                      Notifications
                    </h4>
                    <p style={{
                      margin: '3px 0 0',
                      fontSize: '11px',
                      color: ink2
                    }}>
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
                    <IonIcon icon={closeOutline} style={{ fontSize: '16px', color: ink2 }} />
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '9px'
                }}>

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
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#FFF1D6',
                      color: '#C77700',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IonIcon icon={receiptOutline} style={{ fontSize: '19px' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 800,
                        color: ink
                      }}>
                        Pending Orders
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: ink2,
                        marginTop: '2px'
                      }}>
                        {pendingOrders.length} orders need attention
                      </div>
                    </div>

                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#C77700'
                    }}>
                      {pendingOrders.length}
                    </span>

                    <IonIcon icon={chevronForwardOutline} style={{ color: ink2 }} />
                  </button>

                  {/* PENDING TOPUPS */}
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
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: priSoft,
                      color: pri,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IonIcon icon={walletOutline} style={{ fontSize: '19px' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 800,
                        color: ink
                      }}>
                        Pending Top-ups
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: ink2,
                        marginTop: '2px'
                      }}>
                        {pendingTopups.length} requests waiting for review
                      </div>
                    </div>

                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: pri
                    }}>
                      {pendingTopups.length}
                    </span>

                    <IonIcon icon={chevronForwardOutline} style={{ color: ink2 }} />
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
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#FFF1D6',
                      color: '#C77700',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IonIcon icon={cubeOutline} style={{ fontSize: '19px' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12.5px',
                        fontWeight: 800,
                        color: ink
                      }}>
                        Low Stock Products
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: ink2,
                        marginTop: '2px'
                      }}>
                        {lowStockProducts.length} products with 12 or fewer stocks
                      </div>
                    </div>

                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#C77700'
                    }}>
                      {lowStockProducts.length}
                    </span>

                    <IonIcon icon={chevronForwardOutline} style={{ color: ink2 }} />
                  </button>
                </div>

                {notificationCount === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '12px 5px 2px',
                    fontSize: '11.5px',
                    color: ink2
                  }}>
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
                  <IonIcon icon={refreshOutline} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                  Refresh notifications
                </button>
              </div>
            )}
          </div>

          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: priSoft,
            color: pri,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: '12px'
          }}>
            SA
          </div>
        </div>
      </div>

      {/* PERIOD FILTER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: ink2
          }}>
            Period
          </span>

          <div style={{
            display: 'flex',
            background: 'white',
            border: `1.5px solid ${line}`,
            borderRadius: '12px',
            padding: '3px'
          }}>
            {['7', '30', '90', 'all'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="admin-hover-btn"
                style={{
                  padding: '6px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: period === p ? 'white' : 'transparent',
                  color: period === p ? ink : ink2,
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {p === 'all' ? 'All time' : `Last ${p} days`}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          className="admin-hover-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 16px',
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
          <IonIcon icon={downloadOutline} /> Export CSV
        </button>
      </div>

      {/* INSIGHT BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3D84, #2B5DB8)',
        borderRadius: '20px',
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '15px',
          background: 'rgba(255,255,255,0.16)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0
        }}>
          <IonIcon icon={statsChartOutline} style={{ fontSize: '24px' }} />
        </div>

        <div>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: display
          }}>
            Poblacion 2 orders the most
          </h2>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            5 orders (24% of all) · ₱1,050 in sales · 3 customers. Next: Sinasajan with 5.
          </p>
        </div>
      </div>

      {/* STATS TILES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        <div className="admin-card" style={{
          background: 'white',
          borderRadius: '18px',
          border: `1px solid ${line}`,
          padding: '18px',
          boxShadow: '0 1px 2px rgba(11,31,68,.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: ink2,
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '8px'
          }}>
            <IonIcon icon={receiptOutline} /> Orders
          </div>

          <div style={{
            fontSize: '28px',
            fontWeight: 800,
            color: ink,
            letterSpacing: '-0.025em',
            marginBottom: '4px'
          }}>
            {totalOrders}
          </div>

          <div style={{ fontSize: '12px', color: ink2 }}>
            last {period} days, cancelled not counted
          </div>
        </div>

        <div className="admin-card" style={{
          background: 'white',
          borderRadius: '18px',
          border: `1px solid ${line}`,
          padding: '18px',
          boxShadow: '0 1px 2px rgba(11,31,68,.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: ink2,
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '8px'
          }}>
            <IonIcon icon={cashOutline} /> Sales
          </div>

          <div style={{
            fontSize: '28px',
            fontWeight: 800,
            color: ink,
            letterSpacing: '-0.025em',
            marginBottom: '4px'
          }}>
            ₱{totalSales.toFixed(2)}
          </div>

          <div style={{ fontSize: '12px', color: ink2 }}>
            ₱{totalOrders > 0 ? (totalSales / totalOrders).toFixed(0) : 0} average order
          </div>
        </div>

        <div className="admin-card" style={{
          background: 'white',
          borderRadius: '18px',
          border: `1px solid ${line}`,
          padding: '18px',
          boxShadow: '0 1px 2px rgba(11,31,68,.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: ink2,
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '8px'
          }}>
            <IonIcon icon={peopleOutline} /> Buying customers
          </div>

          <div style={{
            fontSize: '28px',
            fontWeight: 800,
            color: ink,
            letterSpacing: '-0.025em',
            marginBottom: '4px'
          }}>
            {uniqueCustomers}
          </div>

          <div style={{ fontSize: '12px', color: ink2 }}>
            Placed at least one order
          </div>
        </div>

        <div className="admin-card" style={{
          background: 'white',
          borderRadius: '18px',
          border: `1px solid ${line}`,
          padding: '18px',
          boxShadow: '0 1px 2px rgba(11,31,68,.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: ink2,
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '8px'
          }}>
            <IonIcon icon={bicycleOutline} /> Delivery vs pick up
          </div>

          <div style={{
            fontSize: '28px',
            fontWeight: 800,
            color: ink,
            letterSpacing: '-0.025em',
            marginBottom: '4px'
          }}>
            {deliveryPct}% <span style={{ fontSize: '16px', color: ink2 }}>/ {pickupPct}%</span>
          </div>

          <div style={{ fontSize: '12px', color: ink2 }}>
            {deliveryCount} delivered · {pickupCount} picked up
          </div>
        </div>
      </div>

      {/* ORDERS BY BARANGAY */}
      <div className="admin-card" style={{
        background: 'white',
        borderRadius: '20px',
        border: `1px solid ${line}`,
        padding: '24px',
        boxShadow: '0 1px 2px rgba(11,31,68,.05)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 800,
              color: ink,
              fontFamily: display
            }}>
              Orders by barangay
            </h2>

            <p style={{
              margin: 0,
              color: ink2,
              fontSize: '13px'
            }}>
              Ranked from most to fewest orders, last {period} days
            </p>
          </div>

          <div style={{
            display: 'flex',
            background: '#EEF6F4',
            borderRadius: '10px',
            padding: '4px'
          }}>
            <button
              onClick={() => setViewMode('chart')}
              className="admin-hover-btn"
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'chart' ? 'white' : 'transparent',
                color: viewMode === 'chart' ? ink : ink2,
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: viewMode === 'chart' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Chart
            </button>

            <button
              onClick={() => setViewMode('table')}
              className="admin-hover-btn"
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'table' ? 'white' : 'transparent',
                color: viewMode === 'table' ? ink : ink2,
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Table
            </button>
          </div>
        </div>

        {viewMode === 'chart' ? (
          <>
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                color: ink2
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: pri
                }} />
                Delivery
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                color: ink2
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: '#6FA83A'
                }} />
                Pick up
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {barangays.map((b, i) => (
                <div
                  key={b.name}
                  className="admin-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 120px minmax(0, 1fr) 40px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '12px',
                    background: i === 0 ? priSoft : 'transparent'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '8px',
                    background: i === 0 ? pri : line,
                    color: i === 0 ? 'white' : ink2,
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    {i + 1}
                  </div>

                  <div style={{
                    fontWeight: 700,
                    fontSize: '13.5px',
                    color: ink
                  }}>
                    {b.name}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '2px',
                    height: '16px'
                  }}>
                    <div style={{
                      width: `${(b.delivery / maxCount) * 100}%`,
                      background: pri,
                      borderRadius: '4px'
                    }} />

                    <div style={{
                      width: `${(b.pickup / maxCount) * 100}%`,
                      background: '#6FA83A',
                      borderRadius: '4px'
                    }} />
                  </div>

                  <div style={{
                    fontWeight: 800,
                    textAlign: 'right',
                    color: ink,
                    fontSize: '14px'
                  }}>
                    {b.count}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px'
            }}>
              <thead style={{ borderBottom: `1px solid ${line}` }}>
                <tr>
                  <th style={{
                    padding: '12px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ink2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    Rank
                  </th>

                  <th style={{
                    padding: '12px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ink2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    Barangay
                  </th>

                  <th style={{
                    padding: '12px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ink2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    Delivery
                  </th>

                  <th style={{
                    padding: '12px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ink2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    Pick up
                  </th>

                  <th style={{
                    padding: '12px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ink2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    textAlign: 'right'
                  }}>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {barangays.map((b, i) => (
                  <tr
                    key={b.name}
                    className="admin-table-row"
                    style={{ borderBottom: `1px solid ${line}` }}
                  >
                    <td style={{
                      padding: '12px 8px',
                      fontWeight: 700,
                      color: i === 0 ? pri : ink
                    }}>
                      {i + 1}
                    </td>

                    <td style={{
                      padding: '12px 8px',
                      fontWeight: 700,
                      color: ink
                    }}>
                      {b.name}
                    </td>

                    <td style={{ padding: '12px 8px', color: ink2 }}>
                      {b.delivery}
                    </td>

                    <td style={{ padding: '12px 8px', color: ink2 }}>
                      {b.pickup}
                    </td>

                    <td style={{
                      padding: '12px 8px',
                      fontWeight: 800,
                      color: ink,
                      textAlign: 'right'
                    }}>
                      {b.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
