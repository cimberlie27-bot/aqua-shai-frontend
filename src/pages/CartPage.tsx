
import { useContext } from 'react';
import {
  IonContent,
  IonPage,
  IonIcon
} from '@ionic/react';

import { useNavigate } from 'react-router-dom';

import {
  trashOutline,
  waterOutline,
  addOutline,
  removeOutline,
  cartOutline,
  arrowForwardOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { CartContext } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { cart, removeItem, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price_centavos * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleIncrement = (item: any) => {
    addToCart({
      product_id: item.product_id,
      product_name: item.product_name,
      price_centavos: item.price_centavos,
      quantity: 1,
      option: item.option,
    });
  };

  const handleDecrement = (index: number, item: any) => {
    if (item.quantity <= 1) {
      removeItem(index);
      return;
    }

    removeItem(index);

    addToCart({
      product_id: item.product_id,
      product_name: item.product_name,
      price_centavos: item.price_centavos,
      quantity: item.quantity - 1,
      option: item.option,
    });
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        style={{ '--background': '#EEF6F4' }}
      >

        {/* HEADER - SAME AS WALLET */}
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
                My Cart
              </h1>

              <p style={{
                margin: '3px 0 0',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                Review your selected water products
              </p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '0 18px 35px',
          maxWidth: '480px',
          margin: '0 auto'
        }}>

          {cart.length === 0 ? (

            /* EMPTY CART */
            <div
              style={{
                textAlign: 'center',
                padding: '75px 15px'
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '30px',
                  background: '#DCEBE8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <IonIcon
                  icon={cartOutline}
                  style={{ fontSize: '48px', color: '#2B5DB8' }}
                />
              </div>

              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: '19px',
                  fontWeight: '800',
                  color: '#0B1F44'
                }}
              >
                Your cart is empty
              </h3>

              <p
                style={{
                  margin: '0 0 22px',
                  fontSize: '13px',
                  color: '#718096'
                }}
              >
                You haven't added any products yet.
              </p>

              <button
                onClick={() => navigate('/shop')}
                style={{
                  background: '#2B5DB8',
                  color: 'white',
                  border: 'none',
                  padding: '13px 25px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
              >
                Browse Products
              </button>
            </div>

          ) : (

            <>
              {/* CART SECTION TITLE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px'
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#0B1F44'
                  }}
                >
                  Selected Items
                </h3>

                <span
                  style={{
                    fontSize: '12px',
                    color: '#2B5DB8',
                    fontWeight: '700'
                  }}
                >
                  {totalItems} items
                </span>
              </div>

              {/* CART ITEMS */}
              {cart.map((item, index) => (
                <div
                  key={`${item.product_id}-${item.option}`}
                  style={{
                    background: 'white',
                    borderRadius: '17px',
                    padding: '14px',
                    marginBottom: '12px',
                    border: '1px solid #E1ECE9',
                    boxShadow: '0 3px 12px rgba(11,31,68,0.04)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  {/* PRODUCT ICON */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      flexShrink: 0,
                      borderRadius: '14px',
                      background: '#E6F1F8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IonIcon
                      icon={waterOutline}
                      style={{
                        fontSize: '31px',
                        color: '#2B5DB8'
                      }}
                    />
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        margin: '0 0 5px',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: '#0B1F44'
                      }}
                    >
                      {item.product_name}
                    </h4>

                    <span
                      style={{
                        display: 'inline-block',
                        background: '#E8F2EF',
                        color: '#267A65',
                        padding: '4px 9px',
                        borderRadius: '7px',
                        fontSize: '10px',
                        fontWeight: '800',
                        marginBottom: '6px'
                      }}
                    >
                      {item.option}
                    </span>

                    <p
                      style={{
                        margin: '0 0 9px',
                        fontSize: '12px',
                        color: '#718096'
                      }}
                    >
                      ₱{(item.price_centavos / 100).toFixed(2)} each
                    </p>

                    {/* QUANTITY AND PRICE */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '5px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#F1F6F5',
                          borderRadius: '9px',
                          padding: '3px',
                          gap: '10px'
                        }}
                      >
                        <button
                          onClick={() => handleDecrement(index, item)}
                          style={{
                            width: '27px',
                            height: '27px',
                            border: 'none',
                            borderRadius: '7px',
                            background: 'white',
                            color: '#2B5DB8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IonIcon icon={removeOutline} />
                        </button>

                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            color: '#0B1F44',
                            minWidth: '13px',
                            textAlign: 'center'
                          }}
                        >
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => handleIncrement(item)}
                          style={{
                            width: '27px',
                            height: '27px',
                            border: 'none',
                            borderRadius: '7px',
                            background: '#2B5DB8',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IonIcon icon={addOutline} />
                        </button>
                      </div>

                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: '800',
                          color: '#2B5DB8'
                        }}
                      >
                        ₱{((item.price_centavos * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => removeItem(index)}
                    style={{
                      alignSelf: 'flex-start',
                      border: 'none',
                      background: '#FFF0EF',
                      borderRadius: '9px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IonIcon
                      icon={trashOutline}
                      style={{
                        fontSize: '17px',
                        color: '#D9534F'
                      }}
                    />
                  </button>
                </div>
              ))}

              {/* ORDER SUMMARY */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '18px',
                  marginTop: '22px',
                  border: '1px solid #E1ECE9',
                  boxShadow: '0 3px 12px rgba(11,31,68,0.04)'
                }}
              >
                <h3
                  style={{
                    margin: '0 0 17px',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#0B1F44'
                  }}
                >
                  Order Summary
                </h3>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '13px',
                    fontSize: '13px',
                    color: '#718096'
                  }}
                >
                  <span>Total Items</span>
                  <span style={{ color: '#0B1F44', fontWeight: '700' }}>
                    {totalItems}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: '1px dashed #D9E5E2',
                    paddingTop: '15px',
                    marginBottom: '18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: '800',
                      color: '#0B1F44'
                    }}
                  >
                    Total Amount
                  </span>

                  <span
                    style={{
                      fontSize: '21px',
                      fontWeight: '900',
                      color: '#2B5DB8'
                    }}
                  >
                    ₱{(subtotal / 100).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2B5DB8, #1B3D84)',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '800',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '9px',
                    boxShadow: '0 5px 12px rgba(43,93,184,0.18)'
                  }}
                >
                  Proceed to Checkout
                  <IonIcon icon={arrowForwardOutline} />
                </button>
              </div>
            </>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default CartPage;
