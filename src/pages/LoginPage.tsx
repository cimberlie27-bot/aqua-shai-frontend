import { useState } from 'react';
import { IonContent, IonPage, IonToast, IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true); setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data.user;

      if (user.role !== 'admin' && !user.is_verified) {
        setError('Your account is pending admin approval.');
        return;
      }

      localStorage.setItem('vitasip_token', res.data.access_token);
      localStorage.setItem('vitasip_user', JSON.stringify(user));

      if (user.role === 'customer') {
        localStorage.setItem('show_welcome_toast', 'true');
      }

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'rider') navigate('/rider');
      else navigate('/home');

    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Account not found. Please create an account first.');
      } else {
        setError(err.response?.data?.detail || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Input Styles
  const inputStyle = {
    width: '100%',
    height: '52px',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    padding: '0 16px 0 44px', // space sa kaliwa para sa icon
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none',
    background: '#f8fafc',
    transition: 'all 0.2s ease',
  } as React.CSSProperties;

  return (
    <IonPage>
      {/* ✅ Blue Background sa labas */}
      <IonContent fullscreen style={{ '--background': '#2B5DB8' }}>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          padding: '20px' 
        }}>
          
          {/* ✅ PUTING CARD (Saktong laki) */}
          <div style={{ 
            width: '100%', 
            maxWidth: '380px', // 👈 Pinaliit natin nang konti para maging premium
            background: '#FFFFFF', 
            borderRadius: '24px', 
            padding: '32px 28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
          }}>
            
            {/* LOGO SECTION */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <img 
                src="/logo.jpg" 
                alt="Aqua Shai" 
                style={{ 
                  width: '100%', 
                  maxHeight: '140px', // Saktong taas
                  objectFit: 'contain', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)' // Konting shadow sa logo
                }} 
              />
            </div>

            {/* HEADINGS */}
            <h1 style={{ 
              fontSize: '26px', 
              fontWeight: 800, 
              color: '#0f172a', 
              margin: '0 0 6px 0', 
              fontFamily: "'Baloo 2', sans-serif",
              letterSpacing: '-0.5px'
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Fresh refills for delivery or pick up, right here in Peñaranda.
            </p>

            {/* FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* EMAIL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <IonIcon icon={mailOutline} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Enter your email address"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2B5DB8';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(43,93,184,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <IonIcon icon={lockClosedOutline} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Enter your password"
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2B5DB8';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(43,93,184,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                  >
                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                  </button>
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div style={{ color: '#D6384A', fontSize: '13px', fontWeight: 600, background: '#FDE4E7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              {/* SIGN IN BUTTON */}
              <button 
                onClick={handleLogin} 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  height: '52px', 
                  borderRadius: '14px', 
                  background: '#2B5DB8', 
                  color: '#ffffff', 
                  border: 'none', 
                  fontWeight: 700, 
                  fontSize: '16px', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 6px 16px rgba(43,93,184,0.3)', // Nice shadow
                  transition: 'all 0.1s ease'
                }}
                onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* CREATE ACCOUNT BUTTON */}
              <button 
                onClick={() => navigate('/register')} 
                style={{ 
                  width: '100%', 
                  height: '52px', 
                  borderRadius: '14px', 
                  background: 'transparent', 
                  color: '#0f172a', 
                  border: '1.5px solid #e2e8f0', 
                  fontWeight: 700, 
                  fontSize: '15px', 
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Create an account
              </button>
            </div>

          </div>
        </div>

      </IonContent>
      <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDismiss={() => setError('')} />
    </IonPage>
  );
};

export default LoginPage;