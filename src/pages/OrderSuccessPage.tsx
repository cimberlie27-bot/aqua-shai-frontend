
import { useLocation, useNavigate } from 'react-router-dom';
import { IonContent, IonPage, IonIcon } from '@ionic/react';
import {
  checkmarkCircle,
  receiptOutline,
  homeOutline,
  waterOutline
} from 'ionicons/icons';

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  const formatPrice = (amount: number) =>
    `₱${((amount || 0) / 100).toFixed(2)}`;

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' } as any}>
        <div style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '35px 18px 30px',
          boxSizing: 'border-box'
        }}>

          {/* SUCCESS ICON */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#E6EEFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IonIcon
                icon={checkmarkCircle}
                style={{ fontSize: '55px', color: '#12A06B' }}
              />
            </div>
          </div>

          <h1 style={{
            fontSize: '25px',
            fontWeight: '800',
            color: '#0B1F44',
            margin: '0 0 8px',
            textAlign: 'center'
          }}>
            Order Placed!
          </h1>

          <p style={{
            color: '#94a3b8',
            fontSize: '13px',
            lineHeight: '1.6',
            textAlign: 'center',
            margin: '0 10px 25px'
          }}>
            Thank you for choosing Aqua Shai!
            Your order has been submitted successfully.
          </p>

          {/* RECEIPT */}
          {order && (
            <div style={{
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '22px 18px',
              boxSizing: 'border-box',
              border: '1px solid #E1ECE9',
              boxShadow: '0 4px 14px rgba(11,31,68,0.06)',
              marginBottom: '25px'
            }}>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <IonIcon
                  icon={waterOutline}
                  style={{ fontSize: '30px', color: '#2B5DB8' }}
                />
                <h2 style={{
                  margin: '5px 0',
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#0B1F44'
                }}>
                  AQUA SHAI
                </h2>
                <p style={{
                  margin: 0,
                  color: '#94a3b8',
                  fontSize: '11px'
                }}>
                  WATER REFILLING STATION
                </p>
                <p style={{
                  margin: '5px 0 0',
                  color: '#94a3b8',
                  fontSize: '11px'
                }}>
                  ORDER RECEIPT
                </p>
              </div>

              <div style={{
                borderTop: '1px dashed #C9D9E1',
                borderBottom: '1px dashed #C9D9E1',
                padding: '13px 0',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '7px',
                  gap: '10px'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Order Number
                  </span>
                  <span style={{
                    color: '#0B1F44',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {order.order_number}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Date & Time
                  </span>
                  <span style={{
                    color: '#0B1F44',
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'right'
                  }}>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* ITEMS */}
              <h3 style={{
                margin: '0 0 13px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#0B1F44'
              }}>
                Order Items
              </h3>

              {order.items?.map((item: any, index: number) => (
                <div key={item.id || index} style={{
                  marginBottom: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: '0 0 4px',
                        fontSize: '13px',
                        color: '#0B1F44',
                        fontWeight: '700'
                      }}>
                        {item.product_name_snapshot}
                      </p>

                      <p style={{
                        margin: 0,
                        fontSize: '11px',
                        color: '#94a3b8'
                      }}>
                        {item.refill_option || item.container_type || 'Water'}
                        {' '}× {item.quantity}
                      </p>
                    </div>

                    <span style={{
                      fontSize: '13px',
                      color: '#0B1F44',
                      fontWeight: '700',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatPrice(item.subtotal_centavos)}
                    </span>
                  </div>

                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '10px',
                    color: '#94a3b8'
                  }}>
                    {formatPrice(item.unit_price_centavos)} each
                  </p>
                </div>
              ))}

              <div style={{
                borderTop: '1px dashed #C9D9E1',
                marginTop: '8px',
                paddingTop: '14px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '9px'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    Subtotal
                  </span>
                  <span style={{ color: '#0B1F44', fontSize: '12px' }}>
                    {formatPrice(order.subtotal_centavos)}
                  </span>
                </div>

                {order.discount_amount_centavos > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '9px'
                  }}>
                    <span style={{ color: '#12A06B', fontSize: '12px' }}>
                      Discount
                    </span>
                    <span style={{
                      color: '#12A06B',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      -{formatPrice(order.discount_amount_centavos)}
                    </span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#E6EEFA',
                  borderRadius: '10px',
                  padding: '13px',
                  marginTop: '13px'
                }}>
                  <span style={{
                    color: '#1B3D84',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}>
                    TOTAL
                  </span>
                  <span style={{
                    color: '#2B5DB8',
                    fontSize: '20px',
                    fontWeight: '800'
                  }}>
                    {formatPrice(order.total_amount_centavos)}
                  </span>
                </div>
              </div>

              {/* PAYMENT AND DELIVERY */}
              <div style={{
                marginTop: '17px',
                paddingTop: '14px',
                borderTop: '1px dashed #C9D9E1'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Payment Method
                  </span>
                  <span style={{
                    color: '#0B1F44',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    {order.payment_method}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Payment Status
                  </span>
                  <span style={{
                    color: order.payment_status === 'paid' ? '#12A06B' : '#B7791F',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    {order.payment_status}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Delivery Method
                  </span>
                  <span style={{
                    color: '#0B1F44',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'capitalize'
                  }}>
                    {order.delivery_method}
                  </span>
                </div>

                {order.delivery_address && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{
                      margin: '0 0 4px',
                      color: '#94a3b8',
                      fontSize: '11px'
                    }}>
                      Delivery Address
                    </p>
                    <p style={{
                      margin: 0,
                      color: '#0B1F44',
                      fontSize: '12px',
                      lineHeight: '1.5'
                    }}>
                      {order.delivery_address}
                    </p>
                  </div>
                )}
              </div>

              <div style={{
                textAlign: 'center',
                borderTop: '1px dashed #C9D9E1',
                marginTop: '18px',
                paddingTop: '15px'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#94a3b8'
                }}>
                  Thank you for ordering!
                </p>
                <p style={{
                  margin: '5px 0 0',
                  fontSize: '10px',
                  color: '#94a3b8'
                }}>
                  Aqua Shai Water Refilling Station
                </p>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <button
            onClick={() => navigate('/orders')}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '13px',
              background: '#2B5DB8',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '15px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(43,93,184,0.25)'
            }}
          >
            <IonIcon icon={receiptOutline} style={{ fontSize: '19px' }} />
            Track Order
          </button>

          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '13px',
              background: '#FFFFFF',
              color: '#2B5DB8',
              border: '1px solid #2B5DB8',
              fontSize: '15px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px'
            }}
          >
            <IonIcon icon={homeOutline} style={{ fontSize: '19px' }} />
            Back to Home
          </button>

          <p style={{
            color: '#94a3b8',
            fontSize: '11px',
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <IonIcon icon={waterOutline} />
            Aqua Shai Water Refilling Station
          </p>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrderSuccessPage;
