
import {
  IonContent,
  IonPage,
  IonIcon,
  IonSpinner,
  IonToast,
  useIonViewWillEnter,
} from '@ionic/react';

import {
  arrowBackOutline,
  waterOutline,
  removeOutline,
  addOutline,
  cartOutline,
  checkmarkCircle,
} from 'ionicons/icons';

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';
import {
  CartContext,
  ProductOption,
} from '../context/CartContext';

interface Product {
  id: number;
  product_name: string;
  description: string | null;
  category: string;
  container_type: string | null;
  refill_option_supported: boolean;
  price_centavos: number;
  refill_price_centavos: number | null;
  swap_price_centavos: number | null;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
}

const options: ProductOption[] = [
  'Refill',
  'Swap',
  'New',
];

const ShopPage: React.FC = () => {
  const navigate = useNavigate();

  const { cart, setItemQuantity } = useContext(CartContext);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [pendingItems, setPendingItems] = useState<{
    [key: string]: number;
  }>({});

  const [selectedOptions, setSelectedOptions] = useState<{
    [productId: number]: ProductOption;
  }>({});

  useIonViewWillEnter(() => {
    loadProducts();
  });

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get('/products');

      const availableProducts: Product[] = response.data.filter(
        (product: Product) => product.is_available
      );

      setProducts(availableProducts);

      setSelectedOptions((previous) => {
        const updated = { ...previous };

        availableProducts.forEach((product) => {
          const current = updated[product.id];

          if (!current || getPrice(product, current) === null) {
            updated[product.id] = getDefaultOption(product);
          }
        });

        return updated;
      });
    } catch (error) {
      console.error('Error loading products:', error);
      setToastMsg('Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (
    product: Product,
    option: ProductOption
  ): number | null => {
    if (option === 'Refill') {
      if (!product.refill_option_supported) return null;

      return product.refill_price_centavos ?? null;
    }

    if (option === 'Swap') {
      return product.swap_price_centavos ?? null;
    }

    return product.price_centavos ?? null;
  };

  const getDefaultOption = (product: Product): ProductOption => {
    if (
      product.refill_option_supported &&
      product.refill_price_centavos !== null
    ) {
      return 'Refill';
    }

    if (product.swap_price_centavos !== null) {
      return 'Swap';
    }

    return 'New';
  };

  const getSelectedOption = (product: Product): ProductOption => {
    const selected = selectedOptions[product.id];

    if (selected && getPrice(product, selected) !== null) {
      return selected;
    }

    return getDefaultOption(product);
  };

  const selectOption = (
    productId: number,
    option: ProductOption
  ) => {
    setSelectedOptions((previous) => ({
      ...previous,
      [productId]: option,
    }));
  };

  const getItemKey = (productId: number, option: ProductOption) =>
    `${productId}-${option}`;

  const getQuantity = (
    productId: number,
    option: ProductOption
  ) => {
    return pendingItems[getItemKey(productId, option)] || 0;
  };

  const getProductTotalQuantity = (productId: number) => {
    const cartQuantity = cart
      .filter((item) => item.product_id === productId)
      .reduce((total, item) => total + item.quantity, 0);

    const pendingQuantity = Object.entries(pendingItems)
      .filter(([key]) => key.startsWith(`${productId}-`))
      .reduce((total, [, quantity]) => total + quantity, 0);

    return cartQuantity + pendingQuantity;
  };

  const changeQuantity = (
    product: Product,
    option: ProductOption,
    change: number
  ) => {
    const price = getPrice(product, option);

    if (price === null) return;

    const key = getItemKey(product.id, option);
    const currentQuantity = pendingItems[key] || 0;
    const newQuantity = currentQuantity + change;

    if (newQuantity < 0) return;

    if (
      change > 0 &&
      getProductTotalQuantity(product.id) > product.stock_quantity
    ) {
      setToastMsg('Not enough stock available.');
      return;
    }

    setPendingItems((previous) => ({
      ...previous,
      [key]: newQuantity,
    }));
  };

  const handleAddToCart = () => {
    const selectedEntries = Object.entries(pendingItems).filter(
      ([, quantity]) => quantity > 0
    );

    if (selectedEntries.length === 0) {
      setToastMsg('Please select at least one product.');
      return;
    }

    selectedEntries.forEach(([key, quantity]) => {
      const [productIdText, optionText] = key.split('-');
      const productId = Number(productIdText);
      const option = optionText as ProductOption;
      const product = products.find((item) => item.id === productId);

      if (!product) return;

      const price = getPrice(product, option);
      if (price === null) return;

      const existingCartQuantity =
        cart.find(
          (item) =>
            item.product_id === productId &&
            item.option === option
        )?.quantity || 0;

      setItemQuantity(
        productId,
        option,
        existingCartQuantity + quantity,
        {
          product_id: productId,
          product_name: product.product_name,
          price_centavos: price,
          quantity: existingCartQuantity + quantity,
          option,
        }
      );
    });

    setPendingItems({});
    setShowSuccessPopup(true);
  };

  const totalItems = Object.values(pendingItems).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const totalAmount = Object.entries(pendingItems).reduce(
    (total, [key, quantity]) => {
      if (quantity <= 0) return total;

      const [productIdText, optionText] = key.split('-');
      const product = products.find(
        (item) => item.id === Number(productIdText)
      );

      if (!product) return total;

      const price = getPrice(product, optionText as ProductOption);
      return total + (price || 0) * quantity;
    },
    0
  );

  const formatPrice = (price: number) => {
    return `₱${(price / 100).toFixed(2)}`;
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        style={{
          '--background': '#EEF6F4',
        }}
      >
        <div
          style={{
            padding: '20px 19px 0',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          {/* HEADER - SAME AS WALLET */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '13px',
              marginBottom: '24px',
            }}
          >
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
                flexShrink: 0,
              }}
            >
              <IonIcon
                icon={arrowBackOutline}
                style={{
                  fontSize: '20px',
                  color: '#0B1F44',
                }}
              />
            </button>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '21px',
                  fontWeight: '800',
                  color: '#0B1F44',
                }}
              >
                Order Water
              </h1>

              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: '12px',
                  color: '#94a3b8',
                }}
              >
                Choose your water products
              </p>
            </div>
          </div>
        </div>

        {/* PRODUCT LIST */}
        <div
          style={{
            padding: '0 16px 20px',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#0B1F44',
              }}
            >
              Available Products
            </h3>

            <span
              style={{
                fontSize: '12px',
                color: '#718096',
              }}
            >
              {products.length} products
            </span>
          </div>

          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '45px',
              }}
            >
              <IonSpinner name="crescent" color="primary" />
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 15px',
                color: '#718096',
              }}
            >
              <IonIcon
                icon={waterOutline}
                style={{
                  fontSize: '42px',
                  color: '#2B5DB8',
                }}
              />
              <p>No products available.</p>
            </div>
          ) : (
            products.map((product) => {
              const selectedOption = getSelectedOption(product);

              const selectedPrice = getPrice(
                product,
                selectedOption
              );

              const quantity = getQuantity(
                product.id,
                selectedOption
              );

              return (
                <div
                  key={product.id}
                  style={{
                    background: 'white',
                    borderRadius: '17px',
                    padding: '16px',
                    marginBottom: '14px',
                    boxShadow: '0 3px 12px rgba(11,31,68,0.06)',
                  }}
                >
                  {/* PRODUCT DETAILS */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <div
                      style={{
                        width: '66px',
                        height: '66px',
                        minWidth: '66px',
                        borderRadius: '15px',
                        background: '#EAF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.product_name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <IonIcon
                          icon={waterOutline}
                          style={{
                            fontSize: '35px',
                            color: '#2B5DB8',
                          }}
                        />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          margin: '0 0 5px',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#0B1F44',
                        }}
                      >
                        {product.product_name}
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#718096',
                        }}
                      >
                        {product.description || product.category}
                      </p>

                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: '12px',
                          color: '#718096',
                        }}
                      >
                        Stock: {product.stock_quantity}
                      </p>
                    </div>
                  </div>

                  {/* SERVICE OPTIONS */}
                  <p
                    style={{
                      margin: '16px 0 9px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0B1F44',
                    }}
                  >
                    Select service
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      gap: '9px',
                    }}
                  >
                    {options.map((option) => {
                      const optionPrice = getPrice(
                        product,
                        option
                      );

                      const isSelected =
                        selectedOption === option;

                      const isDisabled = optionPrice === null;

                      return (
                        <button
                          key={`${product.id}-${option}`}
                          disabled={isDisabled}
                          onClick={() =>
                            selectOption(product.id, option)
                          }
                          style={{
                            flex: 1,
                            padding: '12px 5px',
                            borderRadius: '10px',
                            border: isSelected
                              ? '2px solid #2B5DB8'
                              : '1px solid #DCE5EF',
                            background: isSelected
                              ? '#EAF2FF'
                              : isDisabled
                              ? '#F3F4F6'
                              : 'white',
                            color: isSelected
                              ? '#2B5DB8'
                              : '#718096',
                            fontSize: '13px',
                            fontWeight: 700,
                            opacity: isDisabled ? 0.4 : 1,
                            cursor: isDisabled
                              ? 'not-allowed'
                              : 'pointer',
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {/* PRICE AND QUANTITY */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#718096',
                        }}
                      >
                        {selectedOption} price
                      </p>

                      <h3
                        style={{
                          margin: '3px 0 0',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#2B5DB8',
                        }}
                      >
                        {selectedPrice !== null
                          ? formatPrice(selectedPrice)
                          : 'Not available'}
                      </h3>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '13px',
                      }}
                    >
                      <button
                        onClick={() =>
                          changeQuantity(
                            product,
                            selectedOption,
                            -1
                          )
                        }
                        disabled={quantity === 0}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          border: '1px solid #DCE5EF',
                          background: 'white',
                          color: '#2B5DB8',
                          fontSize: '19px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: quantity === 0 ? 0.4 : 1,
                        }}
                      >
                        <IonIcon icon={removeOutline} />
                      </button>

                      <span
                        style={{
                          minWidth: '18px',
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#0B1F44',
                        }}
                      >
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          changeQuantity(
                            product,
                            selectedOption,
                            1
                          )
                        }
                        disabled={
                          selectedPrice === null ||
                          getProductTotalQuantity(product.id) >=
                            product.stock_quantity
                        }
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#2B5DB8',
                          color: 'white',
                          fontSize: '19px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity:
                            selectedPrice === null ||
                            getProductTotalQuantity(product.id) >=
                              product.stock_quantity
                              ? 0.4
                              : 1,
                        }}
                      >
                        <IonIcon icon={addOutline} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* ADD TO CART */}
          {!loading && totalItems > 0 && (
            <div
              style={{
                background: '#0B1F44',
                borderRadius: '22px',
                padding: '18px 16px',
                marginTop: '20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 22px rgba(11,31,68,0.16)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '17px',
                      fontWeight: 700,
                    }}
                  >
                    {totalItems}{' '}
                    {totalItems === 1 ? 'item' : 'items'}
                  </span>

                  <span style={{ color: '#B9C8DE' }}>·</span>

                  <span
                    style={{
                      color: 'white',
                      fontSize: '19px',
                    }}
                  >
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <p
                  style={{
                    margin: '4px 0 0',
                    color: '#B9C8DE',
                    fontSize: '13px',
                  }}
                >
                  Total amount
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  background: '#2B5DB8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '14px 18px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <IonIcon
                  icon={cartOutline}
                  style={{
                    marginRight: '6px',
                    verticalAlign: 'middle',
                  }}
                />
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* SUCCESS POPUP */}
        {showSuccessPopup && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(5, 18, 43, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                background: 'white',
                borderRadius: '25px',
                padding: '30px 24px 24px',
                textAlign: 'center',
                boxShadow: '0 15px 45px rgba(0,0,0,0.2)',
              }}
            >
              <div
                style={{
                  width: '82px',
                  height: '82px',
                  borderRadius: '50%',
                  background: '#E5F7ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <IonIcon
                  icon={checkmarkCircle}
                  style={{
                    fontSize: '55px',
                    color: '#22A06B',
                  }}
                />
              </div>

              <h2
                style={{
                  margin: '0 0 10px',
                  color: '#0B1F44',
                  fontSize: '22px',
                  fontWeight: 800,
                }}
              >
                Added to Cart!
              </h2>

              <p
                style={{
                  margin: '0 0 25px',
                  color: '#718096',
                  fontSize: '14px',
                  lineHeight: 1.6,
                }}
              >
                Products added to your cart successfully.
                You can view your selected items now.
              </p>

              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate('/cart');
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '13px',
                  background: '#2B5DB8',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                <IonIcon
                  icon={cartOutline}
                  style={{
                    marginRight: '8px',
                    verticalAlign: 'middle',
                  }}
                />
                View Cart
              </button>

              <button
                onClick={() => setShowSuccessPopup(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #DCE5EF',
                  borderRadius: '13px',
                  background: 'white',
                  color: '#2B5DB8',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* ERROR TOAST */}
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2000}
          position="bottom"
          onDidDismiss={() => setToastMsg('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default ShopPage;
