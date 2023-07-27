import './App.css';
import ForceEditorView from './ForceEditorView';

function App() {
	const navigate = useNavigate();
    return (
        <div style={{ margin: '0 1rem 0 1rem', paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="App">
                <ForceEditorView></ForceEditorView>
            </div>
        </div>
    );
}

export default App;
