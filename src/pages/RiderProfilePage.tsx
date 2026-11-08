import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';

const RiderProfilePage: React.FC = () => {
  return (
    <IonPage>
      <IonContent
        fullscreen
        style={{
          '--background': '#EEF6F4'
        }}
      >
        <div style={{
          padding: '24px 20px',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <h1 style={{
            fontSize: '23px',
            fontWeight: 800,
            color: '#0B1F44',
            margin: '0 0 5px'
          }}>
            My Profile
          </h1>

          <p style={{
            color: '#566A8A',
            fontSize: '13px',
            margin: 0
          }}>
            Manage your rider account.
          </p>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px 20px',
            marginTop: '24px',
            textAlign: 'center',
            border: '1px solid #D8E5E3'
          }}>
            <IonIcon
              icon={personCircleOutline}
              style={{
                fontSize: '75px',
                color: '#2B5DB8'
              }}
            />

            <h2 style={{
              color: '#0B1F44',
              fontSize: '17px',
              margin: '12px 0 5px'
            }}>
              Rider Profile
            </h2>

            <p style={{
              color: '#566A8A',
              fontSize: '12px',
              margin: 0
            }}>
              Your account information will appear here.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RiderProfilePage;