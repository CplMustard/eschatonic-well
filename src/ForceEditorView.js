import React from 'react';

import { useLocalStorage } from "./util/useLocalStorage";

import ForceEditor from './ForceEditor';

import { factionsData, forceSizesData } from './data'

function ForceEditorView() {
    const [factionId, setFactionId] = useLocalStorage("factionId", "all");
    const [forceSize, setForceSize] = useLocalStorage("forceSize", {});
    
    function changeFaction(id) {
        setFactionId(id);
    }

    function changeForceSize(forceSize) {
        setForceSize(forceSize);
    }

    const factionButtons = []
    Object.entries(factionsData).forEach(([key, value]) => {
        if(!value.hidden) {
            factionButtons.push(<button key={key} onClick={() => changeFaction(value.id)}>{value.name}</button>);
        }
    });
    factionButtons.push(<button key={"custom"} onClick={() => changeFaction("")}>ALL</button>);
    const forceSizeButtons = []
    Object.entries(forceSizesData).sort((a, b) => a[1].units-b[1].units).forEach(([key, value]) => {
        forceSizeButtons.push(<button key={key} onClick={() => changeForceSize(value)}>{`${value.name} (${value.units} / ${value.hero_solos})`}</button>);
    });
    forceSizeButtons.push(<button key={"custom"} onClick={() => changeForceSize({})}>CUSTOM</button>);
    return (
        <div className="container">
            {factionButtons}<br/>
            {forceSizeButtons}
            <ForceEditor factionId={factionId} forceSize={forceSize}></ForceEditor>
        </div>
    );
}

export default ForceEditorView;
