import { useState } from 'react';
import { IonContent, IonPage, IonToast, IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons'; // ✅ Idinagdag
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // ✅ STATE PARA SA MULTI-STEP
  const [step, setStep] = useState(1);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // Address States
  const [barangay, setBarangay] = useState('');
  const [street, setStreet] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ STATES PARA SA EYE ICON
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const penarandaBarangays = [
    "Sinasajan", "Poblacion I", "Poblacion II", "Poblacion III", "Poblacion IV",
    "Sto. Tomas", "Las Piñas", "San Josef", "Callos"
  ];

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!fullName || !email || !contactNumber) {
        setError('Please fill in all fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!barangay || !street) {
        setError('Please select your barangay and enter your street/purok');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
    else navigate('/login');
  };

  const handleRegister = async () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 10) {
      setError('Password must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${street}, Brgy. ${barangay}, Peñaranda, Nueva Ecija`;

      await api.post('/auth/register', {
        full_name: fullName,
        email: email,
        contact_number: contactNumber,
        default_address: fullAddress,
        password: password
      });
      
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Shared Styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '1px solid #D8E5E3',
    background: '#FFFFFF',
    color: '#0B1F44',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    appearance: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 700,
    color: '#0B1F44',
    marginBottom: '8px'
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    background: '#2B5DB8',
    color: 'white',
    fontWeight: 700,
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '16px'
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#2B5DB8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
          
          <div style={{ 
            width: '100%', maxWidth: '420px', 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
          }}>
            
            {/* LIGHT GREEN HEADER AT STEPPER */}
            {step < 4 && (
              <div style={{ background: '#F0F9F1', padding: '24px', borderBottom: '1px solid #E2ECE3' }}>
                
                <button 
                  onClick={handleBack}
                  style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#566A8A', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '20px', padding: 0 }}
                >
                  <span style={{ fontSize: '18px' }}>‹</span> Back
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2, background: '#F0F9F1', paddingRight: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 1 ? '#2B5DB8' : '#D8E5E3', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                      {step > 1 ? '✓' : '1'}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: step >= 1 ? '#0B1F44' : '#92A3C2' }}>Account</span>
                  </div>

                  <div style={{ position: 'absolute', left: '28px', right: '28px', height: '2px', background: '#D8E5E3', zIndex: 1 }}>
                    <div style={{ width: `${((step - 1) / 2) * 100}%`, height: '100%', background: '#2B5DB8', transition: 'width 0.3s ease' }}></div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2, background: '#F0F9F1', padding: '0 8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 2 ? '#2B5DB8' : '#D8E5E3', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                      {step > 2 ? '✓' : '2'}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: step >= 2 ? '#0B1F44' : '#92A3C2' }}>Address</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2, background: '#F0F9F1', paddingLeft: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 3 ? '#2B5DB8' : '#D8E5E3', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                      3
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: step >= 3 ? '#0B1F44' : '#92A3C2' }}>Password</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ padding: '32px 24px' }}>
              
              {/* STEP 1: ACCOUNT INFO */}
              {step === 1 && (
                <div>
                  <h1 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#0B1F44', fontFamily: "'Baloo 2', sans-serif" }}>
                    Tell us about you
                  </h1>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Full name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#2B5DB8'} onBlur={(e) => e.target.style.borderColor = '#D8E5E3'} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#2B5DB8'} onBlur={(e) => e.target.style.borderColor = '#D8E5E3'} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Mobile number</label>
                    <input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#2B5DB8'} onBlur={(e) => e.target.style.borderColor = '#D8E5E3'} />
                  </div>

                  {error && <div style={{ color: '#D6384A', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                  <button onClick={handleNext} style={btnStyle}>Continue</button>
                </div>
              )}

              {/* STEP 2: ADDRESS */}
              {step === 2 && (
                <div>
                  <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, color: '#0B1F44', fontFamily: "'Baloo 2', sans-serif" }}>
                    Where do we deliver?
                  </h1>
                  <p style={{ fontSize: '13px', color: '#566A8A', marginBottom: '24px' }}>
                    We currently deliver within <strong>Peñaranda, Nueva Ecija</strong> only.
                  </p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Barangay</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={barangay} 
                        onChange={e => setBarangay(e.target.value)} 
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        onFocus={(e) => e.target.style.borderColor = '#2B5DB8'} 
                        onBlur={(e) => e.target.style.borderColor = '#D8E5E3'}
                      >
                        <option value="" disabled>Select your Barangay</option>
                        {penarandaBarangays.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#566A8A' }}>
                        ▼
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Purok, Street, House No.</label>
                    <input 
                      type="text" 
                      value={street} 
                      onChange={e => setStreet(e.target.value)} 
                      placeholder="Purok, Street, House No." 
                      style={inputStyle} 
                      onFocus={(e) => e.target.style.borderColor = '#2B5DB8'} 
                      onBlur={(e) => e.target.style.borderColor = '#D8E5E3'} 
                    />
                  </div>

                  {error && <div style={{ color: '#D6384A', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                  <button onClick={handleNext} style={btnStyle}>Continue</button>
                </div>
              )}

              {/* STEP 3: PASSWORD */}
              {step === 3 && (
                <div>
                  <h1 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 800, color: '#0B1F44', fontFamily: "'Baloo 2', sans-serif" }}>
                    Secure your account
                  </h1>
                  
                  {/* ✅ PASSWORD INPUT NA MAY EYE ICON */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="At least 10 characters" 
                        style={{ ...inputStyle, paddingRight: '48px' }} // Space para sa icon
                        onFocus={(e) => e.target.style.borderColor = '#2B5DB8'} 
                        onBlur={(e) => e.target.style.borderColor = '#D8E5E3'} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '22px' }} />
                      </button>
                    </div>
                  </div>

                  {/* ✅ CONFIRM PASSWORD INPUT NA MAY EYE ICON */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Confirm password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        style={{ ...inputStyle, paddingRight: '48px' }} 
                        onFocus={(e) => e.target.style.borderColor = '#2B5DB8'} 
                        onBlur={(e) => e.target.style.borderColor = '#D8E5E3'} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '22px' }} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#566A8A', marginBottom: '24px', lineHeight: 1.5 }}>
                    Use upper and lower case letters and a number. Passwords are stored securely.
                  </p>

                  {error && <div style={{ color: '#D6384A', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                  <button onClick={handleRegister} disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Creating...' : 'Create account'}
                  </button>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '80px', height: '80px', background: '#DDF5EA', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px auto' }}>
                    <span style={{ fontSize: '40px' }}>⏳</span>
                  </div>
                  <h1 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 800, color: '#0B1F44', fontFamily: "'Baloo 2', sans-serif" }}>
                    Registration Submitted!
                  </h1>
                  <p style={{ margin: '0 0 32px 0', fontSize: '14px', color: '#566A8A', lineHeight: 1.6 }}>
                    Your account is currently <strong>pending admin approval</strong>. We will notify you once it's approved.
                  </p>
                  <button onClick={() => navigate('/login')} style={btnStyle}>Back to Login</button>
                </div>
              )}

            </div>
          </div>
        </div>
      </IonContent>
      <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDismiss={() => setError('')} />
    </IonPage>
  );
};

export default RegisterPage;