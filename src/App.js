import './App.css';
import ForceEditorView from './ForceEditorView';
import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';

setupIonicReact();

function App() {
    return (
        <div style={{ margin: '0 1rem 0 1rem', paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="App">
                <ForceEditorView></ForceEditorView>
            </div>
        </div>
    );
}

export default App;
