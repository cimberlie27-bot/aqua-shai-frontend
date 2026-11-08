import { IonPage, IonContent } from '@ionic/react';

const RiderRegisterPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#EEF6F4' }}>
        <div style={{ padding: '24px 20px' }}>
          <h1 style={{ color: '#0B1F44' }}>Rider Registration</h1>
          <p style={{ color: '#566A8A' }}>
            Rider registration page
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RiderRegisterPage;