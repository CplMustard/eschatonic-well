import './App.css';
import ModelCardViewer from './ModelCardViewer';
import CardListViewer from './CardListViewer';

function App() {
    return (
        <div className="App">
            <CardListViewer factionID={"isa"}></CardListViewer>
        </div>
    );
}

export default App;
