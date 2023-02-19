import React from 'react';

function ForceModelList(props) {
    const { forceEntries, header, handleCardClicked } = props;
    const entryComponents = [];
    forceEntries.forEach((entry, index) =>
        entryComponents.push(<li key={index}><button onClick={() => handleCardClicked(entry.id)}>{entry.name}</button></li>)
    )
    return <><h3>{header}</h3><ul>{entryComponents}</ul></>;
}

export default ForceModelList;