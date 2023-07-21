import React from 'react';

function ForceCypherList(props) {
    const { forceEntries, header, handleCardClicked, viewCardClicked } = props;
    const entryComponents = [];
    forceEntries.forEach((entry, index) =>
        entryComponents.push(<li key={index}><button onClick={() => handleCardClicked(entry.id)}>{entry.name}</button>{viewCardClicked && <button onClick={() => viewCardClicked(entry.cypherId)}>VIEW</button>}</li>)
    )
    return <><h3>{header}</h3><ul>{entryComponents}</ul></>;
}

export default ForceCypherList;