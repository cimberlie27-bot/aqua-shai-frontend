
import React, { useState, useEffect, useContext } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonLoading,
  IonToast,
  IonIcon,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/react';

import {
  cashOutline,
  walletOutline,
  bicycleOutline,
  storefrontOutline,
  arrowBackOutline,
  locationOutline,
  ticketOutline,
  receiptOutline,
} from 'ionicons/icons';

import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { api } from '../services/api';

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useContext(CartContext);

  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [msg, setMsg] = useState('');

  // VOUCHER STATE
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // ADDRESS STATE
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('Poblacion I');

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet'>('wallet');

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/wallet')
      .then(res => setWallet(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price_centavos * item.quantity),
    0
  );

  const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
  const discount = appliedVoucher ? appliedVoucher.discount_amount_centavos : 0;
  const total = subtotal + deliveryFee - discount;
  const hasEnoughBalance = wallet && wallet.balance_centavos >= total;

  const penarandaBarangays = [
    "Sinasajan", "Poblacion I", "Poblacion II", "Poblacion III", "Poblacion IV",
    "Sto. Tomas", "Las Piñas", "San Josef", "Callos"
  ];

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;

    setCheckingVoucher(true);
    setVoucherError('');
    setAppliedVoucher(null);

    try {
      const res = await api.post('/vouchers/validate', {
        voucher_code: voucherCode,
        order_subtotal_centavos: subtotal
      });

      if (res.data.valid) {
        setAppliedVoucher(res.data);
      } else {
        setVoucherError(res.data.message);
      }
    } catch (err: any) {
      setVoucherError(err.response?.data?.detail || 'Invalid voucher code');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    if (deliveryMethod === 'delivery' && !street) {
      setMsg('Please enter your street/purok');
      return;
    }

    setPlacingOrder(true);

    try {
      const fullAddress = deliveryMethod === 'delivery'
        ? `${street}, Brgy. ${barangay}, Peñaranda, Nueva Ecija`
        : null;

      const payload = {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          refill_option: item.option
        })),
        delivery_method: deliveryMethod,
        delivery_address: fullAddress,
        payment_method: paymentMethod,
        voucher_code: appliedVoucher ? appliedVoucher.voucher_code : null
      };

      const response = await api.post('/orders', payload);

      clearCart();
      navigate('/success', { state: { order: response.data } });

    } catch (err: any) {
      setMsg(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent style={{ '--background': '#EEF6F4' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '70px'
          }}>
            <IonSpinner name="crescent" color="primary" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' }}>

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
                Checkout
              </h1>

              <p style={{
                margin: '3px 0 0',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                Complete your order details
              </p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '0 16px 35px',
          maxWidth: '480px',
          margin: '0 auto'
        }}>

          {/* DELIVERY METHOD */}
          <div style={{ marginBottom: '18px' }}>
            <h3 style={sectionTitle}>Delivery Method</h3>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                onClick={() => setDeliveryMethod('delivery')}
                style={choiceCard(deliveryMethod === 'delivery')}
              >
                <div style={choiceIcon(deliveryMethod === 'delivery')}>
                  <IonIcon icon={bicycleOutline} />
                </div>

                <h4 style={choiceTitle}>Delivery</h4>
                <p style={choiceDescription}>Deliver to my address</p>
              </div>

              <div
                onClick={() => setDeliveryMethod('pickup')}
                style={choiceCard(deliveryMethod === 'pickup')}
              >
                <div style={choiceIcon(deliveryMethod === 'pickup')}>
                  <IonIcon icon={storefrontOutline} />
                </div>

                <h4 style={choiceTitle}>Pickup</h4>
                <p style={choiceDescription}>Pick up at the store</p>
              </div>
            </div>
          </div>

          {/* DELIVERY ADDRESS */}
          {deliveryMethod === 'delivery' && (
            <div style={sectionCard}>
              <div style={sectionHeadingRow}>
                <div style={smallIconBox}>
                  <IonIcon icon={locationOutline} />
                </div>

                <h3 style={{ ...sectionTitle, margin: 0 }}>
                  Delivery Address
                </h3>
              </div>

              <p style={helperText}>
                We currently deliver only within Peñaranda, Nueva Ecija.
              </p>

              <div style={{ marginBottom: '12px' }}>
                <IonSelect
                  fill="outline"
                  value={barangay}
                  onIonChange={e => setBarangay(e.detail.value)}
                  style={fieldStyle as any}
                >
                  {penarandaBarangays.map(b => (
                    <IonSelectOption key={b} value={b}>
                      {b}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>

              <IonInput
                fill="outline"
                placeholder="Street / Purok / House No."
                value={street}
                onIonInput={(e) => setStreet(e.detail.value!)}
                style={fieldStyle as any}
              />
            </div>
          )}

          {/* PAYMENT METHOD */}
          <div style={sectionCard}>
            <h3 style={sectionTitle}>Payment Method</h3>

            {/* WALLET */}
            <div
              onClick={() => setPaymentMethod('wallet')}
              style={paymentCard(paymentMethod === 'wallet')}
            >
              <div style={paymentInfo}>
                <div style={paymentIconBox}>
                  <IonIcon icon={walletOutline} />
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={paymentTitle}>Wallet Balance</h4>

                  <p style={{
                    ...paymentSubtitle,
                    color: hasEnoughBalance ? '#15966A' : '#DC5555',
                  }}>
                    ₱{wallet
                      ? (wallet.balance_centavos / 100).toFixed(2)
                      : '0.00'
                    }{' '}
                    {hasEnoughBalance ? 'Available' : 'Insufficient'}
                  </p>
                </div>
              </div>

              <div style={radioCircle(paymentMethod === 'wallet')} />
            </div>

            {/* CASH PAYMENT */}
            <div
              onClick={() => setPaymentMethod('cod')}
              style={paymentCard(paymentMethod === 'cod')}
            >
              <div style={paymentInfo}>
                <div style={paymentIconBox}>
                  <IonIcon icon={cashOutline} />
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={paymentTitle}>
                    {deliveryMethod === 'pickup'
                      ? 'Cash on Pickup'
                      : 'Cash on Delivery'}
                  </h4>

                  <p style={paymentSubtitle}>
                    {deliveryMethod === 'pickup'
                      ? 'Pay when you pick up your order'
                      : 'Pay when your order arrives'}
                  </p>
                </div>
              </div>

              <div style={radioCircle(paymentMethod === 'cod')} />
            </div>

            {/* PAYMENT NOTE */}
            <p style={{
              margin: '5px 2px 0',
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.5
            }}>
              {deliveryMethod === 'pickup'
                ? 'Cash payment will be collected at the store when you pick up your order.'
                : 'Cash payment will be collected upon delivery of your order.'}
            </p>
          </div>

          {/* VOUCHER */}
          <div style={sectionCard}>
            <div style={sectionHeadingRow}>
              <div style={smallIconBox}>
                <IonIcon icon={ticketOutline} />
              </div>

              <h3 style={{ ...sectionTitle, margin: 0 }}>
                Voucher Code
              </h3>
            </div>

            <div style={{
              display: 'flex',
              gap: '9px',
              marginTop: '14px'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <IonInput
                  fill="outline"
                  placeholder="Enter code"
                  value={voucherCode}
                  onIonInput={(e) => setVoucherCode(e.detail.value!.toUpperCase())}
                  disabled={!!appliedVoucher}
                  style={fieldStyle as any}
                />
              </div>

              <button
                onClick={handleApplyVoucher}
                disabled={checkingVoucher || !!appliedVoucher}
                style={{
                  background: '#2B5DB8',
                  color: 'white',
                  border: 'none',
                  padding: '0 19px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  minWidth: '78px',
                  opacity: checkingVoucher || !!appliedVoucher ? 0.6 : 1,
                }}
              >
                {checkingVoucher
                  ? <IonSpinner name="crescent" />
                  : 'Apply'}
              </button>
            </div>

            {voucherError && (
              <p style={{
                color: '#DC5555',
                fontSize: '12px',
                margin: '9px 0 0'
              }}>
                {voucherError}
              </p>
            )}

            {appliedVoucher && (
              <p style={{
                color: '#15966A',
                fontSize: '12px',
                margin: '9px 0 0',
                fontWeight: 600
              }}>
                ✓ Voucher applied! You save ₱
                {(appliedVoucher.discount_amount_centavos / 100).toFixed(2)}
              </p>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div style={sectionCard}>
            <div style={sectionHeadingRow}>
              <div style={smallIconBox}>
                <IonIcon icon={receiptOutline} />
              </div>

              <h3 style={{ ...sectionTitle, margin: 0 }}>
                Order Summary
              </h3>
            </div>

            <div style={summaryRow}>
              <span>Subtotal</span>
              <span>₱{(subtotal / 100).toFixed(2)}</span>
            </div>

            <div style={summaryRow}>
              <span>Delivery Fee</span>
              <span>₱{(deliveryFee / 100).toFixed(2)}</span>
            </div>

            {appliedVoucher && (
              <div style={{
                ...summaryRow,
                color: '#15966A',
                fontWeight: 600
              }}>
                <span>Discount ({appliedVoucher.voucher_code})</span>
                <span>-₱{(discount / 100).toFixed(2)}</span>
              </div>
            )}

            <div style={totalRow}>
              <span>Total</span>
              <span style={{ color: '#2B5DB8' }}>
                ₱{(total / 100).toFixed(2)}
              </span>
            </div>

            <IonButton
              expand="block"
              onClick={handlePlaceOrder}
              disabled={
                placingOrder ||
                (paymentMethod === 'wallet' && !hasEnoughBalance)
              }
              style={{
                height: '52px',
                '--border-radius': '13px',
                '--background': '#2B5DB8',
                fontWeight: 'bold',
                fontSize: '15px',
                marginTop: '20px',
              } as any}
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </IonButton>
          </div>
        </div>
      </IonContent>

      <IonLoading
        isOpen={placingOrder}
        message="Placing order..."
      />

      <IonToast
        isOpen={!!msg}
        message={msg}
        duration={3000}
        color="danger"
        onDismiss={() => setMsg('')}
      />
    </IonPage>
  );
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 13px',
  fontSize: '17px',
  fontWeight: 700,
  color: '#0B1F44',
};

const helperText: React.CSSProperties = {
  margin: '0 0 13px',
  fontSize: '12px',
  lineHeight: 1.5,
  color: '#718096',
};

const sectionCard: React.CSSProperties = {
  background: 'white',
  borderRadius: '17px',
  padding: '17px',
  marginBottom: '15px',
  boxShadow: '0 3px 12px rgba(11,31,68,0.06)',
};

const sectionHeadingRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px',
};

const smallIconBox: React.CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  background: '#EAF2FF',
  color: '#2B5DB8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
};

const fieldStyle: React.CSSProperties = {
  '--border-radius': '12px',
  '--background': '#FFFFFF',
  minHeight: '50px',
  fontSize: '14px',
} as any;

const choiceCard = (selected: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '15px 9px',
  background: selected ? '#EAF2FF' : 'white',
  border: selected ? '2px solid #2B5DB8' : '1px solid #DCE5EF',
  borderRadius: '15px',
  textAlign: 'center',
  cursor: 'pointer',
  boxShadow: '0 3px 10px rgba(11,31,68,0.04)',
});

const choiceIcon = (selected: boolean): React.CSSProperties => ({
  width: '42px',
  height: '42px',
  margin: '0 auto',
  borderRadius: '13px',
  background: selected ? '#D8E7FF' : '#F1F5F9',
  color: '#2B5DB8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '23px',
});

const choiceTitle: React.CSSProperties = {
  margin: '9px 0 3px',
  color: '#0B1F44',
  fontSize: '14px',
  fontWeight: 700,
};

const choiceDescription: React.CSSProperties = {
  margin: 0,
  color: '#718096',
  fontSize: '11px',
};

const paymentCard = (selected: boolean): React.CSSProperties => ({
  background: selected ? '#F0F5FF' : 'white',
  border: selected ? '1.5px solid #2B5DB8' : '1px solid #DCE5EF',
  borderRadius: '13px',
  padding: '13px',
  marginBottom: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
});

const paymentInfo: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
};

const paymentIconBox: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: '#EAF2FF',
  color: '#2B5DB8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '21px',
};

const paymentTitle: React.CSSProperties = {
  margin: '0 0 4px',
  color: '#0B1F44',
  fontSize: '14px',
  fontWeight: 700,
};

const paymentSubtitle: React.CSSProperties = {
  margin: 0,
  color: '#718096',
  fontSize: '12px',
};

const radioCircle = (selected: boolean): React.CSSProperties => ({
  width: '19px',
  height: '19px',
  borderRadius: '50%',
  border: selected ? '6px solid #2B5DB8' : '2px solid #C5D0DE',
  background: 'white',
  flexShrink: 0,
});

const summaryRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px',
  fontSize: '14px',
  color: '#718096',
};

const totalRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '13px',
  paddingTop: '13px',
  borderTop: '1px dashed #DCE5EF',
  fontSize: '18px',
  fontWeight: 700,
  color: '#0B1F44',
};

export default CheckoutPage;
