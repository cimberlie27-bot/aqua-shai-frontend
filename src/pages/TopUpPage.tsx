
import { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonIcon,
  IonToast,
  IonSpinner,
  IonInput
} from '@ionic/react';

import {
  walletOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  arrowBackOutline,
  imageOutline,
  closeCircle
} from 'ionicons/icons';

import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const TopUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [fetchingRequests, setFetchingRequests] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/topup/my-requests');
      setMyRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToastMsg('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToastMsg('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      setProofImage(event.target?.result as string);
      setProofFileName(file.name);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem('vitasip_user') || '{}');

    if (!user.is_verified) {
      setToastMsg('Your account is not yet verified. Please wait for admin approval.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setToastMsg('Please enter a valid amount');
      return;
    }

    if (!referenceNumber) {
      setToastMsg('Please enter the reference number from your payment');
      return;
    }

    if (!proofImage) {
      setToastMsg('Please upload a proof of payment image');
      return;
    }

    setLoading(true);

    try {
      await api.post('/topup/request', {
        amount_centavos: Math.round(parseFloat(amount) * 100),
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        proof_image_url: proofImage,
      });

      setToastMsg('Top-up request submitted! Wait for admin approval.');
      setAmount('');
      setReferenceNumber('');
      setProofImage(null);
      setProofFileName('');

      fetchRequests();
    } catch (err: any) {
      setToastMsg(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') {
      return <IonIcon icon={checkmarkCircleOutline} style={{ color: '#12A06B', fontSize: '21px' }} />;
    }

    if (status === 'rejected') {
      return <IonIcon icon={closeCircleOutline} style={{ color: '#ef4444', fontSize: '21px' }} />;
    }

    return <IonIcon icon={timeOutline} style={{ color: '#b45309', fontSize: '21px' }} />;
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: { bg: '#fef3c7', color: '#b45309', text: 'PENDING' },
      approved: { bg: '#DDF5EA', color: '#12A06B', text: 'APPROVED' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: 'REJECTED' },
    };

    const c = colors[status] || colors.pending;

    return (
      <span
        style={{
          background: c.bg,
          color: c.color,
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '10px',
          fontWeight: 'bold',
          letterSpacing: '0.4px',
          whiteSpace: 'nowrap'
        }}
      >
        {c.text}
      </span>
    );
  };

  const inputStyle = {
    '--border-radius': '12px',
    '--background': '#F8FAFC',
    '--padding-start': '14px',
    '--padding-end': '14px',
    '--padding-top': '13px',
    '--padding-bottom': '13px',
    '--border-color': '#E6EEFA',
    '--border-width': '1px',
    '--border-style': 'solid',
    minHeight: '50px',
    width: '100%',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#0B1F44'
  } as any;

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' }}>
        <div style={{ padding: '20px 20px 40px', maxWidth: '480px', margin: '0 auto' }}>

          {/* HEADER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '13px',
              marginBottom: '25px'
            }}
          >
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
              <IonIcon icon={arrowBackOutline} style={{ fontSize: '20px', color: '#0B1F44' }} />
            </button>

            <div>
              <h1 style={{ margin: 0, fontSize: '21px', fontWeight: '800', color: '#0B1F44' }}>
                Top-Up Wallet
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Request funds for your wallet
              </p>
            </div>
          </div>

          {/* TOP-UP FORM */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '20px',
              borderRadius: '18px',
              border: '1px solid #E1ECE9',
              marginBottom: '28px',
              boxShadow: '0 3px 12px rgba(11,31,68,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: '#E6EEFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IonIcon icon={walletOutline} style={{ fontSize: '20px', color: '#2B5DB8' }} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0B1F44' }}>
                  Request Top-Up
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                  Fill in your payment details
                </p>
              </div>
            </div>

            {/* AMOUNT */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#0B1F44', display: 'block', marginBottom: '7px' }}>
                Amount (₱) <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <IonInput
                type="number"
                value={amount}
                onIonInput={(e) => setAmount(e.detail.value!)}
                placeholder="Enter amount"
                style={inputStyle}
              />
            </div>

            {/* PAYMENT METHOD */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#0B1F44', display: 'block', marginBottom: '8px' }}>
                Payment Method <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['gcash', 'maya', 'bank'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1,
                      padding: '12px 5px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      background: paymentMethod === method ? '#2B5DB8' : '#F8FAFC',
                      color: paymentMethod === method ? '#FFFFFF' : '#64748b',
                      border: paymentMethod === method ? '1px solid #2B5DB8' : '1px solid #E6EEFA',
                      boxShadow: paymentMethod === method ? '0 3px 8px rgba(43,93,184,0.18)' : 'none'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* REFERENCE NUMBER */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#0B1F44', display: 'block', marginBottom: '7px' }}>
                Reference Number <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <IonInput
                value={referenceNumber}
                onIonInput={(e) => setReferenceNumber(e.detail.value!)}
                placeholder="Enter reference number"
                style={inputStyle}
              />
            </div>

            {/* PROOF OF PAYMENT */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#0B1F44', display: 'block', marginBottom: '8px' }}>
                Proof of Payment <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              {!proofImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    background: '#F8FAFC',
                    border: '2px dashed #A9C3E9',
                    borderRadius: '13px',
                    padding: '25px 15px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '7px'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#E6EEFA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IonIcon icon={imageOutline} style={{ fontSize: '24px', color: '#2B5DB8' }} />
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0B1F44' }}>
                    Upload Screenshot
                  </span>

                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    PNG, JPG · Max 5MB
                  </span>
                </button>
              ) : (
                <div
                  style={{
                    position: 'relative',
                    background: '#F8FAFC',
                    border: '1px solid #12A06B',
                    borderRadius: '13px',
                    padding: '9px'
                  }}
                >
                  <img
                    src={proofImage}
                    alt="Proof"
                    style={{
                      width: '100%',
                      height: '190px',
                      objectFit: 'contain',
                      borderRadius: '9px'
                    }}
                  />

                  <button
                    onClick={() => {
                      setProofImage(null);
                      setProofFileName('');
                    }}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: '#ef4444',
                      color: '#FFFFFF',
                      border: 'none',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IonIcon icon={closeCircle} style={{ fontSize: '20px' }} />
                  </button>

                  <p style={{ margin: '9px 0 2px', fontSize: '11px', color: '#12A06B', fontWeight: '600' }}>
                    ✓ {proofFileName}
                  </p>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#94a3b8' : '#2B5DB8',
                color: '#FFFFFF',
                border: 'none',
                padding: '15px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '9px',
                boxShadow: '0 4px 10px rgba(43,93,184,0.18)'
              }}
            >
              <IonIcon icon={walletOutline} style={{ fontSize: '18px' }} />
              {loading ? 'Submitting...' : 'Submit Top-Up Request'}
            </button>
          </div>

          {/* REQUEST HISTORY */}
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0B1F44' }}>
              My Top-Up Requests
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>
              Track the status of your requests
            </p>
          </div>

          {fetchingRequests ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
              <IonSpinner name="crescent" style={{ color: '#2B5DB8' }} />
            </div>
          ) : myRequests.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E1ECE9',
                borderRadius: '15px',
                padding: '28px 15px',
                textAlign: 'center'
              }}
            >
              <IonIcon icon={walletOutline} style={{ fontSize: '30px', color: '#94a3b8' }} />
              <p style={{ margin: '9px 0 0', fontSize: '13px', color: '#64748b' }}>
                No requests yet.
              </p>
            </div>
          ) : (
            myRequests.map(r => (
              <div
                key={r.id}
                style={{
                  background: '#FFFFFF',
                  padding: '15px',
                  borderRadius: '14px',
                  marginBottom: '10px',
                  border: '1px solid #E1ECE9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(11,31,68,0.03)'
                }}
              >
                <div style={{ display: 'flex', gap: '11px', alignItems: 'center', minWidth: 0 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      minWidth: '38px',
                      borderRadius: '11px',
                      background: '#E6EEFA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getStatusIcon(r.status)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '800', color: '#0B1F44' }}>
                      ₱{(r.amount_centavos / 100).toFixed(2)}
                    </h4>

                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748b' }}>
                      {r.payment_method.toUpperCase()} · Ref: {r.reference_number || 'N/A'}
                    </p>

                    <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {getStatusBadge(r.status)}
              </div>
            ))
          )}

        </div>
      </IonContent>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg}
        duration={3000}
        color={toastMsg.includes('fail') || toastMsg.includes('Please') ? 'danger' : 'success'}
        onDismiss={() => setToastMsg('')}
      />
    </IonPage>
  );
};

export default TopUpPage;
