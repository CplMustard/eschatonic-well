import React from 'react';

function CardList(props) {
    const { cards, header, handleCardClicked } = props;
    const cardGroupComponents = [];
    const cardGroups = cards.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(cardGroups).forEach(([key, value]) => {
        const cardComponents = []
        value.forEach((card, index) =>
            cardComponents.push(<li key={index}><button onClick={() => handleCardClicked(card.id)}>{card.name}</button></li>)
        )
        cardGroupComponents.push(<><h4>{key}</h4><li key={key}><ul>{cardComponents}</ul></li></>)
    })
    return <><h3>{header}</h3><ul>{cardGroupComponents}</ul></>;
}

export default CardList;