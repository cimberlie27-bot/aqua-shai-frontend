
import { useState, useEffect, useContext } from 'react';
import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import {
  checkmarkCircle,
  bicycleOutline,
  homeOutline,
  timeOutline,
  storefrontOutline,
  callOutline,
  arrowBackOutline,
  receiptOutline,
  locationOutline,
  walletOutline,
  closeCircle
} from 'ionicons/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CartContext } from '../context/CartContext';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonContent style={{ '--background': '#EEF6F4' } as any}>
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IonSpinner style={{ color: '#2B5DB8' }} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!order) {
    return (
      <IonPage>
        <IonContent style={{ '--background': '#EEF6F4' } as any}>
          <div style={{ padding: '50px 24px', textAlign: 'center' }}>
            <h3 style={{ color: '#0B1F44' }}>Order not found.</h3>
            <button onClick={() => navigate(-1)} style={primaryButton}>
              Go Back
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const isPickup = order.delivery_method === 'pickup';
  const isCompleted =
    order.order_status === 'delivered' ||
    order.order_status === 'picked_up';

  const isOutForDelivery = order.order_status === 'out_for_delivery';
  const isConfirmed = order.order_status === 'confirmed';
  const isCancelled = order.order_status === 'cancelled';

  const statuses = isPickup
    ? ['confirmed', 'preparing', 'ready_for_pickup', 'picked_up']
    : ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];

  const currentIndex = statuses.indexOf(order.order_status);

  const statusLabel: Record<string, string> = {
    confirmed: 'Order Confirmed',
    preparing: 'Preparing',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    picked_up: 'Picked Up',
    cancelled: 'Cancelled',
  };

  const timelineSteps = isPickup
    ? [
        { key: 'confirmed', label: 'Order Confirmed', icon: checkmarkCircle },
        { key: 'preparing', label: 'Preparing', icon: timeOutline },
        { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: storefrontOutline },
        { key: 'picked_up', label: 'Picked Up', icon: checkmarkCircle },
      ]
    : [
        { key: 'confirmed', label: 'Order Confirmed', icon: checkmarkCircle },
        { key: 'preparing', label: 'Preparing', icon: timeOutline },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: bicycleOutline },
        { key: 'delivered', label: 'Delivered', icon: homeOutline },
      ];

  const getStepStatus = (index: number) => {
    if (isCompleted) return 'completed';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order? Your funds will be refunded to your wallet.")) {
      try {
        setIsCancelling(true);
        await api.patch(`/orders/${id}/cancel`);
        alert("Order cancelled successfully.");
        window.location.reload();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to cancel order.");
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handleReorder = () => {
    order.items.forEach((item: any) => {
      addToCart({
        product_id: item.product_id,
        product_name: item.product_name_snapshot,
        price_centavos: item.unit_price_centavos,
        quantity: item.quantity,
        option: 'Refill'
      });
    });

    navigate('/cart');
  };

  const sectionStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '14px',
    border: '1px solid #E1ECE9',
    boxShadow: '0 2px 8px rgba(11,31,68,0.035)'
  };

  const sectionTitle: React.CSSProperties = {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#0B1F44'
  };

  const labelStyle: React.CSSProperties = {
    color: '#8495A5',
    fontSize: '12px',
    fontWeight: '500'
  };

  const valueStyle: React.CSSProperties = {
    color: '#0B1F44',
    fontSize: '13px',
    fontWeight: '700'
  };

  const paymentStatus = String(order.payment_status || 'Pending')
    .replace(/_/g, ' ');

  const paymentMethod = String(order.payment_method || 'Not specified')
    .replace(/_/g, ' ');

  const deliveryMethod = isPickup ? 'Store Pickup' : 'Home Delivery';

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' } as any}>
        <div style={{
          padding: '20px 19px 35px',
          maxWidth: '480px',
          margin: '0 auto'
        }}>

          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '13px',
            marginBottom: '22px'
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
                style={{ fontSize: '20px', color: '#0B1F44' }}
              />
            </button>

            <div>
              <h1 style={{
                margin: 0,
                fontSize: '21px',
                fontWeight: '800',
                color: '#0B1F44'
              }}>
                Order Details
              </h1>

              <p style={{
                margin: '3px 0 0',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                View your order information
              </p>
            </div>
          </div>

          {/* LIVE GPS MAP */}
          {isOutForDelivery && (
            <div style={{
              background: '#E6EEFA',
              height: '185px',
              borderRadius: '17px',
              marginBottom: '14px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid #C9D9F2'
            }}>
              <div style={{
                position: 'absolute',
                top: '13px',
                left: '13px',
                background: '#12A06B',
                color: '#FFFFFF',
                padding: '7px 11px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  background: '#FFFFFF',
                  borderRadius: '50%'
                }} />
                LIVE GPS
              </div>

              <div style={{
                position: 'absolute',
                bottom: '13px',
                left: '13px',
                background: '#FFFFFF',
                padding: '9px 12px',
                borderRadius: '11px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#0B1F44',
                boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                zIndex: 2
              }}>
                🛵 {order.rider_name || 'Rider'} · 1.2 km away · ~8 min
              </div>

              <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <path
                  d="M 30 155 Q 150 35 300 65"
                  fill="transparent"
                  stroke="#2B5DB8"
                  strokeWidth="4"
                  strokeDasharray="8 8"
                />
                <circle cx="30" cy="155" r="9" fill="#2B5DB8" />
                <circle cx="300" cy="65" r="9" fill="#E85D5D" />
              </svg>
            </div>
          )}

          {/* ORDER STATUS */}
          <div style={{
            background: isCompleted
              ? 'linear-gradient(135deg, #12A06B, #087F55)'
              : isCancelled
              ? 'linear-gradient(135deg, #E56B6B, #C94D4D)'
              : 'linear-gradient(135deg, #2B5DB8, #1B3D84)',
            borderRadius: '17px',
            padding: '20px',
            color: '#FFFFFF',
            marginBottom: '14px',
            boxShadow: '0 5px 13px rgba(43,93,184,0.12)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div>
                <p style={{
                  margin: '0 0 7px',
                  fontSize: '12px',
                  opacity: 0.85
                }}>
                  CURRENT ORDER STATUS
                </p>

                <h2 style={{
                  margin: 0,
                  fontSize: '21px',
                  fontWeight: '800'
                }}>
                  {statusLabel[order.order_status] ??
                    order.order_status.replace(/_/g, ' ')}
                </h2>
              </div>

              <div style={{
                width: '43px',
                height: '43px',
                borderRadius: '13px',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IonIcon
                  icon={
                    isCancelled
                      ? closeCircle
                      : isCompleted
                      ? checkmarkCircle
                      : isPickup
                      ? storefrontOutline
                      : bicycleOutline
                  }
                  style={{ fontSize: '25px' }}
                />
              </div>
            </div>

            <div style={{
              height: '1px',
              background: 'rgba(255,255,255,0.22)',
              margin: '15px 0 12px'
            }} />

            <p style={{
              margin: 0,
              fontSize: '12px',
              opacity: 0.9
            }}>
              Order Number
            </p>

            <p style={{
              margin: '4px 0 0',
              fontSize: '14px',
              fontWeight: '800'
            }}>
              #{order.order_number}
            </p>
          </div>

          {/* CANCELLED NOTICE */}
          {isCancelled && (
            <div style={{
              ...sectionStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#FFF5F5',
              border: '1px solid #F4CDCD'
            }}>
              <IonIcon
                icon={closeCircle}
                style={{ fontSize: '24px', color: '#D95353' }}
              />

              <div>
                <h3 style={{
                  margin: '0 0 4px',
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#C94D4D'
                }}>
                  This order has been cancelled
                </h3>

                <p style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#946060',
                  lineHeight: '1.5'
                }}>
                  This order will no longer proceed.
                </p>
              </div>
            </div>
          )}

          {/* ORDER PROGRESS */}
          {!isCancelled && (
            <div style={sectionStyle}>
              <div style={{ marginBottom: '19px' }}>
                <h3 style={sectionTitle}>Order Progress</h3>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  Follow the progress of your order
                </p>
              </div>

              {timelineSteps.map((step, index) => {
                const status = getStepStatus(index);
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      position: 'relative',
                      paddingBottom:
                        index !== timelineSteps.length - 1 ? '25px' : 0
                    }}
                  >
                    {index !== timelineSteps.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '15px',
                        top: '32px',
                        bottom: 0,
                        width: '2px',
                        background:
                          status === 'completed' ? '#12A06B' : '#E6EEFA'
                      }} />
                    )}

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background:
                        status === 'completed'
                          ? '#DDF5EA'
                          : status === 'active'
                          ? '#E6EEFA'
                          : '#F0F3F6',
                      border:
                        status === 'active'
                          ? '2px solid #2B5DB8'
                          : 'none',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <IonIcon
                        icon={StepIcon}
                        style={{
                          fontSize: '16px',
                          color:
                            status === 'completed'
                              ? '#12A06B'
                              : status === 'active'
                              ? '#2B5DB8'
                              : '#B6C4CC'
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, paddingTop: '3px' }}>
                      <h4 style={{
                        margin: '0 0 4px',
                        fontSize: '13px',
                        fontWeight: '800',
                        color:
                          status === 'completed'
                            ? '#12A06B'
                            : status === 'active'
                            ? '#0B1F44'
                            : '#A0AFB8'
                      }}>
                        {step.label}
                      </h4>

                      <p style={{
                        margin: 0,
                        fontSize: '11px',
                        color: '#94a3b8'
                      }}>
                        {status === 'completed'
                          ? 'Completed'
                          : status === 'active'
                          ? 'Currently in progress'
                          : 'Waiting for this step'}
                      </p>
                    </div>

                    {status === 'active' && (
                      <span style={{
                        alignSelf: 'center',
                        background: '#E6EEFA',
                        color: '#2B5DB8',
                        padding: '5px 8px',
                        borderRadius: '7px',
                        fontSize: '9px',
                        fontWeight: '800'
                      }}>
                        NOW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* RIDER INFORMATION */}
          {isOutForDelivery && order.rider_name && (
            <div style={sectionStyle}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginBottom: '16px'
              }}>
                <IonIcon
                  icon={bicycleOutline}
                  style={{ color: '#2B5DB8', fontSize: '20px' }}
                />

                <h3 style={sectionTitle}>Delivery Rider</h3>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '11px',
                  alignItems: 'center',
                  minWidth: 0
                }}>
                  <div style={{
                    width: '43px',
                    height: '43px',
                    borderRadius: '12px',
                    background: '#E6EEFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IonIcon
                      icon={bicycleOutline}
                      style={{ color: '#2B5DB8', fontSize: '22px' }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h4 style={{
                      margin: '0 0 4px',
                      fontSize: '13px',
                      fontWeight: '800',
                      color: '#0B1F44'
                    }}>
                      {order.rider_name}
                    </h4>

                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      color: '#94a3b8'
                    }}>
                      Assigned delivery rider
                    </p>
                  </div>
                </div>

                {order.rider_contact && (
                  <a
                    href={`tel:${order.rider_contact}`}
                    style={{
                      background: '#2B5DB8',
                      color: '#FFFFFF',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0
                    }}
                  >
                    <IonIcon icon={callOutline} />
                    Call
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ORDER SUMMARY */}
          <div style={sectionStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '17px'
            }}>
              <IonIcon
                icon={receiptOutline}
                style={{ color: '#2B5DB8', fontSize: '19px' }}
              />

              <h3 style={sectionTitle}>Order Summary</h3>
            </div>

            {order.items.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  paddingBottom: '13px',
                  marginBottom: '13px',
                  borderBottom:
                    idx !== order.items.length - 1
                      ? '1px solid #F0F3F6'
                      : 'none'
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: '0 0 4px',
                    color: '#0B1F44',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}>
                    {item.product_name_snapshot}
                  </p>

                  <p style={{
                    margin: 0,
                    color: '#94a3b8',
                    fontSize: '11px'
                  }}>
                    Quantity: {item.quantity}
                  </p>
                </div>

                <span style={{
                  ...valueStyle,
                  whiteSpace: 'nowrap'
                }}>
                  ₱{((item.unit_price_centavos * item.quantity) / 100).toFixed(2)}
                </span>
              </div>
            ))}

            <div style={{
              background: '#F4F7FC',
              borderRadius: '11px',
              padding: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{
                  margin: '0 0 3px',
                  color: '#64748b',
                  fontSize: '11px'
                }}>
                  Total Amount
                </p>

                <p style={{
                  margin: 0,
                  color: '#0B1F44',
                  fontSize: '18px',
                  fontWeight: '800'
                }}>
                  ₱{(order.total_amount_centavos / 100).toFixed(2)}
                </p>
              </div>

              <IonIcon
                icon={receiptOutline}
                style={{ fontSize: '24px', color: '#2B5DB8' }}
              />
            </div>
          </div>

          {/* DELIVERY INFORMATION */}
          <div style={sectionStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '17px'
            }}>
              <IonIcon
                icon={locationOutline}
                style={{ color: '#2B5DB8', fontSize: '19px' }}
              />

              <h3 style={sectionTitle}>Delivery Information</h3>
            </div>

            <div style={{
              background: '#F4F7FC',
              padding: '13px',
              borderRadius: '11px',
              marginBottom: order.delivery_address ? '13px' : 0
            }}>
              <p style={{
                ...labelStyle,
                margin: '0 0 5px'
              }}>
                Delivery Method
              </p>

              <p style={{
                ...valueStyle,
                margin: 0
              }}>
                {deliveryMethod}
              </p>
            </div>

            {order.delivery_address && (
              <div style={{
                background: '#F4F7FC',
                padding: '13px',
                borderRadius: '11px'
              }}>
                <p style={{
                  ...labelStyle,
                  margin: '0 0 5px'
                }}>
                  Delivery Address
                </p>

                <p style={{
                  ...valueStyle,
                  margin: 0,
                  lineHeight: '1.5',
                  wordBreak: 'break-word'
                }}>
                  {order.delivery_address}
                </p>
              </div>
            )}
          </div>

          {/* PAYMENT INFORMATION */}
          <div style={sectionStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '17px'
            }}>
              <IonIcon
                icon={walletOutline}
                style={{ color: '#2B5DB8', fontSize: '20px' }}
              />

              <h3 style={sectionTitle}>Payment Information</h3>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '13px',
              marginBottom: '13px',
              borderBottom: '1px solid #F0F3F6'
            }}>
              <div>
                <p style={{
                  ...labelStyle,
                  margin: '0 0 4px'
                }}>
                  Payment Method
                </p>

                <p style={{
                  ...valueStyle,
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {paymentMethod}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div>
                <p style={{
                  ...labelStyle,
                  margin: '0 0 4px'
                }}>
                  Payment Status
                </p>

                <p style={{
                  ...valueStyle,
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {paymentStatus}
                </p>
              </div>

              <span style={{
                background:
                  String(order.payment_status).toLowerCase() === 'paid'
                    ? '#DDF5EA'
                    : '#FFF4D6',
                color:
                  String(order.payment_status).toLowerCase() === 'paid'
                    ? '#12805C'
                    : '#A16B12',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'capitalize'
              }}>
                {paymentStatus}
              </span>
            </div>
          </div>

          {/* REORDER */}
          {isCompleted && (
            <button
              onClick={handleReorder}
              style={{
                ...primaryButton,
                marginTop: '3px',
                marginBottom: '12px'
              }}
            >
              Order Again
            </button>
          )}

          {/* CANCEL ORDER */}
          {isConfirmed && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                background: '#FFF0F0',
                color: '#D95353',
                fontWeight: '800',
                border: '1px solid #F4CDCD',
                fontSize: '13px',
                marginTop: '3px',
                opacity: isCancelling ? 0.5 : 1
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

const primaryButton: React.CSSProperties = {
  width: '100%',
  height: '50px',
  borderRadius: '13px',
  background: '#2B5DB8',
  color: '#FFFFFF',
  fontWeight: '800',
  border: 'none',
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px'
};

export default OrderDetailsPage;
