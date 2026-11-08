import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { 
  logOutOutline, 
  personOutline, 
  callOutline, 
  mailOutline, 
  locationOutline,
  arrowBackOutline 
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('vitasip_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vitasip_token');
    localStorage.removeItem('vitasip_user');
    navigate('/login', { replace: true });
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' } as any}>
        
        {/* ✅ HEADER KAPAREHAS NG ORDERS PAGE */}
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
                flexShrink: 0,
                cursor: 'pointer'
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
                My Profile
              </h1>

              <p style={{
                margin: '3px 0 0',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                Manage your account details
              </p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '0 18px 35px',
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          
          {/* ✅ AVATAR AT PANGALAN */}
          <div style={{ 
            background: 'white', borderRadius: '20px', padding: '24px', 
            textAlign: 'center', marginBottom: '20px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid #E1ECE9'
          }}>
            <div style={{ 
              width: '80px', height: '80px', background: '#E6EEFA', 
              borderRadius: '50%', display: 'flex', justifyContent: 'center', 
              alignItems: 'center', margin: '0 auto 16px auto' 
            }}>
              <IonIcon icon={personOutline} style={{ fontSize: '40px', color: '#2B5DB8' }} />
            </div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#0B1F44', fontWeight: 'bold' }}>{user.full_name || 'User'}</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', textTransform: 'capitalize' }}>{user.role || 'Customer'}</p>
          </div>

          {/* ✅ DETAILS CARD */}
          <div style={{ 
            background: 'white', borderRadius: '20px', padding: '20px', 
            marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid #E1ECE9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: '#E6EEFA', padding: '10px', borderRadius: '10px', color: '#2B5DB8' }}>
                <IonIcon icon={mailOutline} style={{ fontSize: '20px' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Email Address</p>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{user.email || 'N/A'}</h4>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: '#E6EEFA', padding: '10px', borderRadius: '10px', color: '#2B5DB8' }}>
                <IonIcon icon={callOutline} style={{ fontSize: '20px' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Contact Number</p>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{user.contact_number || 'N/A'}</h4>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#E6EEFA', padding: '10px', borderRadius: '10px', color: '#2B5DB8' }}>
                <IonIcon icon={locationOutline} style={{ fontSize: '20px' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Delivery Address</p>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', lineHeight: 1.4 }}>{user.default_address || 'N/A'}</h4>
              </div>
            </div>
          </div>

          {/* ✅ LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', padding: '16px', borderRadius: '14px', 
              background: '#FDE4E7', color: '#D6384A', fontWeight: 700, 
              fontSize: '15px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <IonIcon icon={logOutOutline} style={{ fontSize: '20px' }} />
            Sign Out
          </button>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;