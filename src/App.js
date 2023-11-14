import './App.css';
import EditorView from './EditorView';
import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';

setupIonicReact();

function App() {
    return (
        <div style={{ margin: '0 1rem 0 1rem', paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="App">
                <EditorView></EditorView>
            </div>
        </div>
    );
}

export default App;
