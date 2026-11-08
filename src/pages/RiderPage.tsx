import { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonBadge } from '@ionic/react';
import { bicycleOutline, cashOutline, timeOutline, locationOutline, checkmarkCircle } from 'ionicons/icons';
import { api } from '../services/api';

const RiderPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/rider/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    if (!window.confirm(`Mark order as ${status.replace('_', ' ')}?`)) return;
    try {
      setUpdating(orderId);
      await api.patch(`/rider/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#0f172a', '--color': 'white' } as any}>
          <IonTitle style={{ fontWeight: 'bold' }}>My Deliveries</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#f8fafc' }}>
        <div style={{ padding: '16px', paddingBottom: '40px' }}>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><IonSpinner /></div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '80px', color: '#64748b' }}>
              <div style={{ width: '100px', height: '100px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <IonIcon icon={bicycleOutline} style={{ fontSize: '50px', color: '#94a3b8' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px' }}>Wala kang delivery ngayon</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Mag-hintay lang, ia-assign ka ng admin.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>#{order.order_number}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle' }}/> {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <IonBadge color={order.order_status === 'out_for_delivery' ? 'primary' : 'warning'} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {order.order_status.replace(/_/g, ' ')}
                  </IonBadge>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</p>
                  <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>{order.customer_name}</p>
                  
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Address</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}>
                    <IonIcon icon={locationOutline} style={{ verticalAlign: 'middle', color: '#ef4444', marginRight: '4px' }}/> 
                    {order.delivery_address}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f0f9ff', padding: '16px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={cashOutline} style={{ color: '#0ea5e9', fontSize: '24px' }} />
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Payment</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#0ea5e9', fontWeight: 'bold' }}>{order.payment_method === 'cod' ? 'Collect Cash' : 'Paid via Wallet'}</p>
                    </div>
                  </div>
                  <h3 style={{ margin: 0, color: '#0ea5e9', fontWeight: 'bold', fontSize: '22px' }}>₱{(order.total_amount_centavos / 100).toFixed(2)}</h3>
                </div>

                {order.order_status === 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'out_for_delivery')} disabled={updating === order.id} style={{ width: '100%', padding: '16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: updating === order.id ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: updating === order.id ? 0.7 : 1 }}>
                    <IonIcon icon={bicycleOutline} style={{ fontSize: '20px' }} />
                    {updating === order.id ? 'Updating...' : 'Start Delivery'}
                  </button>
                )}

                {order.order_status === 'out_for_delivery' && (
                  <button onClick={() => updateStatus(order.id, 'delivered')} disabled={updating === order.id} style={{ width: '100%', padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: updating === order.id ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: updating === order.id ? 0.7 : 1 }}>
                    <IonIcon icon={checkmarkCircle} style={{ fontSize: '20px' }} />
                    {updating === order.id ? 'Updating...' : 'Mark as Delivered'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RiderPage;