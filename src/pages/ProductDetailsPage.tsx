
import { useState, useEffect, useContext } from 'react';
import {
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonSpinner,
  IonToast
} from '@ionic/react';

import {
  waterOutline,
  add,
  remove,
  cartOutline
} from 'ionicons/icons';

import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CartContext } from '../context/CartContext';

const ProductDetailsPage: React.FC = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('Refill');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setLoading(true);

    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
      })
      .catch(error => {
        console.error('Error loading product:', error);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonContent
          style={{ '--background': '#EEF6F4' } as any}
          className="ion-padding"
        >
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh'
          }}>
            <IonSpinner name="crescent" color="primary" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!product) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/shop" />
            </IonButtons>
            <IonTitle>Product Details</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent style={{ '--background': '#EEF6F4' } as any}>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            Product not found.
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const is20L = product.product_name
    ?.toLowerCase()
    .includes('20l');

  const productPrice = Number(product.price_centavos || 0);

  const totalPrice = productPrice * quantity;

  const handleAddToCart = () => {

    addToCart({
      product_id: product.id,
      product_name: product.product_name,
      price_centavos: productPrice,
      quantity: quantity,
      service_type: selectedType
    } as any);

    setShowToast(true);

    navigate('/cart');
  };

  const changeQuantity = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const formatPrice = (price: number) => {
    return `₱${(price / 100).toFixed(2)}`;
  };

  return (
    <IonPage>

      {/* HEADER */}
      <IonHeader>
        <IonToolbar
          style={{
            '--background': '#2B5DB8',
            '--color': 'white'
          } as any}
        >
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/shop"
              style={{ '--color': 'white' } as any}
            />
          </IonButtons>

          <IonTitle style={{ fontWeight: 700 }}>
            Product Details
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        style={{ '--background': '#EEF6F4' } as any}
      >

        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '20px 16px 40px'
        }}>

          {/* PRODUCT CARD */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '22px',
            border: '1px solid #D8E5E3',
            boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
          }}>

            {/* PRODUCT INFORMATION */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '25px'
            }}>

              <div style={{
                width: '100px',
                height: '100px',
                flexShrink: 0,
                borderRadius: '22px',
                background: '#E6EEFA',
                display: 'grid',
                placeItems: 'center'
              }}>
                <IonIcon
                  icon={waterOutline}
                  style={{
                    fontSize: '55px',
                    color: '#2B5DB8'
                  }}
                />
              </div>

              <div>
                <h2 style={{
                  margin: '0 0 6px',
                  fontSize: '21px',
                  fontWeight: 800,
                  color: '#0B1F44'
                }}>
                  {product.product_name}
                </h2>

                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: 1.5
                }}>
                  {product.description || 'Clean and safe drinking water.'}
                </p>
              </div>

            </div>

            {/* SERVICE TYPE */}
            <div style={{
              background: '#EEF6F4',
              border: '1px solid #D8E5E3',
              borderRadius: '18px',
              padding: '5px',
              display: 'grid',
              gridTemplateColumns: is20L
                ? 'repeat(3, 1fr)'
                : '1fr',
              gap: '4px',
              marginBottom: '25px'
            }}>

              {(is20L
                ? ['Refill', 'Swap', 'New']
                : ['New']
              ).map(type => (

                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    background: selectedType === type
                      ? 'white'
                      : 'transparent',
                    color: selectedType === type
                      ? '#0B1F44'
                      : '#64748b',
                    border: 'none',
                    borderRadius: '13px',
                    padding: '16px 5px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: selectedType === type
                      ? '0 2px 5px rgba(0,0,0,0.08)'
                      : 'none'
                  }}
                >
                  {type}
                </button>

              ))}

            </div>

            {/* PRICE AND QUANTITY */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px'
            }}>

              <div>
                <h2 style={{
                  margin: '0 0 5px',
                  fontSize: '25px',
                  fontWeight: 800,
                  color: '#0B1F44'
                }}>
                  {formatPrice(productPrice)}
                </h2>

                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {selectedType === 'Refill'
                    ? 'Bring your empty container'
                    : selectedType === 'Swap'
                    ? 'Exchange your empty container'
                    : 'New container / case'
                  }
                </p>
              </div>

              {/* QUANTITY CONTROLS */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>

                <button
                  onClick={() => changeQuantity(-1)}
                  disabled={quantity <= 1}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '15px',
                    border: 'none',
                    background: '#E6EEFA',
                    color: quantity <= 1 ? '#B7C5D9' : '#2B5DB8',
                    fontSize: '22px',
                    cursor: quantity <= 1 ? 'default' : 'pointer'
                  }}
                >
                  <IonIcon icon={remove} />
                </button>

                <strong style={{
                  fontSize: '20px',
                  color: '#0B1F44',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </strong>

                <button
                  onClick={() => changeQuantity(1)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '15px',
                    border: 'none',
                    background: '#E6EEFA',
                    color: '#2B5DB8',
                    fontSize: '22px',
                    cursor: 'pointer'
                  }}
                >
                  <IonIcon icon={add} />
                </button>

              </div>
            </div>

          </div>

          {/* ORDER SUMMARY */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            marginTop: '18px',
            border: '1px solid #D8E5E3'
          }}>

            <h3 style={{
              margin: '0 0 18px',
              fontSize: '17px',
              fontWeight: 800,
              color: '#0B1F44'
            }}>
              Order Summary
            </h3>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <span>Service</span>
              <strong style={{ color: '#0B1F44' }}>
                {selectedType}
              </strong>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '15px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <span>Quantity</span>
              <strong style={{ color: '#0B1F44' }}>
                {quantity}
              </strong>
            </div>

            <div style={{
              borderTop: '1px solid #E2E8F0',
              paddingTop: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <strong style={{
                fontSize: '16px',
                color: '#0B1F44'
              }}>
                Total
              </strong>

              <strong style={{
                fontSize: '23px',
                color: '#2B5DB8'
              }}>
                {formatPrice(totalPrice)}
              </strong>
            </div>

          </div>

          {/* ADD TO CART BUTTON */}
          <button
            onClick={handleAddToCart}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '18px',
              background: '#2B5DB8',
              color: 'white',
              border: 'none',
              borderRadius: '17px',
              fontSize: '16px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 5px 12px rgba(43,93,184,0.2)'
            }}
          >
            <IonIcon icon={cartOutline} style={{ fontSize: '21px' }} />
            Add to Cart · {formatPrice(totalPrice)}
          </button>

        </div>

        <IonToast
          isOpen={showToast}
          message="Product added to cart!"
          duration={1500}
          position="bottom"
          color="success"
          onDidDismiss={() => setShowToast(false)}
        />

      </IonContent>
    </IonPage>
  );
};

export default ProductDetailsPage;
