
import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  searchOutline,
  refreshOutline,
  notificationsOutline,
  receiptOutline,
  walletOutline,
  cubeOutline,
  chevronForwardOutline,
  closeOutline
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminTopupsPage: React.FC = () => {
  const navigate = useNavigate();

  const [topups, setTopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTopup, setSelectedTopup] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showNotifs, setShowNotifs] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const fetchTopups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/topup-requests');
      setTopups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
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

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const topupsData = Array.isArray(topupsRes.data) ? topupsRes.data : [];
      const products = Array.isArray(productsRes.data) ? productsRes.data : [];

      setPendingOrders(
        orders.filter((o: any) =>
          ['pending', 'confirmed'].includes(o.order_status)
        )
      );

      setTopups(topupsData);

      setLowStockProducts(
        products.filter((p: any) => p.stock_quantity <= 12)
      );
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchTopups();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchTopups();
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const pendingCount = topups.filter(
    t => t.status === 'pending'
  ).length;

  const notificationCount =
    pendingOrders.length +
    pendingCount +
    lowStockProducts.length;

  const handleNotificationClick = () => {
    setShowNotifs(!showNotifs);

    if (!showNotifs) {
      fetchNotifications();
    }
  };

  const handleReview = async () => {
    if (!selectedTopup || !reviewAction) return;

    try {
      setSubmitting(true);

      await api.post(`/admin/topup-requests/${selectedTopup.id}/process`, {
        action: reviewAction,
        admin_notes: reviewNotes
      });

      setSelectedTopup(null);
      setReviewAction(null);
      setReviewNotes('');

      fetchTopups();
      fetchNotifications();
    } catch (err) {
      alert("Failed to process top-up");
    } finally {
      setSubmitting(false);
    }
  };

  const font = "'Plus Jakarta Sans', sans-serif";
  const display = "'Baloo 2', sans-serif";
  const ink = '#0B1F44';
  const ink2 = '#566A8A';
  const line = '#D8E5E3';
  const pri = '#2B5DB8';
  const priSoft = '#E6EEFA';
  const warn = '#C77700';
  const warnSoft = '#FFF1D6';
  const ok = '#12A06B';
  const okSoft = '#DDF5EA';
  const bad = '#D6384A';
  const badSoft = '#FDE4E7';

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

  const filteredTopups = topups.filter(t => {
    const matchSearch =
      (t.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.reference_number || '').toLowerCase().includes(search.toLowerCase());

    const matchTab =
      activeTab === 'all' ? true : t.status === activeTab;

    return matchSearch && matchTab;
  });

  const pendingTotal = topups
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + t.amount_centavos, 0) / 100;

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
            Top-up requests
          </h1>

          <p style={{
            margin: 0,
            color: ink2,
            fontSize: '12.5px'
          }}>
            Check each proof of payment before money goes to a wallet · {new Date().toLocaleDateString('en-US', {
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
          {/* SEARCH */}
          <div className="admin-input" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            border: `1px solid ${line}`,
            borderRadius: '10px',
            padding: '0 12px',
            height: '38px',
            width: '240px'
          }}>
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
              fetchTopups();
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
              title={`${notificationCount} notifications`}
              className="admin-icon-btn"
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
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0 3px'
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
                    <IonIcon
                      icon={closeOutline}
                      style={{ fontSize: '16px', color: ink2 }}
                    />
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
                      background: warnSoft,
                      color: warn,
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
                      color: warn
                    }}>
                      {pendingOrders.length}
                    </span>

                    <IonIcon icon={chevronForwardOutline} style={{ color: ink2 }} />
                  </button>

                  {/* PENDING TOPUPS */}
                  <button
                    onClick={() => {
                      setShowNotifs(false);
                      setActiveTab('pending');
                      setSearch('');
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
                        {pendingCount} requests waiting for review
                      </div>
                    </div>

                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: pri
                    }}>
                      {pendingCount}
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
                      background: warnSoft,
                      color: warn,
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
                      color: warn
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
                  <IonIcon
                    icon={refreshOutline}
                    style={{ marginRight: '5px', verticalAlign: 'middle' }}
                  />
                  Refresh notifications
                </button>
              </div>
            )}
          </div>

          {/* ADMIN PROFILE */}
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

      {/* FILTERS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          background: 'white',
          border: `1px solid ${line}`,
          borderRadius: '12px',
          padding: '4px',
          gap: '4px'
        }}>
          {['pending', 'approved', 'rejected', 'all'].map(tab => {
            const count = tab === 'all'
              ? topups.length
              : topups.filter(t => t.status === tab).length;

            const isActive = activeTab === tab;

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
                    : 'none',
                  textTransform: 'capitalize'
                }}
              >
                {tab}

                <span style={{
                  background: isActive
                    ? (tab === 'pending' ? pri : line)
                    : 'transparent',
                  color: isActive
                    ? (tab === 'pending' ? 'white' : ink2)
                    : ink2,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  marginLeft: '6px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          fontSize: '13px',
          color: ink2
        }}>
          ₱{pendingTotal.toFixed(2)} waiting for your decision
        </div>
      </div>

      {/* TABLE */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: `1px solid ${line}`,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(11,31,68,.05)',
        padding: '0 18px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${line}` }}>
              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                CUSTOMER
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                METHOD
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                REFERENCE
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                AMOUNT
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                SENT
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                STATUS
              </th>

              <th style={{ padding: '13px 8px' }}></th>
            </tr>
          </thead>

          <tbody>
            {filteredTopups.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: ink2
                }}>
                  No top-up requests found.
                </td>
              </tr>
            ) : (
              filteredTopups.map((t) => (
                <tr
                  key={t.id}
                  className="admin-table-row"
                  style={{ borderBottom: `1px solid ${line}` }}
                >
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: priSoft,
                        color: pri,
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '12px'
                      }}>
                        {t.customer_name?.charAt(0) || 'C'}
                      </div>

                      <div>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '13.5px',
                          color: ink
                        }}>
                          {t.customer_name}
                        </div>

                        <div style={{
                          fontSize: '11.5px',
                          color: ink2,
                          marginTop: '2px'
                        }}>
                          {t.customer_contact}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{
                    padding: '14px 8px',
                    fontSize: '12.5px',
                    color: ink
                  }}>
                    {t.payment_method}
                  </td>

                  <td style={{
                    padding: '14px 8px',
                    fontSize: '12.5px',
                    color: ink,
                    fontFamily: 'monospace'
                  }}>
                    {t.reference_number}
                  </td>

                  <td style={{
                    padding: '14px 8px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: ink
                  }}>
                    ₱{(t.amount_centavos / 100).toFixed(2)}
                  </td>

                  <td style={{
                    padding: '14px 8px',
                    fontSize: '12.5px',
                    color: ink2
                  }}>
                    {new Date(t.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  <td style={{ padding: '14px 8px' }}>
                    <span style={{
                      background: t.status === 'pending'
                        ? warnSoft
                        : t.status === 'approved'
                          ? okSoft
                          : badSoft,
                      color: t.status === 'pending'
                        ? warn
                        : t.status === 'approved'
                          ? ok
                          : bad,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'capitalize'
                    }}>
                      {t.status}
                    </span>
                  </td>

                  <td style={{
                    padding: '14px 8px',
                    textAlign: 'right'
                  }}>
                    {t.status === 'pending' && (
                      <button
                        onClick={() => setSelectedTopup(t)}
                        className="admin-hover-btn"
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: pri,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REVIEW MODAL */}
      {selectedTopup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11,31,68,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div
            className="admin-card"
            style={{
              background: 'white',
              borderRadius: '24px',
              width: 'min(500px, 90%)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 800,
                color: ink,
                fontFamily: display
              }}>
                Review top-up
              </h2>

              <button
                onClick={() => {
                  setSelectedTopup(null);
                  setReviewAction(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '22px',
                  color: ink2
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: '#F4F9F8',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: ink2 }}>Customer</span>
                <span style={{ fontWeight: 700, color: ink }}>
                  {selectedTopup.customer_name}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: ink2 }}>Amount</span>
                <span style={{ fontWeight: 700, color: ink }}>
                  ₱{(selectedTopup.amount_centavos / 100).toFixed(2)}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: ink2 }}>Reference</span>
                <span style={{ fontWeight: 700, color: ink }}>
                  {selectedTopup.reference_number}
                </span>
              </div>

              {selectedTopup.proof_image_url && (
                <div>
                  <span style={{
                    color: ink2,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Proof of payment
                  </span>

                  <img
                    src={selectedTopup.proof_image_url}
                    alt="Proof"
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      background: 'white'
                    }}
                  />
                </div>
              )}
            </div>

            {!reviewAction ? (
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => setReviewAction('reject')}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1px solid ${bad}`,
                    background: badSoft,
                    color: bad,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reject
                </button>

                <button
                  onClick={() => setReviewAction('approve')}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: ok,
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Approve
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: ink2
                }}>
                  Are you sure you want to <strong>{reviewAction}</strong> this request for ₱{(selectedTopup.amount_centavos / 100).toFixed(2)}?
                </p>

                <input
                  className="admin-input"
                  type="text"
                  placeholder="Add notes (optional)"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${line}`,
                    outline: 'none',
                    fontFamily: font,
                    fontSize: '14px'
                  }}
                />

                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => setReviewAction(null)}
                    className="admin-hover-btn"
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      background: 'white',
                      color: ink2,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleReview}
                    disabled={submitting}
                    className="admin-hover-btn"
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: reviewAction === 'approve' ? ok : bad,
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: submitting ? 0.7 : 1,
                      fontSize: '14px'
                    }}
                  >
                    {submitting ? 'Processing...' : `Confirm ${reviewAction}`}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTopupsPage;
