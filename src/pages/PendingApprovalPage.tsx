import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { timeOutline, logOutOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('vitasip_token');
    localStorage.removeItem('vitasip_user');
    navigate('/login');
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#f8fafc' }}>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          
          <div style={{ background: '#fef3c7', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <IonIcon icon={timeOutline} style={{ fontSize: '50px', color: '#d97706' }} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0' }}>Pending Approval</h1>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', maxWidth: '300px' }}>
            Your rider account is currently under review by the admin. You will be able to access your dashboard once approved.
          </p>

          <button
            onClick={handleLogout}
            style={{
              background: 'white', color: '#ef4444', padding: '14px 24px',
              borderRadius: '12px', border: '1px solid #fca5a5', fontWeight: 'bold',
              fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <IonIcon icon={logOutOutline} /> Back to Login
          </button>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default PendingApprovalPage;