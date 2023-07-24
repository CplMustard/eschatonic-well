import React, { useState } from 'react';
import ForceEditor from './ForceEditor';

import { factionsData } from './data'

function ForceEditorView() {
    const [factionID, setFactionID] = useState("all");
    
    function changeFaction(id) {
        setFactionID(id);
    }

    const factionButtons = []
    Object.entries(factionsData).forEach(([key, value]) => {
        if(!value.hidden) {
            factionButtons.push(<button key={key} onClick={() => changeFaction(value.id)}>{value.name}</button>);
        }
    })
    return (
        <div>
            {factionButtons}
            <ForceEditor factionID={factionID}></ForceEditor>
        </div>
    );
}

export default ForceEditorView;
