import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { refreshOutline, notificationsOutline, locationOutline } from 'ionicons/icons';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminRidersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordRes, riderRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/riders')
      ]);
      const allOrders = Array.isArray(ordRes.data) ? ordRes.data : [];
      setOrders(allOrders.filter((o: any) => ['confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup'].includes(o.order_status)));
      setRiders(Array.isArray(riderRes.data) ? riderRes.data : []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      setUpdating(orderId);
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) { alert("Failed to update"); } 
    finally { setUpdating(null); }
  };

  const font = "'Plus Jakarta Sans', sans-serif";
  const display = "'Baloo 2', sans-serif";
  const ink = '#0B1F44';
  const ink2 = '#566A8A';
  const line = '#D8E5E3';
  const pri = '#2B5DB8';
  const priSoft = '#E6EEFA';
  const ok = '#12A06B';
  const okSoft = '#DDF5EA';
  const warn = '#C77700';
  const warnSoft = '#FFF1D6';
  const bad = '#D6384A';

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: ink }}>Loading...</div>;

  const readyForRider = orders.filter(o => o.order_status === 'preparing' && o.delivery_method === 'delivery');
  const pickupCounter = orders.filter(o => (o.order_status === 'preparing' || o.order_status === 'ready_for_pickup') && o.delivery_method === 'pickup');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: font, fontSize: '13px', color: ink }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '16px' }}>
        <div style={{ flexShrink: 1, minWidth: '200px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '23px', fontWeight: 800, color: ink, fontFamily: display }}>Dispatch</h1>
          <p style={{ margin: 0, color: ink2, fontSize: '12.5px' }}>Assign riders and watch deliveries live · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button 
            onClick={fetchData} 
            className="admin-hover-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', height: '38px', borderRadius: '10px', border: 'none', background: priSoft, cursor: 'pointer', fontWeight: 700, color: pri, fontSize: '12.5px' }}
          >
            <IonIcon icon={refreshOutline} /> Refresh
          </button>
          <button 
            onClick={() => alert("Notifications coming soon")}
            className="admin-icon-btn"
            style={{ width: '38px', height: '38px', borderRadius: '10px', border: `1px solid ${line}`, background: 'white', display: 'grid', placeItems: 'center', position: 'relative', cursor: 'pointer' }}
          >
            <IonIcon icon={notificationsOutline} style={{ fontSize: '19px', color: ink2 }} />
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: bad, color: 'white', borderRadius: '999px', fontSize: '9px', fontWeight: 800, minWidth: '16px', height: '16px', display: 'grid', placeItems: 'center' }}>5</span>
          </button>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: priSoft, color: pri, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>SA</div>
        </div>
      </div>

      {/* LAYOUT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '16px', alignItems: 'start' }}>
        
        {/* KALIWA: LIVE MAP */}
        <div className="admin-card" style={{ background: 'white', borderRadius: '20px', border: `1px solid ${line}`, padding: '20px' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: ink, fontFamily: display }}>Live map</h2>
          <p style={{ margin: '0 0 16px 0', color: ink2, fontSize: '13px' }}>Pins show orders by status, dots show riders sharing GPS</p>
          
          {/* MAP BACKGROUND */}
          <div style={{ background: '#E4ECEA', borderRadius: '16px', height: '360px', position: 'relative', overflow: 'hidden' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d="M 0 100 L 600 100" stroke="white" strokeWidth="16" />
              <path d="M 0 250 L 600 250" stroke="white" strokeWidth="16" />
              <path d="M 150 0 L 150 400" stroke="white" strokeWidth="16" />
              <path d="M 400 0 L 400 400" stroke="white" strokeWidth="16" />
              <rect x="50" y="20" width="80" height="60" fill="#CFE8BE" rx="8" />
              <rect x="420" y="280" width="100" height="80" fill="#CFE8BE" rx="8" />
            </svg>

            {/* CENTER PIN (STATION) */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', background: ink, borderRadius: '10px', display: 'grid', placeItems: 'center', color: 'white', fontSize: '18px' }}>💧</div>
              <span style={{ background: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, marginTop: '4px', color: ink }}>Station</span>
            </div>

            {/* ORDER PINS */}
            <div style={{ position: 'absolute', top: '20%', left: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ background: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '4px', color: ink }}>#17</span>
              <div style={{ width: '16px', height: '16px', background: pri, borderRadius: '50%', border: '2px solid white' }} />
            </div>
            <div style={{ position: 'absolute', top: '35%', left: '35%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ background: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '4px', color: ink }}>#19</span>
              <div style={{ width: '16px', height: '16px', background: warn, borderRadius: '50%', border: '2px solid white' }} />
            </div>
            <div style={{ position: 'absolute', top: '70%', left: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ background: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '4px', color: ink }}>#18</span>
              <div style={{ width: '16px', height: '16px', background: pri, borderRadius: '50%', border: '2px solid white' }} />
            </div>
            <div style={{ position: 'absolute', top: '65%', left: '70%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ background: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '4px', color: ink }}>#22</span>
              <div style={{ width: '16px', height: '16px', background: warn, borderRadius: '50%', border: '2px solid white' }} />
            </div>

            {/* RIDER DOT */}
            <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: '12px', height: '12px', background: ink, borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 4px rgba(11,31,68,0.1)' }} />
          </div>

          {/* LEGEND */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ink2 }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: warn }} /> New</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ink2 }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: pri }} /> Preparing</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ink2 }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1B3D84' }} /> Out for delivery</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ink2 }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: ink }} /> Rider</div>
          </div>
        </div>

        {/* KANAN: MGA QUEUES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* READY FOR A RIDER */}
          <div className="admin-card" style={{ background: 'white', borderRadius: '20px', border: `1px solid ${line}`, padding: '20px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: ink, fontFamily: display }}>Ready for a rider</h2>
            <p style={{ margin: '0 0 16px 0', color: ink2, fontSize: '13px' }}>Preparing orders</p>
            
            {readyForRider.length === 0 ? (
              <p style={{ fontSize: '13px', color: ink2 }}>No orders ready.</p>
            ) : (
              readyForRider.map(o => (
                <div key={o.id} className="admin-table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', borderBottom: `1px solid ${line}`, borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: ink }}>#{o.id} · {o.customer_name}</div>
                    <div style={{ fontSize: '12px', color: ink2, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><IonIcon icon={locationOutline} /> {o.delivery_address}</div>
                    <div style={{ fontSize: '11px', color: ink2, marginTop: '4px' }}>16:00 · Ready</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => alert("Assign rider functionality coming soon")}
                      className="admin-hover-btn" 
                      style={{ padding: '6px 12px', borderRadius: '8px', border: `1.5px solid ${line}`, background: 'white', color: ink2, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PICK-UP COUNTER */}
          <div className="admin-card" style={{ background: 'white', borderRadius: '20px', border: `1px solid ${line}`, padding: '20px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: ink, fontFamily: display }}>Pick-up counter</h2>
            <p style={{ margin: '0 0 16px 0', color: ink2, fontSize: '13px' }}>Customers collecting at the station</p>
            
            {pickupCounter.length === 0 ? (
              <p style={{ fontSize: '13px', color: ink2 }}>No pick-up orders.</p>
            ) : (
              pickupCounter.map(o => (
                <div key={o.id} className="admin-table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', borderBottom: `1px solid ${line}`, borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: ink }}>#{o.id} · {o.customer_name}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span style={{ background: o.order_status === 'ready_for_pickup' ? okSoft : warnSoft, color: o.order_status === 'ready_for_pickup' ? ok : warn, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                        {o.order_status === 'ready_for_pickup' ? 'Ready to pick up' : 'New'}
                      </span>
                      <span style={{ fontSize: '11px', color: ink2 }}>16:00</span>
                    </div>
                  </div>
                  {o.order_status === 'preparing' && (
                    <button onClick={() => updateStatus(o.id, 'ready_for_pickup')} className="admin-hover-btn" style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: priSoft, color: pri, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Start preparing
                    </button>
                  )}
                  {o.order_status === 'ready_for_pickup' && (
                    <button onClick={() => updateStatus(o.id, 'picked_up')} className="admin-hover-btn" style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: ok, color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Mark picked up
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* RIDERS LIST */}
          <div className="admin-card" style={{ background: 'white', borderRadius: '20px', border: `1px solid ${line}`, padding: '20px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: ink, fontFamily: display }}>Riders</h2>
            <p style={{ margin: '0 0 16px 0', color: ink2, fontSize: '13px' }}>{riders.length} sharing GPS</p>
            
            {riders.map(r => (
              <div key={r.id} className="admin-table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', borderBottom: `1px solid ${line}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: priSoft, color: pri, display: 'grid', placeItems: 'center', fontWeight: 800 }}>{r.full_name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: ink }}>{r.full_name}</div>
                    <div style={{ fontSize: '12px', color: r.is_available ? ink2 : '#94a3b8' }}>{r.is_available ? 'On delivery' : 'Offline'}</div>
                  </div>
                </div>
                <span style={{ background: r.is_available ? priSoft : line, color: r.is_available ? pri : ink2, padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                  {r.is_available ? 'On delivery' : 'Offline'}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminRidersPage;