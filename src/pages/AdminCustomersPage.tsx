import { useState, useEffect } from 'react';
import { IonIcon, IonToast } from '@ionic/react';
import {
  searchOutline,
  refreshOutline,
  checkmarkCircleOutline,
  timeOutline,
  trashOutline,
  closeCircleOutline,
  notificationsOutline,
  receiptOutline,
  walletOutline,
  cubeOutline,
  peopleOutline,
  chevronForwardOutline,
  closeOutline,
  eyeOutline // ✅ IDINAGDAG LANG ITO PARA SA VIEW BUTTON
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [pendingCustomers, setPendingCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending'>('all');

  // ✅ IDINAGDAG: State para sa pinindot na customer
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // NOTIFICATIONS
  const [showNotifs, setShowNotifs] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  // TOAST STATE
  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
    color: 'success' as 'success' | 'danger' | 'warning'
  });

  const showToast = (message: string, color: 'success' | 'danger' | 'warning') => {
    setToast({ isOpen: true, message, color });
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      const allCustomers = Array.isArray(res.data) ? res.data : [];

      setCustomers(allCustomers.filter((c: any) => c.is_verified === true));
      setPendingCustomers(allCustomers.filter((c: any) => c.is_verified === false));
    } catch (err) {
      console.error(err);
      showToast('Failed to load customers.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const [ordersRes, topupsRes, productsRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/topup-requests'),
        api.get('/admin/products')
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const topups = Array.isArray(topupsRes.data) ? topupsRes.data : [];
      const products = Array.isArray(productsRes.data) ? productsRes.data : [];

      setPendingOrders(
        orders.filter((o: any) =>
          ['pending', 'confirmed'].includes(
            String(o.order_status || o.status || '').toLowerCase()
          )
        )
      );

      setPendingTopups(
        topups.filter((t: any) =>
          String(t.status || '').toLowerCase() === 'pending'
        )
      );

      setLowStockProducts(
        products.filter((p: any) => Number(p.stock_quantity) <= 12)
      );
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchNotifications();
  }, []);

  // APPROVE FUNCTION
  const handleApprove = async (id: number, name: string) => {
    try {
      await api.patch(`/admin/customers/${id}/verify`, { is_verified: true });
      showToast(`${name} has been successfully approved!`, 'success');
      setSelectedCustomer(null); // ✅ Isara ang modal pag na-approve
      fetchCustomers();
      window.dispatchEvent(new Event('refreshBadges'));
    } catch (err: any) {
      showToast(
        'Failed to approve: ' + (err.response?.data?.detail || err.message),
        'danger'
      );
    }
  };

  // REJECT/DELETE FUNCTION
  const handleReject = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to reject and delete ${name}?`)) return;

    try {
      await api.delete(`/admin/customers/${id}`);
      showToast(`${name}'s account has been deleted.`, 'warning');
      setSelectedCustomer(null); // ✅ Isara ang modal pag na-reject
      fetchCustomers();
      window.dispatchEvent(new Event('refreshBadges'));
    } catch (err: any) {
      showToast(
        'Failed to delete: ' + (err.response?.data?.detail || err.message),
        'danger'
      );
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
  const warn = '#C77700';
  const warnSoft = '#FFF1D6';
  const bad = '#D6384A';
  const badSoft = '#FDE4E7';

  const notificationCount =
    lowStockProducts.length +
    pendingOrders.length +
    pendingTopups.length +
    pendingCustomers.length;

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  const filterSearch = (list: any[]) =>
    list.filter(c =>
      (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || c.contact_number || '').includes(search)
    );

  const displayedApproved = filterSearch(customers);
  const displayedPending = filterSearch(pendingCustomers);

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
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 4px 0',
            fontSize: '23px',
            fontWeight: 800,
            color: ink,
            fontFamily: display
          }}>
            Customers
          </h1>

          <p style={{ margin: 0, color: ink2, fontSize: '12.5px' }}>
            Manage accounts and approvals.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexShrink: 0
        }}>

          {/* SEARCH */}
          <div style={{
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
              placeholder="Search name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '12.5px',
                color: ink,
                fontFamily: font
              }}
            />
          </div>

          {/* REFRESH */}
          <button
            onClick={() => {
              fetchCustomers();
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
            <IonIcon icon={refreshOutline} />
            Refresh
          </button>

          {/* NOTIFICATION BELL - SAME AS ADMIN PRODUCTS */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                fetchNotifications();
              }}
              className="admin-hover-btn"
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
                style={{
                  fontSize: '19px',
                  color: ink2
                }}
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
                  {notificationCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifs && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '310px',
                background: 'white',
                border: `1px solid ${line}`,
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(11,31,68,0.15)',
                zIndex: 200,
                overflow: 'hidden'
              }}>

                {/* DROPDOWN HEADER */}
                <div style={{
                  padding: '15px 16px',
                  borderBottom: `1px solid ${line}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{
                    fontSize: '14px',
                    color: ink
                  }}>
                    Notifications
                  </strong>

                  <button
                    onClick={() => setShowNotifs(false)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: ink2,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Close
                  </button>
                </div>

                {/* NOTIFICATION LIST */}
                <div style={{
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}>

                  {notificationCount === 0 ? (
                    <div style={{
                      padding: '25px 15px',
                      textAlign: 'center',
                      color: ink2,
                      fontSize: '12px'
                    }}>
                      You're all caught up!
                    </div>
                  ) : (
                    <>

                      {/* LOW STOCK */}
                      {lowStockProducts.map(p => (
                        <div
                          key={`stock-${p.id}`}
                          onClick={() => {
                            setShowNotifs(false);
                            navigate('/admin/products');
                          }}
                          className="admin-hover-btn"
                          style={{
                            padding: '13px 16px',
                            borderBottom: `1px solid ${line}`,
                            display: 'flex',
                            gap: '11px',
                            alignItems: 'flex-start',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: warnSoft,
                            color: warn,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}>
                            <IonIcon icon={cubeOutline} />
                          </div>

                          <div>
                            <div style={{
                              fontWeight: 700,
                              color: ink,
                              fontSize: '12px'
                            }}>
                              Low stock
                            </div>

                            <div style={{
                              color: ink2,
                              fontSize: '11px',
                              marginTop: '3px'
                            }}>
                              {p.product_name} has only {p.stock_quantity} left.
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* PENDING ORDERS */}
                      {pendingOrders.length > 0 && (
                        <div
                          onClick={() => {
                            setShowNotifs(false);
                            navigate('/admin/orders');
                          }}
                          className="admin-hover-btn"
                          style={{
                            padding: '13px 16px',
                            borderBottom: `1px solid ${line}`,
                            display: 'flex',
                            gap: '11px',
                            alignItems: 'flex-start',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: priSoft,
                            color: pri,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}>
                            <IonIcon icon={receiptOutline} />
                          </div>

                          <div>
                            <div style={{
                              fontWeight: 700,
                              color: ink,
                              fontSize: '12px'
                            }}>
                              Pending Orders
                            </div>

                            <div style={{
                              color: ink2,
                              fontSize: '11px',
                              marginTop: '3px'
                            }}>
                              {pendingOrders.length} order(s) need attention.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PENDING TOP-UPS */}
                      {pendingTopups.length > 0 && (
                        <div
                          onClick={() => {
                            setShowNotifs(false);
                            navigate('/admin/topups');
                          }}
                          className="admin-hover-btn"
                          style={{
                            padding: '13px 16px',
                            borderBottom: `1px solid ${line}`,
                            display: 'flex',
                            gap: '11px',
                            alignItems: 'flex-start',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: '#DDF5EA',
                            color: ok,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}>
                            <IonIcon icon={walletOutline} />
                          </div>

                          <div>
                            <div style={{
                              fontWeight: 700,
                              color: ink,
                              fontSize: '12px'
                            }}>
                              Pending Top-ups
                            </div>

                            <div style={{
                              color: ink2,
                              fontSize: '11px',
                              marginTop: '3px'
                            }}>
                              {pendingTopups.length} top-up request(s) need review.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CUSTOMER APPROVALS */}
                      {pendingCustomers.length > 0 && (
                        <div
                          onClick={() => {
                            setShowNotifs(false);
                            setActiveTab('pending');
                          }}
                          className="admin-hover-btn"
                          style={{
                            padding: '13px 16px',
                            borderBottom: `1px solid ${line}`,
                            display: 'flex',
                            gap: '11px',
                            alignItems: 'flex-start',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: badSoft,
                            color: bad,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}>
                            <IonIcon icon={peopleOutline} />
                          </div>

                          <div>
                            <div style={{
                              fontWeight: 700,
                              color: ink,
                              fontSize: '12px'
                            }}>
                              Customer Approvals
                            </div>

                            <div style={{
                              color: ink2,
                              fontSize: '11px',
                              marginTop: '3px'
                            }}>
                              {pendingCustomers.length} account(s) waiting for approval.
                            </div>
                          </div>
                        </div>
                      )}

                    </>
                  )}
                </div>

                {/* REFRESH NOTIFICATIONS */}
                <button
                  onClick={() => {
                    fetchNotifications();
                    fetchCustomers();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: 'none',
                    borderTop: `1px solid ${line}`,
                    background: '#F8FAFC',
                    color: pri,
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  <IonIcon
                    icon={refreshOutline}
                    style={{ marginRight: '5px' }}
                  />
                  Refresh notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: `1px solid ${line}`,
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'all' ? priSoft : 'transparent',
            color: activeTab === 'all' ? pri : ink2
          }}
        >
          All Customers ({customers.length + pendingCustomers.length})
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'approved' ? priSoft : 'transparent',
            color: activeTab === 'approved' ? pri : ink2
          }}
        >
          Approved ({customers.length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'pending' ? warnSoft : 'transparent',
            color: activeTab === 'pending' ? warn : ink2
          }}
        >
          Pending Approvals ({pendingCustomers.length})
        </button>
      </div>

      {/* ✅ PENDING SECTION */}
      {(activeTab === 'all' || activeTab === 'pending') && displayedPending.length > 0 && (
        <div style={{
          background: warnSoft,
          border: `1px solid ${warn}`,
          borderRadius: '16px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <IonIcon icon={timeOutline} style={{ color: warn, fontSize: '20px' }} />

            <h3 style={{
              margin: 0,
              color: warn,
              fontSize: '16px',
              fontWeight: 800
            }}>
              Pending Approvals ({displayedPending.length})
            </h3>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {displayedPending.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedCustomer(p)}
                className="admin-hover-btn"
                style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: `1px solid ${line}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: warnSoft, color: warn, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '14px' }}>
                    {p.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: ink, fontSize: '14px' }}>{p.full_name}</div>
                    <div style={{ fontSize: '12px', color: ink2 }}>Tap to view details</div>
                  </div>
                </div>
                <div style={{ color: warn, fontWeight: 700, fontSize: '12px' }}>View ➔</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ APPROVED TABLE (PREMIUM DESIGN, WALANG PHONE AT ADDRESS) */}
      {(activeTab === 'all' || activeTab === 'approved') && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          border: `1px solid ${line}`,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(11,31,68,0.03)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${line}`, background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: ink2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: ink2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Wallet Balance</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: ink2, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayedApproved.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: ink2
                  }}>
                    No approved customers found.
                  </td>
                </tr>
              ) : (
                displayedApproved.map((c) => (
                  <tr key={c.id} className="admin-table-row" style={{ borderBottom: `1px solid ${line}`, transition: 'background 0.2s ease' }}>
                    
                    {/* PANGALAN AT EMAIL LANG */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #E6EEFA, #D4E2F8)',
                          color: pri,
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                          fontSize: '15px',
                          flexShrink: 0
                        }}>
                          {c.full_name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: ink }}>{c.full_name}</div>
                          <div style={{ fontSize: '12px', color: ink2, marginTop: '2px' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* WALLET */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: (c.wallet_balance_centavos || 0) > 0 ? '#F0FDF4' : '#F8FAFC',
                        color: (c.wallet_balance_centavos || 0) > 0 ? ok : ink2,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '14px',
                        border: `1px solid ${(c.wallet_balance_centavos || 0) > 0 ? '#DCFCE7' : line}`
                      }}>
                        ₱{((c.wallet_balance_centavos || 0) / 100).toFixed(2)}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="admin-hover-btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: priSoft,
                            color: pri,
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <IonIcon icon={eyeOutline} style={{ fontSize: '16px' }} />
                          View
                        </button>
                        <button
                          onClick={() => handleReject(c.id, c.full_name)}
                          className="admin-hover-btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: badSoft,
                            color: bad,
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <IonIcon icon={trashOutline} style={{ fontSize: '16px' }} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ MODAL */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,31,68,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', 
                  background: selectedCustomer.is_verified ? 'linear-gradient(135deg, #E6EEFA, #D4E2F8)' : 'linear-gradient(135deg, #FFF1D6, #FFE4B3)', 
                  color: selectedCustomer.is_verified ? pri : warn, 
                  display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '20px' 
                }}>
                  {selectedCustomer.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: ink, fontFamily: display }}>{selectedCustomer.full_name}</h2>
                  <div style={{ 
                    fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', 
                    display: 'inline-block', 
                    background: selectedCustomer.is_verified ? '#DDF5EA' : '#FFF1D6', 
                    color: selectedCustomer.is_verified ? ok : warn,
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {selectedCustomer.is_verified ? 'Approved' : 'Pending'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', color: ink2, borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center' }}
              >
                <IonIcon icon={closeOutline} style={{ fontSize: '20px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '0 24px 24px 24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: `1px solid ${line}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: ink2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Email Address</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: ink }}>{selectedCustomer.email || 'N/A'}</div>
                </div>
                
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: `1px solid ${line}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: ink2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Contact Number</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: ink }}>{selectedCustomer.contact_number || 'N/A'}</div>
                </div>
                
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: `1px solid ${line}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: ink2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Delivery Address</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: ink, lineHeight: 1.5 }}>{selectedCustomer.default_address || 'N/A'}</div>
                </div>
              </div>

              {!selectedCustomer.is_verified && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                  <button 
                    onClick={() => handleReject(selectedCustomer.id, selectedCustomer.full_name)} 
                    style={{ padding: '14px', borderRadius: '12px', border: 'none', background: badSoft, color: bad, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedCustomer.id, selectedCustomer.full_name)} 
                    style={{ padding: '14px', borderRadius: '12px', border: 'none', background: ok, color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(18,160,107,0.3)' }}
                  >
                    Approve
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* GLOBAL NOTIFICATION TOAST */}
      <IonToast
        isOpen={toast.isOpen}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        duration={3000}
        color={toast.color}
        position="top"
        mode="ios"
        buttons={[{ text: 'Dismiss', role: 'cancel' }]}
      />

    </div>
  );
};

export default AdminCustomersPage;