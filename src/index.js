import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as CapacitorApp } from '@capacitor/app';

import { setupIonicReact } from '@ionic/react';

import '@ionic/react/css/core.css';
import './index.css';

import App from './App';

setupIonicReact();

const root = ReactDOM.createRoot(document.getElementById('root'));

CapacitorApp.addListener('backButton', ({canGoBack}) => {
    if(!canGoBack){
        CapacitorApp.exitApp();
    } else {
        this.context.router.history.goBack();
    }
});

root.render(<React.StrictMode>
    <App></App>
</React.StrictMode>);