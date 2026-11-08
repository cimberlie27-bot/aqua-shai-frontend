import React, { useState, useEffect, useCallback } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import {
  notificationsOutline,
  waterOutline,
  walletOutline,
  closeOutline,
  pricetagOutline,
  personCircleOutline,
  personOutline,
  logOutOutline
} from 'ionicons/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem('vitasip_user') || '{}'
  );

  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [balanceCentavos, setBalanceCentavos] = useState(
    user.wallet_balance_centavos || 0
  );

  // ACTIVE VOUCHER
  const [activeVoucher, setActiveVoucher] = useState<any | null>(null);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await api.get('/wallet');

      const balance = res.data.balance_centavos ?? 0;
      setBalanceCentavos(balance);

      const updatedUser = JSON.parse(
        localStorage.getItem('vitasip_user') || '{}'
      );

      updatedUser.wallet_balance_centavos = balance;

      localStorage.setItem(
        'vitasip_user',
        JSON.stringify(updatedUser)
      );
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    }
  }, []);

  // FETCH ACTIVE VOUCHERS
  const fetchActiveVoucher = useCallback(async () => {
    try {
      const res = await api.get('/vouchers');

      const vouchers = Array.isArray(res.data) ? res.data : [];
      const now = new Date();

      const availableVouchers = vouchers.filter((voucher: any) => {
        const expirationDate = new Date(voucher.expiration_date);
        return expirationDate >= now;
      });

      setActiveVoucher(availableVouchers[0] || null);
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
      setActiveVoucher(null);
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
    fetchActiveVoucher();
  }, [fetchWalletBalance, fetchActiveVoucher, location.key]);

  const balancePesos = (balanceCentavos / 100).toFixed(2);
  const isLowBalance = balanceCentavos <= 5000;

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';
  };

  const handleOrderWater = () => navigate('/shop');
  const handleAddMoney = () => navigate('/wallet');
  const handleTopUp = () => navigate('/topup');

  // PROFILE ACTIONS
  const handleProfile = () => {
    setShowProfileMenu(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('vitasip_token');
    localStorage.removeItem('vitasip_user');

    setShowProfileMenu(false);
    navigate('/login', { replace: true });
  };

  // VOUCHER DISPLAY
  const voucherDiscount = activeVoucher
    ? activeVoucher.discount_type === 'percentage'
      ? `${activeVoucher.discount_value}% off`
      : `₱${(activeVoucher.discount_value / 100).toFixed(2)} off`
    : '';

  const voucherMinimum = activeVoucher
    ? (activeVoucher.minimum_order_amount_centavos / 100).toFixed(0)
    : '0';

  return (
    <IonPage>
      <IonContent style={{ '--background': '#EEF6F4' }}>

        <style>
          {`
            @keyframes waveMove {
              0% { transform: translateX(0); }
              50% { transform: translateX(-25px); }
              100% { transform: translateX(0); }
            }

            .animated-wave {
              animation: waveMove 6s ease-in-out infinite;
              width: 110%;
              margin-left: -5%;
            }

            .profile-menu-button {
              width: 100%;
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 14px;
              border: none;
              background: white;
              color: #0B1F44;
              font-size: 13px;
              font-weight: 600;
              text-align: left;
              cursor: pointer;
            }

            .profile-menu-button:active {
              background: #E6EEFA;
            }
          `}
        </style>

        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            minHeight: '100vh',
            paddingBottom: '20px',
            position: 'relative'
          }}
        >

          {/* HEADER */}
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #2B5DB8, #1B3D84)',
              color: 'white',
              padding: '30px 20px 50px',
              overflow: 'visible', // ✅ Palitan ng visible para hindi matakpan ang dropdown
              zIndex: 10 // ✅ Ilagay sa taas
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 20
              }}
            >

              <div>
                <h1
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '22px',
                    fontWeight: 800
                  }}
                >
                  {getGreeting()}, {user.full_name?.split(' ')[0] || 'Customer'}
                </h1>

                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    opacity: 0.85
                  }}
                >
                  What are we refilling today?
                </p>
              </div>

              {/* NOTIFICATION AND PROFILE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
              >

                <button
                  onClick={() => navigate('/orders')}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <IonIcon
                    icon={notificationsOutline}
                    style={{
                      fontSize: '22px',
                      color: 'white'
                    }}
                  />
                </button>

                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    background: showProfileMenu
                      ? 'white'
                      : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <IonIcon
                    icon={personCircleOutline}
                    style={{
                      fontSize: '25px',
                      color: showProfileMenu ? '#2B5DB8' : 'white'
                    }}
                  />
                </button>

                {/* ✅ PROFILE DROPDOWN (INAYOS ANG Z-INDEX) */}
                {showProfileMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '180px',
                      background: 'white',
                      borderRadius: '14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      overflow: 'hidden',
                      zIndex: 9999 // ✅ Tamang zIndex para lumutang
                    }}
                  >

                    <div
                      style={{
                        padding: '12px 14px',
                        borderBottom: '1px solid #E6EEFA'
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#0B1F44',
                          fontSize: '13px',
                          fontWeight: 800
                        }}
                      >
                        {user.full_name || 'Customer'}
                      </p>

                      <p
                        style={{
                          margin: '3px 0 0',
                          color: '#94a3b8',
                          fontSize: '11px'
                        }}
                      >
                        My Account
                      </p>
                    </div>

                    <button
                      className="profile-menu-button"
                      onClick={handleProfile}
                    >
                      <IonIcon
                        icon={personOutline}
                        style={{
                          fontSize: '18px',
                          color: '#2B5DB8'
                        }}
                      />
                      My Profile
                    </button>

                    <div
                      style={{
                        height: '1px',
                        background: '#E6EEFA'
                      }}
                    />

                    <button
                      className="profile-menu-button"
                      onClick={handleLogout}
                      style={{ color: '#DC2626' }}
                    >
                      <IonIcon
                        icon={logOutOutline}
                        style={{ fontSize: '18px' }}
                      />
                      Sign out
                    </button>

                  </div>
                )}

              </div>
            </div>

            {/* WALLET BALANCE */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                position: 'relative',
                zIndex: 2
              }}
            >
              <div>
                <p
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '13px',
                    opacity: 0.85
                  }}
                >
                  Wallet balance
                </p>

                <h1
                  style={{
                    margin: 0,
                    fontSize: '32px',
                    fontWeight: 800
                  }}
                >
                  ₱{balancePesos}
                </h1>
              </div>

              <button
                onClick={handleTopUp}
                style={{
                  background: 'white',
                  color: '#2B5DB8',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  marginTop: showProfileMenu ? '10px' : '0px', // ✅ Inaadjust para hindi magpatung-patong
                  transition: 'margin-top 0.2s ease'
                }}
              >
                + Top up
              </button>
            </div>

            {isLowBalance && (
              <div
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginTop: '16px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <IonIcon
                  icon={walletOutline}
                  style={{ fontSize: '14px' }}
                />
                Running low, top up before you order
              </div>
            )}

            {/* WAVE */}
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: 0,
                width: '100%',
                lineHeight: 0,
                zIndex: 1
              }}
            >
              <svg
                viewBox="0 0 1440 120"
                className="animated-wave"
                style={{
                  display: 'block',
                  height: 'auto'
                }}
                preserveAspectRatio="none"
              >
                <path
                  d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                  fill="#EEF6F4"
                />
              </svg>
            </div>

          </div>

          {/* MAIN CONTENT */}
          <div
            style={{
              padding: '20px',
              position: 'relative',
              zIndex: 2
            }}
          >

            {/* ACTION BUTTONS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              <button
                onClick={handleOrderWater}
                style={{
                  background: '#2B5DB8',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(43,93,184,0.25)',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.97)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <IonIcon
                  icon={waterOutline}
                  style={{ fontSize: '20px' }}
                />
                Order water
              </button>

              <button
                onClick={handleAddMoney}
                style={{
                  background: '#E6EEFA',
                  color: '#2B5DB8',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.97)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <IonIcon
                  icon={walletOutline}
                  style={{ fontSize: '20px' }}
                />
                Add money
              </button>
            </div>

            {/* INSTALL BANNER */}
            {showInstallBanner && (
              <div
                style={{
                  background: '#0B1F44',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      background: '#2B5DB8',
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <IonIcon
                      icon={waterOutline}
                      style={{
                        color: 'white',
                        fontSize: '20px'
                      }}
                    />
                  </div>

                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'white'
                      }}
                    >
                      Install Aqua Shai
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#94a3b8'
                      }}
                    >
                      Tap Share, then Add to Home Screen.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowInstallBanner(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <IonIcon
                    icon={closeOutline}
                    style={{
                      color: '#94a3b8',
                      fontSize: '20px'
                    }}
                  />
                </button>
              </div>
            )}

            {/* DYNAMIC VOUCHER BANNER */}
            {activeVoucher && (
              <div
                style={{
                  background: '#DDF5EA',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}
                >
                  <IonIcon
                    icon={pricetagOutline}
                    style={{
                      color: '#12A06B',
                      fontSize: '18px'
                    }}
                  />
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#0B1F44',
                    lineHeight: 1.5
                  }}
                >
                  <strong style={{ color: '#12A06B' }}>
                    {activeVoucher.voucher_code}
                  </strong>
                  {' '}gives {voucherDiscount} on orders of ₱{voucherMinimum} or more.
                </p>
              </div>
            )}

          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default HomePage;