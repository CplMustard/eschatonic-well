import React from 'react';

function ForceCypherList(props) {
    const { forceEntries, header, handleCardClicked, cardActionClicked, cardActionText } = props;
    
    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(forceGroups).sort().forEach(([key, value]) => {
        const entryComponents = [];
        value.forEach((entry, index) => {
            entryComponents.push(<li key={index}><button onClick={() => handleCardClicked(entry.cypherId)}>{entry.name}</button>{cardActionClicked && <button onClick={() => cardActionClicked(entry.id)}>{cardActionText}</button>}</li>)
        });
        forceGroupComponents.push(<div key={key}><h4>{key} ({entryComponents.length})</h4><li><ul>{entryComponents}</ul></li></div>);
    });
    return <><h3>{header}</h3><ul>{forceGroupComponents}</ul></>;
}

export default ForceCypherList;