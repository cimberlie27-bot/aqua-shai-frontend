
import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonSpinner,
  IonIcon
} from '@ionic/react';

import { useNavigate } from 'react-router-dom';

import {
  arrowBackOutline,
  receiptOutline,
  timeOutline,
  checkmarkCircleOutline,
  bicycleOutline,
  chevronForwardOutline,
  storefrontOutline,
  closeCircleOutline
} from 'ionicons/icons';

import { api } from '../services/api';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: '#A16B12',
          bg: '#FFF4D6',
          icon: checkmarkCircleOutline
        };

      case 'preparing':
        return {
          label: 'Preparing',
          color: '#2B5DB8',
          bg: '#E6EEFA',
          icon: timeOutline
        };

      case 'ready_for_pickup':
        return {
          label: 'Ready for Pickup',
          color: '#12805C',
          bg: '#DDF5EA',
          icon: storefrontOutline
        };

      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          color: '#1B3D84',
          bg: '#E6EEFA',
          icon: bicycleOutline
        };

      case 'delivered':
        return {
          label: 'Delivered',
          color: '#12805C',
          bg: '#DDF5EA',
          icon: checkmarkCircleOutline
        };

      case 'picked_up':
        return {
          label: 'Picked Up',
          color: '#12805C',
          bg: '#DDF5EA',
          icon: checkmarkCircleOutline
        };

      case 'cancelled':
        return {
          label: 'Cancelled',
          color: '#D9534F',
          bg: '#FFF0EF',
          icon: closeCircleOutline
        };

      default:
        return {
          label: status.replace(/_/g, ' '),
          color: '#64748b',
          bg: '#F0F3F6',
          icon: receiptOutline
        };
    }
  };

  const activeOrders = orders.filter(
    o => o.order_status !== 'delivered' &&
         o.order_status !== 'picked_up' &&
         o.order_status !== 'cancelled'
  );

  const completedOrders = orders.filter(
    o => o.order_status === 'delivered' ||
         o.order_status === 'picked_up' ||
         o.order_status === 'cancelled'
  );

  const renderOrderCard = (order: any, isHistory: boolean) => {
    const statusInfo = getStatusInfo(order.order_status);

    return (
      <div
        key={order.id}
        onClick={() => navigate(`/orders/${order.id}`)}
        style={{
          background: '#FFFFFF',
          borderRadius: '15px',
          padding: '16px',
          marginBottom: '12px',
          border: '1px solid #E1ECE9',
          boxShadow: '0 2px 8px rgba(11,31,68,0.035)',
          cursor: 'pointer'
        }}
      >
        {/* ORDER NUMBER AND STATUS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <div>
            <p style={{
              margin: '0 0 5px',
              fontSize: '10px',
              color: '#94a3b8',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.4px'
            }}>
              Order Number
            </p>

            <h4 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: '800',
              color: '#0B1F44'
            }}>
              #{order.order_number}
            </h4>
          </div>

          <span style={{
            background: statusInfo.bg,
            color: statusInfo.color,
            padding: '7px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap'
          }}>
            <IonIcon
              icon={statusInfo.icon}
              style={{ fontSize: '13px' }}
            />
            {statusInfo.label}
          </span>
        </div>

        {/* DATE */}
        <p style={{
          margin: '8px 0 14px',
          fontSize: '11px',
          color: '#94a3b8'
        }}>
          {new Date(order.created_at).toLocaleString()}
        </p>

        <div style={{
          height: '1px',
          background: '#EDF1F5',
          marginBottom: '13px'
        }} />

        {/* ORDER INFORMATION */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div>
            <p style={{
              margin: '0 0 5px',
              fontSize: '11px',
              color: '#94a3b8'
            }}>
              {order.delivery_method === 'pickup'
                ? 'Store Pickup'
                : 'Home Delivery'}
            </p>

            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#456477',
              fontWeight: '600'
            }}>
              {order.items?.length || 0}{' '}
              {order.items?.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{
              margin: '0 0 4px',
              fontSize: '10px',
              color: '#94a3b8'
            }}>
              Total Amount
            </p>

            <p style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: '900',
              color: '#2B5DB8'
            }}>
              ₱{(order.total_amount_centavos / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* VIEW DETAILS */}
        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid #EDF1F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#2B5DB8'
          }}>
            View Details
          </span>

          <IonIcon
            icon={chevronForwardOutline}
            style={{
              fontSize: '17px',
              color: '#2B5DB8'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' } as any}>

        {/* HEADER */}
        <div style={{
          padding: '20px 19px 0',
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '13px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '1px solid #E1ECE9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <IonIcon
                icon={arrowBackOutline}
                style={{
                  fontSize: '20px',
                  color: '#0B1F44'
                }}
              />
            </button>

            <div>
              <h1 style={{
                margin: 0,
                fontSize: '21px',
                fontWeight: '800',
                color: '#0B1F44'
              }}>
                My Orders
              </h1>

              <p style={{
                margin: '3px 0 0',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                View and track your orders
              </p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '0 18px 35px',
          maxWidth: '480px',
          margin: '0 auto'
        }}>

          {/* LOADING */}
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '70px 0',
              gap: '12px'
            }}>
              <IonSpinner
                name="crescent"
                style={{ color: '#2B5DB8' }}
              />

              <p style={{
                fontSize: '13px',
                color: '#94a3b8'
              }}>
                Loading your orders...
              </p>
            </div>

          ) : orders.length === 0 ? (

            /* EMPTY ORDERS */
            <div style={{
              textAlign: 'center',
              padding: '75px 15px'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '26px',
                background: '#E6EEFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}>
                <IonIcon
                  icon={receiptOutline}
                  style={{
                    fontSize: '43px',
                    color: '#2B5DB8'
                  }}
                />
              </div>

              <h3 style={{
                margin: '0 0 8px',
                fontSize: '18px',
                fontWeight: '800',
                color: '#0B1F44'
              }}>
                No Orders Yet
              </h3>

              <p style={{
                margin: '0 0 22px',
                color: '#94a3b8',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                Your orders will appear here once you place an order.
              </p>

              <button
                onClick={() => navigate('/shop')}
                style={primaryButton}
              >
                Order Water
              </button>
            </div>

          ) : (

            <>
              {/* ACTIVE ORDERS */}
              {activeOrders.length > 0 && (
                <div style={{ marginBottom: '26px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '13px'
                  }}>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '800',
                        color: '#0B1F44'
                      }}>
                        Active Orders
                      </h3>

                      <p style={{
                        margin: '3px 0 0',
                        fontSize: '11px',
                        color: '#94a3b8'
                      }}>
                        Orders currently being processed
                      </p>
                    </div>

                    <span style={{
                      background: '#E6EEFA',
                      color: '#2B5DB8',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}>
                      {activeOrders.length}
                    </span>
                  </div>

                  {activeOrders.map(order =>
                    renderOrderCard(order, false)
                  )}
                </div>
              )}

              {/* ORDER HISTORY */}
              {completedOrders.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '13px'
                  }}>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '800',
                        color: '#0B1F44'
                      }}>
                        Order History
                      </h3>

                      <p style={{
                        margin: '3px 0 0',
                        fontSize: '11px',
                        color: '#94a3b8'
                      }}>
                        Your previous orders
                      </p>
                    </div>

                    <span style={{
                      background: '#DDF5EA',
                      color: '#12805C',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}>
                      {completedOrders.length}
                    </span>
                  </div>

                  {completedOrders.map(order =>
                    renderOrderCard(order, true)
                  )}
                </div>
              )}

              {/* NO ACTIVE ORDERS */}
              {activeOrders.length === 0 && completedOrders.length > 0 && (
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E1ECE9',
                  borderRadius: '13px',
                  padding: '14px',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    style={{
                      fontSize: '22px',
                      color: '#12A06B'
                    }}
                  />

                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#456477'
                  }}>
                    You have no active orders right now.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

const primaryButton: React.CSSProperties = {
  background: '#2B5DB8',
  color: '#FFFFFF',
  border: 'none',
  padding: '13px 25px',
  borderRadius: '12px',
  fontWeight: '700',
  fontSize: '14px'
};

export default OrdersPage;
