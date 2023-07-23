import React from 'react';

import { modelTypesData } from './data';

function CardList(props) {
    const { cards, header, hideHiddenTypes, handleCardClicked, viewCardClicked } = props;
    const cardGroupComponents = [];
    const cardGroups = cards.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(cardGroups).sort().forEach(([key, value]) => {
        if (!hideHiddenTypes || (modelTypesData[key] && !modelTypesData[key].hidden)) {
            const cardComponents = []
            value.forEach((card, index) =>
                cardComponents.push(<li key={index}><button onClick={() => handleCardClicked(card.id)}>{card.name}</button>{viewCardClicked && <button onClick={() => viewCardClicked(card.id)}>VIEW</button>}</li>)
            )
            cardGroupComponents.push(<div key={key}><h4>{key}</h4><li><ul>{cardComponents}</ul></li></div>)
        }
    })
    return <><h3>{header}</h3><ul>{cardGroupComponents}</ul></>;
}

export default CardList;