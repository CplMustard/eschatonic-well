import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as CapacitorApp } from '@capacitor/app';
import routes from './routes';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { IonApp, IonHeader, IonToolbar, IonButtons, IonTitle, IonBackButton, setupIonicReact, IonContent } from '@ionic/react';

import '@ionic/react/css/core.css';
import './index.css';

setupIonicReact();

const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root'));

CapacitorApp.addListener('backButton', ({canGoBack}) => {
    if(!canGoBack){
        CapacitorApp.exitApp();
    } else {
        window.history.back();
    }
});

root.render(
    <React.StrictMode>
        <div style={{ margin: '0 1rem 0 1rem', paddingTop: 'env(safe-area-inset-top)' }}>
            <IonApp className="App">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref='/' goBack={window.history.back()}></IonBackButton>
                        </IonButtons>
                        <IonTitle>Back Button</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <RouterProvider router={router} />
                </IonContent>
            </IonApp>
        </div>
    </React.StrictMode>
);