import React from 'react';

function ForceCypherList(props) {
    const { forceEntries, header, handleCardClicked, cardActionClicked, cardActionText } = props;
    const entryComponents = [];
    forceEntries.forEach((entry, index) =>
        entryComponents.push(<li key={index}><button onClick={() => handleCardClicked(entry.cypherId)}>{entry.name}</button>{cardActionClicked && <button onClick={() => cardActionClicked(entry.id)}>{cardActionText}</button>}</li>)
    )
    return <><h3>{header}</h3><ul>{entryComponents}</ul></>;
}

export default ForceCypherList;