import React, { useEffect, useState } from 'react';
import ForceEditor from './ForceEditor';

import { factionsData, forceSizesData } from './data'

function ForceEditorView() {
    const [factionID, setFactionID] = useState(() => {
        // getting stored value
        const saved = localStorage.getItem("factionID");
        const initialValue = JSON.parse(saved);
        return initialValue || "all";
    });
    const [forceSize, setForceSize] = useState(() => {
        // getting stored value
        const saved = localStorage.getItem("forceSize");
        const initialValue = JSON.parse(saved);
        return initialValue || {};
    });

    useEffect(() => {
        localStorage.setItem("factionID", JSON.stringify(factionID));
    }, [factionID]);

    useEffect(() => {
        localStorage.setItem("forceSize", JSON.stringify(forceSize));
    }, [forceSize]);
    
    function changeFaction(id) {
        setFactionID(id);
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
            <ForceEditor factionID={factionID} maxUnits={forceSize.units} freeHeroSolos={forceSize.hero_solos}></ForceEditor>
        </div>
    );
}

export default ForceEditorView;
