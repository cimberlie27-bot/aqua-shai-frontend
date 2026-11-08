
import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  receiptOutline,
  walletOutline,
  cubeOutline,
  chevronForwardOutline,
  refreshOutline,
  notificationsOutline,
  waterOutline
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [range, setRange] = useState('7');
  const [chartView, setChartView] = useState<'chart' | 'table'>('chart');
  const [showNotifications, setShowNotifications] = useState(false);

  const [data, setData] = useState({
    newOrders: 0,
    topups: 0,
    lowStock: 0,
    salesToday: 0,
    ordersToHandle: 0,
    walletFloat: 0,
    ordersToday: 0,
    preparing: 0,
    outForDelivery: 0,
    readyForPickup: 0,
    delivered: 0,
    lowStockProducts: [] as any[],
    recentOrders: [] as any[]
  });

  const fetchDashboard = async () => {
    try {
      console.log("🔄 Fetching dashboard...");

      const [ordRes, topupRes, prodRes, custRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/topup-requests'),
        api.get('/admin/products'),
        api.get('/admin/customers')
      ]);

      const orders = ordRes.data || [];
      const topups = topupRes.data || [];
      const products = prodRes.data || [];
      const customers = custRes.data || [];

      setData({
        newOrders: orders.filter((o: any) => o.order_status === 'confirmed').length,
        topups: topups.filter((t: any) => t.status === 'pending').length,
        lowStock: products.filter((p: any) => p.stock_quantity <= 12).length,

        ordersToHandle: orders.filter((o: any) =>
          ['confirmed', 'preparing'].includes(o.order_status)
        ).length,

        salesToday: orders
          .filter((o: any) => o.order_status === 'delivered')
          .reduce((acc: number, o: any) => acc + o.total_amount_centavos, 0) / 100,

        walletFloat: customers.reduce(
          (acc: number, c: any) => acc + c.wallet_balance_centavos, 0
        ) / 100,

        ordersToday: orders.filter(
          (o: any) =>
            new Date(o.created_at).toDateString() === new Date().toDateString()
        ).length,

        preparing: orders.filter((o: any) => o.order_status === 'preparing').length,
        outForDelivery: orders.filter((o: any) => o.order_status === 'out_for_delivery').length,
        readyForPickup: orders.filter((o: any) => o.order_status === 'ready_for_pickup').length,
        delivered: orders.filter((o: any) => o.order_status === 'delivered').length,

        lowStockProducts: products
          .filter((p: any) => p.stock_quantity <= 12)
          .slice(0, 3),

        recentOrders: orders
          .filter((o: any) =>
            ['confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup']
              .includes(o.order_status)
          )
          .slice(0, 5)
      });

      console.log("✅ Dashboard updated");
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      fetchDashboard();
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #D8E5E3',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 1px 2px rgba(11,31,68,.05), 0 8px 24px rgba(11,31,68,.06)'
  };

  const tileStyle = {
    background: '#FFFFFF',
    border: '1px solid #D8E5E3',
    borderRadius: '18px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    boxShadow: '0 1px 2px rgba(11,31,68,.05)',
    flex: 1
  };

  const todoiStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '16px',
    background: '#FFFFFF',
    border: '1.5px solid #D8E5E3',
    textAlign: 'left' as const,
    cursor: 'pointer' as const,
    width: '100%',
    transition: 'all 0.2s ease'
  };

  const notificationCount =
    data.newOrders + data.topups + data.lowStock;

  return (
    <div style={{
      padding: '24px 28px',
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      background: '#EEF6F4',
      minHeight: '100vh'
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 4px 0',
            fontSize: '24px',
            fontWeight: 800,
            color: '#0B1F44',
            fontFamily: '"Baloo 2", sans-serif'
          }}>
            Dashboard
          </h1>

          <p style={{
            margin: 0,
            color: '#566A8A',
            fontSize: '13px',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            Aqua Shai · Peñaranda, Nueva Ecija · {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <button
            onClick={fetchDashboard}
            className="admin-hover-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              background: '#E6EEFA',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#2B5DB8',
              fontSize: '13px'
            }}
          >
            <IonIcon icon={refreshOutline} /> Refresh
          </button>

          {/* NOTIFICATION BELL */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="admin-icon-btn"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: '1.5px solid #D8E5E3',
                background: 'white',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <IonIcon
                icon={notificationsOutline}
                style={{ fontSize: '20px', color: '#566A8A' }}
              />

              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#D6384A',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 800,
                  minWidth: '18px',
                  height: '18px',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0 4px'
                }}>
                  {notificationCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '320px',
                maxWidth: 'calc(100vw - 32px)',
                background: '#FFFFFF',
                border: '1px solid #D8E5E3',
                borderRadius: '16px',
                boxShadow: '0 8px 28px rgba(11,31,68,0.14)',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #E8EFED',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <b style={{
                    fontSize: '15px',
                    color: '#0B1F44'
                  }}>
                    Notifications
                  </b>

                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '22px',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{
                  maxHeight: '330px',
                  overflowY: 'auto'
                }}>

                  {/* PENDING ORDERS */}
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin/orders');
                    }}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderBottom: '1px solid #F0F4F3',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: '#FFF1D6',
                      color: '#C77700',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IonIcon icon={receiptOutline} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <b style={{
                        fontSize: '13px',
                        color: '#0B1F44'
                      }}>
                        Pending Orders
                      </b>

                      <p style={{
                        margin: '3px 0 0',
                        fontSize: '12px',
                        color: '#566A8A'
                      }}>
                        {data.newOrders} orders waiting to be handled
                      </p>
                    </div>

                    <IonIcon
                      icon={chevronForwardOutline}
                      style={{ color: '#94a3b8' }}
                    />
                  </div>

                  {/* PENDING TOP-UPS */}
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin/topups');
                    }}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderBottom: '1px solid #F0F4F3',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: '#E6EEFA',
                      color: '#2B5DB8',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IonIcon icon={walletOutline} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <b style={{
                        fontSize: '13px',
                        color: '#0B1F44'
                      }}>
                        Pending Top-ups
                      </b>

                      <p style={{
                        margin: '3px 0 0',
                        fontSize: '12px',
                        color: '#566A8A'
                      }}>
                        {data.topups} top-up requests to review
                      </p>
                    </div>

                    <IonIcon
                      icon={chevronForwardOutline}
                      style={{ color: '#94a3b8' }}
                    />
                  </div>

                  {/* LOW STOCK */}
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin/products');
                    }}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: '#FFF1D6',
                      color: '#C77700',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IonIcon icon={cubeOutline} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <b style={{
                        fontSize: '13px',
                        color: '#0B1F44'
                      }}>
                        Low Stock
                      </b>

                      <p style={{
                        margin: '3px 0 0',
                        fontSize: '12px',
                        color: '#566A8A'
                      }}>
                        {data.lowStock} products need restocking
                      </p>

                      {data.lowStockProducts.map((product: any) => (
                        <p
                          key={product.id}
                          style={{
                            margin: '6px 0 0',
                            fontSize: '11px',
                            color: '#C77700'
                          }}
                        >
                          • {product.product_name} — {product.stock_quantity} left
                        </p>
                      ))}
                    </div>

                    <IonIcon
                      icon={chevronForwardOutline}
                      style={{ color: '#94a3b8' }}
                    />
                  </div>

                  {notificationCount === 0 && (
                    <div style={{
                      padding: '28px 16px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '13px'
                    }}>
                      <IonIcon
                        icon={notificationsOutline}
                        style={{
                          fontSize: '28px',
                          marginBottom: '8px'
                        }}
                      />
                      <p style={{ margin: 0 }}>
                        You're all caught up!
                      </p>
                      <span>No new notifications.</span>
                    </div>
                  )}
                </div>

                <div style={{
                  padding: '11px 16px',
                  background: '#F8FAFC',
                  borderTop: '1px solid #E8EFED',
                  fontSize: '11px',
                  color: '#94a3b8',
                  textAlign: 'center'
                }}>
                  Aqua Shai Admin Notifications
                </div>
              </div>
            )}
          </div>

          <div
            onClick={() => navigate('/profile')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#E6EEFA',
              color: '#2B5DB8',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              cursor: 'pointer'
            }}
          >
            SA
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
      }}>
        <button
          onClick={() => navigate('/admin/orders')}
          className="admin-hover-btn"
          style={{ ...todoiStyle, borderColor: '#f5d79f' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#FFF1D6',
            color: '#C77700',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <IonIcon icon={receiptOutline} style={{ fontSize: '20px' }} />
          </div>

          <div style={{
            flex: 1,
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            <b style={{
              display: 'block',
              fontSize: '15px',
              color: '#0B1F44'
            }}>
              {data.newOrders} new orders
            </b>

            <span style={{
              display: 'block',
              fontSize: '12px',
              color: '#566A8A'
            }}>
              Start preparing and assign a rider
            </span>
          </div>

          <IonIcon
            icon={chevronForwardOutline}
            style={{ color: '#C77700' }}
          />
        </button>

        <button
          onClick={() => navigate('/admin/topups')}
          className="admin-hover-btn"
          style={{ ...todoiStyle, borderColor: '#b2cbf2' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#E6EEFA',
            color: '#2B5DB8',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <IonIcon icon={walletOutline} style={{ fontSize: '20px' }} />
          </div>

          <div style={{
            flex: 1,
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            <b style={{
              display: 'block',
              fontSize: '15px',
              color: '#0B1F44'
            }}>
              {data.topups} top-ups to review
            </b>

            <span style={{
              display: 'block',
              fontSize: '12px',
              color: '#566A8A'
            }}>
              Waiting for approval
            </span>
          </div>

          <IonIcon
            icon={chevronForwardOutline}
            style={{ color: '#2B5DB8' }}
          />
        </button>

        <button
          onClick={() => navigate('/admin/products')}
          className="admin-hover-btn"
          style={{ ...todoiStyle, borderColor: '#f5d79f' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#FFF1D6',
            color: '#C77700',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <IonIcon icon={cubeOutline} style={{ fontSize: '20px' }} />
          </div>

          <div style={{
            flex: 1,
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            <b style={{
              display: 'block',
              fontSize: '15px',
              color: '#0B1F44'
            }}>
              {data.lowStock} low on stock
            </b>

            <span style={{
              display: 'block',
              fontSize: '12px',
              color: '#566A8A'
            }}>
              Needs reorder
            </span>
          </div>

          <IonIcon
            icon={chevronForwardOutline}
            style={{ color: '#C77700' }}
          />
        </button>
      </div>

      {/* SALES RANGE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#566A8A',
          fontFamily: '"Plus Jakarta Sans", sans-serif'
        }}>
          Sales range
        </span>

        <div style={{
          display: 'flex',
          background: '#EEF6F4',
          borderRadius: '10px',
          padding: '4px',
          border: '1px solid #D8E5E3'
        }}>
          <button
            onClick={() => setRange('7')}
            className="admin-hover-btn"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              background: range === '7' ? 'white' : 'transparent',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              color: range === '7' ? '#0B1F44' : '#566A8A',
              cursor: 'pointer',
              boxShadow: range === '7' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Last 7 days
          </button>

          <button
            onClick={() => setRange('14')}
            className="admin-hover-btn"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              background: range === '14' ? 'white' : 'transparent',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              color: range === '14' ? '#0B1F44' : '#566A8A',
              cursor: 'pointer',
              boxShadow: range === '14' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Last 14 days
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        <div className="admin-card" style={tileStyle}>
          <small style={{
            color: '#566A8A',
            fontWeight: 600,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            <IonIcon icon={receiptOutline} /> Sales today
          </small>

          <b style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0B1F44',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            ₱{data.salesToday.toFixed(2)}
          </b>

          <div style={{
            fontSize: '12px',
            color: '#566A8A',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            So far · {data.ordersToHandle} orders
          </div>
        </div>

        <div className="admin-card" style={tileStyle}>
          <small style={{
            color: '#566A8A',
            fontWeight: 600,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            <IonIcon icon={receiptOutline} /> Orders to handle
          </small>

          <b style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0B1F44',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            {data.ordersToHandle}
          </b>

          <div style={{
            fontSize: '12px',
            color: '#566A8A',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            Confirmed & preparing
          </div>
        </div>

        <div className="admin-card" style={tileStyle}>
          <small style={{
            color: '#566A8A',
            fontWeight: 600,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            <IonIcon icon={walletOutline} /> Customer wallet float
          </small>

          <b style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0B1F44',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            ₱{data.walletFloat.toFixed(2)}
          </b>

          <div style={{
            fontSize: '12px',
            color: '#566A8A',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            Prepaid by customers
          </div>
        </div>

        <div className="admin-card" style={tileStyle}>
          <small style={{
            color: '#566A8A',
            fontWeight: 600,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            <IonIcon icon={cubeOutline} /> Low stock
          </small>

          <b style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#C77700',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            {data.lowStock}
          </b>

          <div style={{
            fontSize: '12px',
            color: '#566A8A',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            {data.lowStockProducts[0]?.product_name || 'Needs reorder'}
          </div>
        </div>
      </div>

      {/* DAILY SALES AND ORDERS TODAY */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.7fr 1fr',
        gap: '16px'
      }}>
        <div className="admin-card" style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div>
              <h2 style={{
                margin: '0 0 4px 0',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0B1F44',
                fontFamily: '"Baloo 2", sans-serif'
              }}>
                Daily sales
              </h2>

              <p style={{
                margin: 0,
                color: '#566A8A',
                fontSize: '13px',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}>
                ₱3,435 over {range} days
              </p>
            </div>

            <div style={{
              display: 'flex',
              background: '#EEF6F4',
              borderRadius: '10px',
              padding: '4px'
            }}>
              <button
                onClick={() => setChartView('chart')}
                className="admin-hover-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: chartView === 'chart' ? 'white' : 'transparent',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: chartView === 'chart' ? '#0B1F44' : '#566A8A',
                  cursor: 'pointer',
                  boxShadow: chartView === 'chart' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Chart
              </button>

              <button
                onClick={() => setChartView('table')}
                className="admin-hover-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: chartView === 'table' ? 'white' : 'transparent',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: chartView === 'table' ? '#0B1F44' : '#566A8A',
                  cursor: 'pointer',
                  boxShadow: chartView === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Table
              </button>
            </div>
          </div>

          {chartView === 'chart' ? (
            <>
              <div style={{
                height: '200px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '16px',
                padding: '0 10px',
                borderBottom: '1px solid #D8E5E3'
              }}>
                {[250, 500, 350, 700, 450, 800, 890].map((val, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: i === 6 ? '#2B5DB8' : '#566A8A',
                      fontFamily: '"Plus Jakarta Sans", sans-serif'
                    }}>
                      ₱{val}
                    </span>

                    <div style={{
                      width: '100%',
                      height: `${(val / 1000) * 100}%`,
                      background: i === 6 ? '#2B5DB8' : '#B4C9F0',
                      borderRadius: '4px 4px 0 0'
                    }}></div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                padding: '0 10px',
                color: '#566A8A',
                fontSize: '12px',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}>
                {['1 Sun', '2 Mon', '3 Tue', '4 Wed', '5 Thu', '6 Fri', 'Today'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#566A8A',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              Table view (coming soon)
            </div>
          )}
        </div>

        <div className="admin-card" style={cardStyle}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '18px',
            fontWeight: 800,
            color: '#0B1F44',
            fontFamily: '"Baloo 2", sans-serif'
          }}>
            Orders today
          </h2>

          <p style={{
            margin: '0 0 16px 0',
            color: '#566A8A',
            fontSize: '13px',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}>
            {data.ordersToday} in total
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#566A8A'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: '#C77700'
                }}></div>
                New
              </span>

              <b style={{ color: '#0B1F44' }}>{data.newOrders}</b>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#566A8A'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: '#2B5DB8'
                }}></div>
                Preparing
              </span>

              <b style={{ color: '#0B1F44' }}>{data.preparing}</b>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#566A8A'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: '#12A06B'
                }}></div>
                Out for delivery
              </span>

              <b style={{ color: '#0B1F44' }}>{data.outForDelivery}</b>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#566A8A'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: '#D6384A'
                }}></div>
                Ready to pick up
              </span>

              <b style={{ color: '#0B1F44' }}>{data.readyForPickup}</b>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#566A8A'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: '#12A06B'
                }}></div>
                Delivered
              </span>

              <b style={{ color: '#12A06B' }}>{data.delivered}</b>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER QUEUE AND STOCK HEALTH */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.7fr 1fr',
        gap: '16px'
      }}>
        <div className="admin-card" style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <h2 style={{
                margin: '0 0 4px 0',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0B1F44',
                fontFamily: '"Baloo 2", sans-serif'
              }}>
                Order queue
              </h2>

              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#566A8A',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}>
                Oldest first
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/orders')}
              className="admin-hover-btn"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1.5px solid #D8E5E3',
                background: 'white',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                color: '#0B1F44',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}
            >
              All orders
            </button>
          </div>

          {data.recentOrders.length === 0 ? (
            <p style={{
              color: '#566A8A',
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              No orders in queue.
            </p>
          ) : (
            data.recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="admin-table-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '14px 8px',
                  borderBottom: '1px solid #D8E5E3',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  flex: 1,
                  minWidth: 0
                }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '14.5px',
                    color: '#0B1F44'
                  }}>
                    #{order.id} · {order.customer_name || 'Customer'}
                  </div>

                  <div style={{
                    fontSize: '12.5px',
                    color: '#566A8A',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {order.items?.map((i: any) =>
                      `${i.quantity}x ${i.product_name_snapshot}`
                    ).join(', ')}
                  </div>
                </div>

                {order.order_status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="admin-hover-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #E6EEFA',
                      background: 'white',
                      color: '#2B5DB8',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Start preparing
                  </button>
                )}

                {order.order_status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                    className="admin-hover-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#12A06B',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark ready
                  </button>
                )}

                {order.order_status === 'ready_for_pickup' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="admin-hover-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#12A06B',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark picked up
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* STOCK HEALTH */}
        <div className="admin-card" style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <h2 style={{
                margin: '0 0 4px 0',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0B1F44',
                fontFamily: '"Baloo 2", sans-serif'
              }}>
                Stock health
              </h2>

              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#566A8A',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}>
                Reorder at 12 or fewer
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/products')}
              className="admin-hover-btn"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1.5px solid #D8E5E3',
                background: 'white',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                color: '#0B1F44',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}
            >
              Manage
            </button>
          </div>

          {data.lowStockProducts.length === 0 ? (
            <p style={{
              color: '#566A8A',
              fontSize: '14px',
              fontFamily: '"Plus Jakarta Sans", sans-serif'
            }}>
              All products are well stocked.
            </p>
          ) : (
            data.lowStockProducts.map((prod: any) => (
              <div
                key={prod.id}
                className="admin-table-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 8px',
                  borderBottom: '1px solid #D8E5E3',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#E6EEFA',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#2B5DB8'
                }}>
                  <IonIcon icon={waterOutline} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: '"Plus Jakarta Sans", sans-serif'
                  }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '14.5px',
                      color: '#0B1F44'
                    }}>
                      {prod.product_name}
                    </span>

                    <span style={{
                      fontSize: '13px',
                      color: '#566A8A'
                    }}>
                      {prod.stock_quantity} in stock
                    </span>
                  </div>

                  <div style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: '#E6EEFA',
                    marginTop: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '4px',
                      background: prod.stock_quantity <= 12 ? '#C77700' : '#2B5DB8',
                      width: `${Math.min((prod.stock_quantity / 50) * 100, 100)}%`
                    }}></div>
                  </div>

                  {prod.stock_quantity <= 12 && (
                    <div style={{ marginTop: '6px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: '#FFF1D6',
                        color: '#C77700',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: '"Plus Jakarta Sans", sans-serif'
                      }}>
                        Low · {prod.stock_quantity} left
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
