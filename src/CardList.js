import React from 'react';

function CardList(props) {
    const cardComponents = [];
    props.cards.forEach((card, index) =>
        cardComponents.push(<li key={index}>{card.name}</li>)
    )
    return <><h3>{props.header}</h3><ul>{cardComponents}</ul></>;
}

export default CardList;