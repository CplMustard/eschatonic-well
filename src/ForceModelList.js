import React from 'react';

import HardPointList from './HardPointList';

function ForceModelList(props) {
    const { forceEntries, header, handleCardClicked } = props;
    const entryComponents = [];
    
    forceEntries.forEach((entry, index) =>
        entryComponents.push(
            <li key={index}>
                <button onClick={() => handleCardClicked(entry.id)}>{entry.name}</button>
                {entry.hard_points && <HardPointList hard_points={entry.hard_points} onChangeHardPoint={()=>{}}/>}
            </li>
        )
    )
    return <><h3>{header}</h3><ul>{entryComponents}</ul></>;
}

export default ForceModelList;