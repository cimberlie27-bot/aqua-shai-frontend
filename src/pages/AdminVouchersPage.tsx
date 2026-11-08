
import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  searchOutline,
  refreshOutline,
  notificationsOutline,
  addOutline,
  closeOutline,
  receiptOutline,
  walletOutline,
  cubeOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminVouchersPage: React.FC = () => {
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    voucher_code: '',
    discount_type: 'percentage',
    discount_value: 0,
    minimum_order_amount_centavos: 0,
    usage_limit: 100,
    expiration_date: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // NOTIFICATIONS
  const [showNotifs, setShowNotifs] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/vouchers');
      setVouchers(Array.isArray(res.data) ? res.data : []);
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
    fetchVouchers();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchVouchers();
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

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.voucher_code || formData.discount_value <= 0) {
      alert("Please fill in voucher code and discount value.");
      return;
    }

    if (!formData.expiration_date) {
      alert("Please select an expiration date.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/admin/vouchers', {
        voucher_code: formData.voucher_code.trim().toUpperCase(),
        description: `${formData.discount_value}${formData.discount_type === 'percentage' ? '%' : '₱'} off`,
        discount_type: formData.discount_type,
        discount_value: Math.round(formData.discount_value),
        minimum_order_amount_centavos: Math.round(formData.minimum_order_amount_centavos * 100),
        maximum_discount_centavos: 0,
        usage_limit: formData.usage_limit,
        start_date: new Date().toISOString(),
        expiration_date: new Date(formData.expiration_date).toISOString(),
        is_active: true,
      });

      setShowCreateModal(false);

      setFormData({
        voucher_code: '',
        discount_type: 'percentage',
        discount_value: 0,
        minimum_order_amount_centavos: 0,
        usage_limit: 100,
        expiration_date: ''
      });

      fetchVouchers();
      alert("Voucher created successfully!");

    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create voucher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (voucher: any) => {
    try {
      await api.patch(`/admin/vouchers/${voucher.id}`, {
        is_active: !voucher.is_active
      });

      fetchVouchers();
    } catch (err) {
      alert("Failed to update voucher");
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
      <div style={{
        padding: '50px',
        textAlign: 'center',
        color: ink
      }}>
        Loading...
      </div>
    );
  }

  const filteredVouchers = vouchers.filter(v =>
    (v.voucher_code || '').toLowerCase().includes(search.toLowerCase())
  );

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
            Vouchers
          </h1>

          <p style={{
            margin: 0,
            color: ink2,
            fontSize: '12.5px'
          }}>
            Promo codes and how often they are used · {new Date().toLocaleDateString('en-US', {
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
              placeholder="Search code"
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
              fetchVouchers();
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

      {/* CONTROLS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <p style={{
          margin: 0,
          color: ink2,
          fontSize: '12px'
        }}>
          Vouchers are checked on the server for expiry, usage limit, minimum spend and one use per customer.
        </p>

        <button
          onClick={() => setShowCreateModal(true)}
          className="admin-hover-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 16px',
            height: '38px',
            borderRadius: '10px',
            border: 'none',
            background: pri,
            cursor: 'pointer',
            fontWeight: 700,
            color: 'white',
            fontSize: '12.5px'
          }}
        >
          <IonIcon icon={addOutline} /> Create voucher
        </button>
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
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>CODE</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>DISCOUNT</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>USED</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>EXPIRES</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>STATUS</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>ACTIVE</th>
            </tr>
          </thead>

          <tbody>
            {filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: ink2
                }}>
                  No vouchers found.
                </td>
              </tr>
            ) : (
              filteredVouchers.map((v) => {
                const usedPct = v.usage_limit
                  ? Math.min((v.usage_count / v.usage_limit) * 100, 100)
                  : 0;

                const isExpired = new Date(v.expiration_date) < new Date();

                return (
                  <tr
                    key={v.id}
                    className="admin-table-row"
                    style={{ borderBottom: `1px solid ${line}` }}
                  >
                    <td style={{
                      padding: '16px 8px',
                      fontWeight: 800,
                      fontSize: '14px',
                      color: ink
                    }}>
                      {v.voucher_code}
                    </td>

                    <td style={{
                      padding: '16px 8px',
                      fontSize: '13px',
                      color: ink2
                    }}>
                      {v.discount_type === 'percentage'
                        ? `${v.discount_value}% off · min. ₱${(v.minimum_order_amount_centavos / 100).toFixed(0)}`
                        : `₱${(v.discount_value / 100).toFixed(2)} off · min. ₱${(v.minimum_order_amount_centavos / 100).toFixed(0)}`}
                    </td>

                    <td style={{ padding: '16px 8px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          color: ink
                        }}>
                          {v.usage_count}
                        </span>

                        <span style={{
                          fontSize: '11px',
                          color: ink2
                        }}>
                          of {v.usage_limit}
                        </span>
                      </div>

                      <div style={{
                        height: '5px',
                        background: line,
                        borderRadius: '3px',
                        marginTop: '4px',
                        overflow: 'hidden',
                        width: '100px'
                      }}>
                        <div style={{
                          height: '100%',
                          background: isExpired ? warn : pri,
                          width: `${usedPct}%`
                        }} />
                      </div>
                    </td>

                    <td style={{
                      padding: '16px 8px',
                      fontSize: '13px',
                      color: ink2
                    }}>
                      {new Date(v.expiration_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    <td style={{ padding: '16px 8px' }}>
                      <span style={{
                        background: isExpired ? warnSoft : okSoft,
                        color: isExpired ? warn : ok,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 8px' }}>
                      <div
                        onClick={() => handleToggleActive(v)}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '999px',
                          background: v.is_active && !isExpired ? ok : line,
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '3px',
                          left: v.is_active && !isExpired ? '23px' : '3px',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE VOUCHER MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11,31,68,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: 'min(500px, 90%)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
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
                Create voucher
              </h2>

              <IonIcon
                icon={closeOutline}
                onClick={() => setShowCreateModal(false)}
                style={{
                  fontSize: '24px',
                  color: ink2,
                  cursor: 'pointer'
                }}
              />
            </div>

            <form
              onSubmit={handleCreateVoucher}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: ink2,
                  marginBottom: '6px'
                }}>
                  Code
                </label>

                <input
                  type="text"
                  placeholder="e.g. SUMMER15"
                  required
                  value={formData.voucher_code}
                  onChange={e => setFormData({
                    ...formData,
                    voucher_code: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${line}`,
                    fontSize: '14px',
                    fontFamily: font
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    Discount type
                  </label>

                  <select
                    value={formData.discount_type}
                    onChange={e => setFormData({
                      ...formData,
                      discount_type: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font,
                      background: 'white'
                    }}
                  >
                    <option value="percentage">Percent off</option>
                    <option value="fixed">Fixed amount (₱)</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    {formData.discount_type === 'percentage'
                      ? 'Percent (1-50)'
                      : 'Amount (₱)'}
                  </label>

                  <input
                    type="number"
                    placeholder={formData.discount_type === 'percentage' ? '10' : '50'}
                    required
                    value={formData.discount_value === 0 ? '' : formData.discount_value}
                    onChange={e => setFormData({
                      ...formData,
                      discount_value: e.target.value === '' ? 0 : Number(e.target.value)
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    Minimum order (₱)
                  </label>

                  <input
                    type="number"
                    placeholder="0"
                    value={formData.minimum_order_amount_centavos === 0
                      ? ''
                      : formData.minimum_order_amount_centavos}
                    onChange={e => setFormData({
                      ...formData,
                      minimum_order_amount_centavos: e.target.value === ''
                        ? 0
                        : Number(e.target.value)
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    Usage limit
                  </label>

                  <input
                    type="number"
                    placeholder="100"
                    value={formData.usage_limit === 0 ? '' : formData.usage_limit}
                    onChange={e => setFormData({
                      ...formData,
                      usage_limit: e.target.value === '' ? 0 : Number(e.target.value)
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: ink2,
                  marginBottom: '6px'
                }}>
                  Expires on
                </label>

                <input
                  type="date"
                  required
                  value={formData.expiration_date}
                  onChange={e => setFormData({
                    ...formData,
                    expiration_date: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${line}`,
                    fontSize: '14px',
                    fontFamily: font
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${line}`,
                    background: 'white',
                    color: ink,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: font,
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: pri,
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: font,
                    fontSize: '14px'
                  }}
                >
                  {submitting ? 'Creating...' : 'Create voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminVouchersPage;
