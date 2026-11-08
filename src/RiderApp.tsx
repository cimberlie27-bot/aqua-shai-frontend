import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { bicycleOutline, personOutline } from 'ionicons/icons';

import RiderPage from './pages/RiderPage';
import RiderProfilePage from './pages/RiderProfilePage';

const RiderApp: React.FC = () => {
  return (
    <IonTabs>
      {/* ✅ Nilagyan ng mode="md" at animated para hindi magka-conflict sa transitions */}
      <IonRouterOutlet mode="md">
        <Routes>
          {/* Profile route muna para hindi ma-intercept ng /rider */}
          <Route path="/rider/profile" element={<RiderProfilePage />} />
          
          {/* Deliveries route */}
          <Route path="/rider" element={<RiderPage />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/rider" replace />} />
        </Routes>
      </IonRouterOutlet>

      {/* ✅ Tab Bar */}
      <IonTabBar slot="bottom" style={{ '--background': 'white', borderTop: '1px solid #e2e8f0', paddingBottom: '4px' }}>
        
        <IonTabButton tab="deliveries" href="/rider">
          <IonIcon icon={bicycleOutline} />
          <IonLabel>Deliveries</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="profile" href="/rider/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
        
      </IonTabBar>
    </IonTabs>
  );
};

export default RiderApp;