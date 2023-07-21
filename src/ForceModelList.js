import React from 'react';

import HardPointList from './HardPointList';

function ForceModelList(props) {
    const { forceEntries, header, handleCardClicked, viewCardClicked } = props;
    const entryComponents = [];
    
    forceEntries.forEach((entry, index) =>
        entryComponents.push(
            <li key={entry.id}>
                <button onClick={() => handleCardClicked(entry.id)}>{entry.name}</button>{viewCardClicked && <button onClick={() => viewCardClicked(entry.modelId)}>VIEW</button>}
                {entry.hard_points && <HardPointList hard_points={entry.hard_points} onChangeHardPoint={()=>{}}/>}
            </li>
        )
    )
    return <><h3>{header}</h3><ul>{entryComponents}</ul></>;
}

export default ForceModelList;