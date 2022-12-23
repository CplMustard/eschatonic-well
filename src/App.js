import './App.css';
import ModelCardViewer from './ModelCardViewer';
import CardListViewer from './CardListViewer';
import FactionPicker from './FactionPicker';

function App() {
    return (
        <div className="App">
            <ModelCardViewer modelID={"firebrand"}></ModelCardViewer>
        </div>
    );
}

export default App;
