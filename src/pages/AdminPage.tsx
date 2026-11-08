import { useState, useEffect } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { 
  refreshOutline, cartOutline, walletOutline, cubeOutline, 
  arrowForwardOutline, personOutline, timeOutline, checkmarkCircleOutline,
  closeCircleOutline, bicycleOutline, storefrontOutline
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [topupRequests, setTopupRequests] = useState<any[]>([]);
  
  // Dynamic Chart Data - Kunin ang last 7 days sales
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, custRes, topupRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/products'),
        api.get('/admin/customers'),
        api.get('/admin/topup-requests')
      ]);
      
      const ordersData = Array.isArray(ordRes.data) ? ordRes.data : [];
      setOrders(ordersData);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
      setTopupRequests(Array.isArray(topupRes.data) ? topupRes.data : []);

      // Compute last 7 days sales for chart
      const today = new Date();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const daySales = ordersData
          .filter((o: any) => o.created_at.startsWith(dateStr) && o.payment_status === 'paid')
          .reduce((sum: number, o: any) => sum + o.total_amount_centavos, 0);
        days.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: daySales / 100,
          isToday: i === 0
        });
      }
      setChartData(days);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}><IonSpinner name="crescent" /></div>;

  // COMPUTED DATA
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const totalSales = todayOrders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount_centavos, 0) / 100;
  const avgOrder = todayOrders.length > 0 ? totalSales / todayOrders.length : 0;
  const ordersToHandle = orders.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled');
  const lowStock = products.filter(p => p.stock_quantity <= 12);
  const pendingTopups = topupRequests.filter((t: any) => t.status === 'pending');
  
  const newOrders = ordersToHandle.filter(o => o.order_status === 'confirmed').length;
  const preparingOrders = ordersToHandle.filter(o => o.order_status === 'preparing').length;
  const outForDeliveryOrders = ordersToHandle.filter(o => o.order_status === 'out_for_delivery').length;
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.order_status === 'cancelled').length;

  const unverifiedCustomers = customers.filter((c: any) => !c.is_verified).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>Dashboard</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Vitasip · Peñaranda, Nueva Ecija · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={fetchAllData} 
          style={{ 
            background: '#e0f2fe', color: '#0ea5e9', border: 'none', 
            padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' 
          }}
        >
          <IonIcon icon={refreshOutline} /> Refresh
        </button>
      </div>

      {/* ALERTS */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div onClick={() => navigate('/admin/orders')} style={{ background: '#fef3c7', color: '#92400e', padding: '16px', borderRadius: '16px', flex: 1, minWidth: '240px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fcd34d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fde68a', padding: '10px', borderRadius: '10px' }}><IonIcon icon={cartOutline} style={{ fontSize: '20px' }} /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>{newOrders} new orders</h4>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Needs attention</p>
            </div>
          </div>
          <IonIcon icon={arrowForwardOutline} />
        </div>
        
        <div onClick={() => navigate('/admin/topups')} style={{ background: '#e0f2fe', color: '#0369a1', padding: '16px', borderRadius: '16px', flex: 1, minWidth: '240px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #bae6fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#bae6fd', padding: '10px', borderRadius: '10px' }}><IonIcon icon={walletOutline} style={{ fontSize: '20px' }} /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>{pendingTopups.length} top-up requests</h4>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Pending approval</p>
            </div>
          </div>
          <IonIcon icon={arrowForwardOutline} />
        </div>

        <div onClick={() => navigate('/admin/customers')} style={{ background: '#fce7f3', color: '#9d174d', padding: '16px', borderRadius: '16px', flex: 1, minWidth: '240px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fbcfe8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fbcfe8', padding: '10px', borderRadius: '10px' }}><IonIcon icon={personOutline} style={{ fontSize: '20px' }} /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>{unverifiedCustomers} unverified</h4>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Customers to verify</p>
            </div>
          </div>
          <IonIcon icon={arrowForwardOutline} />
        </div>

        <div onClick={() => navigate('/admin/products')} style={{ background: '#f0fdf4', color: '#166534', padding: '16px', borderRadius: '16px', flex: 1, minWidth: '240px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#bbf7d0', padding: '10px', borderRadius: '10px' }}><IonIcon icon={cubeOutline} style={{ fontSize: '20px' }} /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>{lowStock.length} low stock</h4>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Needs reorder</p>
            </div>
          </div>
          <IonIcon icon={arrowForwardOutline} />
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}><IonIcon icon={cartOutline} /> Sales today</p>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>₱{totalSales.toFixed(2)}</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>So far · {todayOrders.length} orders · ₱{avgOrder.toFixed(0)} average</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}><IonIcon icon={cubeOutline} /> Orders to handle</p>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{ordersToHandle.length}</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{newOrders} new · {outForDeliveryOrders} out for delivery</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}><IonIcon icon={walletOutline} /> Wallet Float</p>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>₱{customers.reduce((sum: number, c: any) => sum + c.wallet_balance_centavos, 0) / 100}</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Prepaid by {customers.length} customers</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}><IonIcon icon={cubeOutline} /> Low stock</p>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{lowStock.length}</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{lowStock.length > 0 ? lowStock[0].product_name : 'All good'}</p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Daily sales (last 7 days)</h3>
            </div>
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => `₱${value}`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="sales" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isToday ? '#0ea5e9' : '#bae6fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Order Status (Total)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>New Orders</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{newOrders}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9' }}></div>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>Preparing</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{preparingOrders}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1e293b' }}></div>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>Out for Delivery</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{outForDeliveryOrders}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>Delivered</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{deliveredOrders}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>Cancelled</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{cancelledOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: NEEDS ATTENTION & STOCK HEALTH */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Needs attention</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Oldest first</p>
            </div>
            <button onClick={() => navigate('/admin/orders')} style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>All orders</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ordersToHandle.length === 0 && (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '20px 0' }}>No orders to handle. All caught up!</p>
            )}
            {ordersToHandle.slice(0, 3).map((order, index) => (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: index !== ordersToHandle.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IonIcon icon={storefrontOutline} style={{ color: '#0ea5e9' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>#{order.order_number.slice(-4)} · {order.customer_name || 'Customer'}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{order.items?.map((i:any) => `${i.quantity}x ${i.product_name_snapshot}`).join(', ')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {order.order_status === 'confirmed' && (
                    <button onClick={() => navigate('/admin/orders')} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Start preparing</button>
                  )}
                  {order.order_status === 'preparing' && (
                    <button onClick={() => navigate('/admin/orders')} style={{ background: 'white', color: '#0ea5e9', border: '1px solid #0ea5e9', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Assign rider</button>
                  )}
                  {order.order_status === 'out_for_delivery' && (
                    <button onClick={() => navigate('/admin/orders')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Mark delivered</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Stock health</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Reorder at 12 or fewer</p>
            </div>
            <button onClick={() => navigate('/admin/products')} style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Manage</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {products.length === 0 && (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '20px 0' }}>No products yet. Add one first.</p>
            )}
            {products.slice(0, 4).map(p => (
              <div key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={storefrontOutline} style={{ color: '#0ea5e9', fontSize: '16px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{p.product_name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{p.stock_quantity} in stock</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                  <div style={{ width: `${Math.min((p.stock_quantity / 50) * 100, 100)}%`, height: '100%', background: p.stock_quantity <= 12 ? '#ef4444' : '#0ea5e9', borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminPage;