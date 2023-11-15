import './App.css';
import EditorView from './EditorView';
import '@ionic/react/css/core.css';
import { IonApp, setupIonicReact } from '@ionic/react';

setupIonicReact();

function App() {
    return (
        <div style={{ margin: '0 1rem 0 1rem', paddingTop: 'env(safe-area-inset-top)' }}>
            <IonApp className="App">
                <EditorView></EditorView>
            </IonApp>
        </div>
    );
}

export default App;
