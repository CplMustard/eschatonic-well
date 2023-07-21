import React, { useState } from 'react';
import ForceEditor from './ForceEditor';

import { factionsData } from './data'

function ForceEditorView() {
    const [factionID, setFactionID] = useState("all");
    function changeFaction(id) {
        setFactionID(id);
    }

    const factionButtons = []
    Object.entries(factionsData).forEach((faction, index) => {
        console.log(faction)
        factionButtons.push(<button key={index} onClick={() => changeFaction(faction[1].id)}>{faction[1].name}</button>)
    })
    return (
        <div>
            {factionButtons}
            <ForceEditor factionID={factionID}></ForceEditor>
        </div>
    );
}

export default ForceEditorView;
