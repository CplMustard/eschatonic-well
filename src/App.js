import './App.css';
import ModelCardViewer from './ModelCardViewer';
import cortexes from './data/cortexes';

console.log(cortexes);

function App() {
    return (
        <div className="App">
            <ModelCardViewer modelID={"dusk_wolf"}></ModelCardViewer>
        </div>
    );
}

export default App;
