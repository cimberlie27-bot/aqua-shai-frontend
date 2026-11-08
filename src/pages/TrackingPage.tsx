import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonIcon, IonSpinner, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import { checkmarkCircle, bicycleOutline, homeOutline, timeOutline, storefrontOutline } from 'ionicons/icons';
import { api } from '../services/api';

const TrackingPage: React.FC = () => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => {
      if (res.data.length > 0) {
        setOrder(res.data[0]); // Pinaka-latest na order
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}><IonSpinner /></div>;

  if (!order) {
    return (
      <IonPage>
        <IonContent fullscreen style={{ '--background': '#f0f9ff' }}>
          <div style={{ padding: '24px', textAlign: 'center', marginTop: '50px' }}>
            <IonIcon icon={timeOutline} style={{ fontSize: '60px', opacity: 0.3, marginBottom: '10px' }} />
            <h3>Wala pang orders.</h3>
            <p>Pumunta sa Shop para mag-order.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Timeline Logic
  const statuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = statuses.indexOf(order.order_status);
  const isPickup = order.delivery_method === 'pickup';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/orders" /></IonButtons>
          <IonTitle>Track Order</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ '--background': '#f0f9ff' }}>
        <div style={{ padding: '24px 24px 80px 24px' }}>
          
          <div style={{ background: '#0ea5e9', color: 'white', padding: '20px', borderRadius: '16px', marginBottom: '30px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.9 }}>Order Number</p>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>{order.order_number}</h2>
            <p style={{ margin: 0, fontSize: '14px' }}>Total: ₱{(order.total_amount_centavos / 100).toFixed(2)}</p>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <IonIcon icon={checkmarkCircle} style={{ fontSize: '24px', color: currentIndex >= 0 ? '#0ea5e9' : '#cbd5e1' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: currentIndex >= 0 ? '#0f172a' : '#94a3b8' }}>Order Confirmed</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{new Date(order.created_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <IonIcon icon={currentIndex >= 1 ? checkmarkCircle : timeOutline} style={{ fontSize: '24px', color: currentIndex >= 1 ? '#0ea5e9' : '#cbd5e1' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: currentIndex >= 1 ? '#0f172a' : '#94a3b8' }}>Preparing</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{currentIndex >= 1 ? 'In progress' : 'Pending'}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <IonIcon icon={currentIndex >= 2 ? (isPickup ? storefrontOutline : bicycleOutline) : timeOutline} style={{ fontSize: '24px', color: currentIndex >= 2 ? '#0ea5e9' : '#cbd5e1' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: currentIndex >= 2 ? '#0f172a' : '#94a3b8' }}>
                  {isPickup ? 'Ready for Pickup' : 'Out for Delivery'}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{currentIndex >= 2 ? 'In progress' : 'Pending'}</p>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <IonIcon icon={currentIndex >= 3 ? checkmarkCircle : homeOutline} style={{ fontSize: '24px', color: currentIndex >= 3 ? '#10b981' : '#cbd5e1' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: currentIndex >= 3 ? '#0f172a' : '#94a3b8' }}>Delivered / Picked Up</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{currentIndex >= 3 ? 'Completed' : 'Pending'}</p>
              </div>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TrackingPage;