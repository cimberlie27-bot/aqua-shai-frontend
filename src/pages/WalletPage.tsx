
import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonSpinner, IonIcon } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import {
  walletOutline,
  arrowBackOutline,
  addOutline,
  arrowDownOutline,
  arrowUpOutline,
  timeOutline
} from 'ionicons/icons';
import { api } from '../services/api';

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, tRes] = await Promise.all([
          api.get('/wallet'),
          api.get('/wallet/transactions')
        ]);
        setWallet(wRes.data);
        setTransactions(tRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <IonPage>
        <IonContent style={{ '--background': '#EEF6F4' } as any}>
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IonSpinner style={{ color: '#2B5DB8' }} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' } as any}>
        <div style={{ padding: '20px 19px 100px', maxWidth: '480px', margin: '0 auto' }}>

          {/* HEADER */}
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
                justifyContent: 'center'
              }}
            >
              <IonIcon
                icon={arrowBackOutline}
                style={{ fontSize: '20px', color: '#0B1F44' }}
              />
            </button>

            <div>
              <h1 style={{
                margin: 0,
                fontSize: '21px',
                fontWeight: '800',
                color: '#0B1F44'
              }}>
                My Wallet
              </h1>
              <p style={{
                margin: '3px 0 0',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                Manage your funds
              </p>
            </div>
          </div>

          {/* WALLET BALANCE CARD */}
          <div style={{
            background: 'linear-gradient(135deg, #2B5DB8, #1B3D84)',
            borderRadius: '19px',
            padding: '23px',
            color: '#FFFFFF',
            boxShadow: '0 7px 18px rgba(43,93,184,0.20)',
            marginBottom: '22px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              right: '-35px',
              top: '-45px'
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '12px',
              position: 'relative'
            }}>
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IonIcon icon={walletOutline} style={{ fontSize: '19px' }} />
              </div>

              <p style={{
                margin: 0,
                fontSize: '13px',
                opacity: 0.9,
                fontWeight: '500'
              }}>
                Available Balance
              </p>
            </div>

            <h1 style={{
              margin: 0,
              fontSize: '34px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              position: 'relative'
            }}>
              ₱{wallet
                ? (wallet.balance_centavos / 100).toLocaleString('en-US', {
                    minimumFractionDigits: 2
                  })
                : '0.00'}
            </h1>

            <p style={{
              margin: '9px 0 0',
              fontSize: '11px',
              opacity: 0.75
            }}>
              Your Aqua Shai wallet
            </p>
          </div>

          {/* TRANSACTIONS */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '17px',
            padding: '19px',
            border: '1px solid #E1ECE9',
            boxShadow: '0 3px 12px rgba(11,31,68,0.035)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '17px'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: '800',
                  color: '#0B1F44'
                }}>
                  Recent Transactions
                </h3>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  Your wallet activity
                </p>
              </div>

              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '10px',
                background: '#E6EEFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IonIcon
                  icon={timeOutline}
                  style={{ color: '#2B5DB8', fontSize: '18px' }}
                />
              </div>
            </div>

            {transactions.length === 0 ? (
              <div style={{
                padding: '32px 10px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '55px',
                  height: '55px',
                  borderRadius: '50%',
                  background: '#E6EEFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <IonIcon
                    icon={walletOutline}
                    style={{ fontSize: '25px', color: '#2B5DB8' }}
                  />
                </div>

                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#0B1F44'
                }}>
                  No transactions yet
                </p>

                <p style={{
                  margin: '5px 0 0',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  Your wallet activity will appear here.
                </p>
              </div>
            ) : (
              transactions.map((tx, index) => {
                const isDeduction = tx.transaction_type === 'deduction';

                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '13px 0',
                      borderBottom: index !== transactions.length - 1
                        ? '1px solid #E6EEFA'
                        : 'none'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      minWidth: 0
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        flexShrink: 0,
                        background: isDeduction ? '#FFF0F0' : '#DDF5EA',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <IonIcon
                          icon={isDeduction ? arrowUpOutline : arrowDownOutline}
                          style={{
                            color: isDeduction ? '#DE6262' : '#12A06B',
                            fontSize: '20px'
                          }}
                        />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <h4 style={{
                          margin: '0 0 4px',
                          fontSize: '13px',
                          color: '#0B1F44',
                          fontWeight: '700',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {tx.description || (isDeduction ? 'Order Payment' : 'Top-Up')}
                        </h4>

                        <p style={{
                          margin: 0,
                          fontSize: '11px',
                          color: '#94a3b8'
                        }}>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span style={{
                      fontWeight: '800',
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      color: isDeduction ? '#DE6262' : '#12A06B'
                    }}>
                      {isDeduction ? '-' : '+'}₱{(tx.amount_centavos / 100).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* REQUEST TOP-UP */}
          <button
            onClick={() => navigate('/topup')}
            style={{
              width: '100%',
              height: '52px',
              background: '#2B5DB8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '13px',
              fontWeight: '800',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '9px',
              boxShadow: '0 4px 12px rgba(43,93,184,0.20)'
            }}
          >
            <IonIcon icon={addOutline} style={{ fontSize: '20px' }} />
            Request Top-Up
          </button>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default WalletPage;
