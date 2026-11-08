
import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  searchOutline,
  refreshOutline,
  notificationsOutline
} from 'ionicons/icons';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

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

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(o => {
    const searchTerm = search.toLowerCase();

    const matchSearch =
      (o.order_number || String(o.id)).toLowerCase().includes(searchTerm) ||
      (o.customer_name || '').toLowerCase().includes(searchTerm);

    const matchType =
      typeFilter === 'All' ||
      (o.delivery_method || '').toLowerCase() === typeFilter.toLowerCase();

    const matchStatus =
      statusFilter === 'all' || o.order_status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const counts = {
    all: orders.length,
    new: orders.filter(o => o.order_status === 'confirmed').length,
    preparing: orders.filter(o => o.order_status === 'preparing').length,
    out: orders.filter(o => o.order_status === 'out_for_delivery').length,
    ready: orders.filter(o => o.order_status === 'ready_for_pickup').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    cancelled: orders.filter(o => o.order_status === 'cancelled').length,
  };

  const handleNotificationClick = () => {
    setStatusFilter('confirmed');
    setTypeFilter('All');
    setSearch('');
  };

  const getPill = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#FFF1D6', color: '#C77700', label: 'New' };
      case 'preparing':
        return { bg: '#E6EEFA', color: '#2B5DB8', label: 'Preparing' };
      case 'out_for_delivery':
        return { bg: '#E6EEFA', color: '#2B5DB8', label: 'Out for delivery' };
      case 'ready_for_pickup':
        return { bg: '#DDF5EA', color: '#12A06B', label: 'Ready to pick up' };
      case 'delivered':
        return { bg: '#DDF5EA', color: '#12A06B', label: 'Delivered' };
      case 'cancelled':
        return { bg: '#FDE4E7', color: '#D6384A', label: 'Cancelled' };
      default:
        return { bg: '#f1f5f9', color: '#64748b', label: status };
    }
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
            Orders
          </h1>

          <p style={{
            margin: 0,
            color: ink2,
            fontSize: '12.5px'
          }}>
            Everything customers have ordered · {new Date().toLocaleDateString('en-US', {
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
              placeholder="Search order # or customer"
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

          <button
            onClick={fetchOrders}
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
          <button
            onClick={handleNotificationClick}
            title={`${counts.new} new orders`}
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

            {counts.new > 0 && (
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
                {counts.new > 99 ? '99+' : counts.new}
              </span>
            )}
          </button>

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
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>

        {/* TYPE */}
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
            Type
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '3px',
            border: `1px solid ${line}`,
            borderRadius: '14px',
            background: '#EEF6F4'
          }}>
            {['All', 'Delivery', 'Pick up'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '11px',
                  border: 'none',
                  background: typeFilter === t ? 'white' : 'transparent',
                  color: typeFilter === t ? ink : ink2,
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: typeFilter === t
                    ? '0 1px 4px rgba(11,31,68,0.08)'
                    : 'none'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: ink2
          }}>
            Status
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'confirmed', label: 'New', count: counts.new },
              { key: 'preparing', label: 'Preparing', count: counts.preparing },
              { key: 'ready_for_pickup', label: 'Ready to pick up', count: counts.ready },
              { key: 'out_for_delivery', label: 'Out for delivery', count: counts.out },
              { key: 'delivered', label: 'Delivered', count: counts.delivered },
              { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 15px',
                  borderRadius: '24px',
                  border: `1.5px solid ${statusFilter === s.key ? pri : line}`,
                  background: statusFilter === s.key ? pri : 'white',
                  color: statusFilter === s.key ? 'white' : ink,
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {s.label}

                <span style={{
                  color: statusFilter === s.key ? 'white' : ink2,
                  fontWeight: 700,
                  fontSize: '12px'
                }}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>
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
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>ORDER</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>CUSTOMER</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>ITEMS</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>TOTAL</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>STATUS</th>
              <th style={{ padding: '13px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2 }}>RIDER</th>
              <th style={{ padding: '13px 8px' }}></th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: ink2
                }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const pill = getPill(order.order_status);

                return (
                  <tr
                    key={order.id}
                    className="admin-table-row"
                    style={{ borderBottom: `1px solid ${line}` }}
                  >
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '13.5px',
                        color: ink
                      }}>
                        #{order.id}
                      </div>

                      <div style={{
                        fontSize: '11.5px',
                        color: ink2,
                        marginTop: '2px'
                      }}>
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td style={{ padding: '14px 8px' }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '13.5px',
                        color: ink
                      }}>
                        {order.customer_name || 'Customer'}
                      </div>

                      <div style={{
                        fontSize: '11.5px',
                        color: ink2,
                        marginTop: '2px'
                      }}>
                        {order.customer_contact || 'N/A'}
                      </div>
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      fontSize: '12.5px',
                      color: ink,
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {order.items?.map((i: any) => `${i.quantity}x ${i.product_name_snapshot}`).join(', ') || 'No items'}
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: ink
                    }}>
                      ₱{(order.total_amount_centavos / 100).toFixed(2)}
                    </td>

                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        background: pill.bg,
                        color: pill.color,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {pill.label}
                      </span>
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      fontSize: '12.5px',
                      color: ink2
                    }}>
                      {order.rider_name || '—'}
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      textAlign: 'right'
                    }}>
                      {order.order_status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(order.id, 'preparing')}
                          className="admin-hover-btn"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${priSoft}`,
                            background: priSoft,
                            color: pri,
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Start preparing
                        </button>
                      )}

                      {order.order_status === 'ready_for_pickup' && (
                        <button
                          onClick={() => updateStatus(order.id, 'picked_up')}
                          className="admin-hover-btn"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#12A06B',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark picked up
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
