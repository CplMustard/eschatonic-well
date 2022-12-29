import React from 'react';

function CardList(props) {
    const { cards, header, handleCardClicked } = props;
    const cardComponents = [];
    cards.forEach((card, index) =>
        cardComponents.push(<li key={index}><button onClick={() => handleCardClicked(card.id)}>{card.name}</button></li>)
    )
    return <><h3>{header}</h3><ul>{cardComponents}</ul></>;
}

export default CardList;