import React from 'react';

import CardList from './CardList';

import { cyphersData, modelsData } from './data';

function CardListViewer(props) {
    const { faction } = props;
    const models = Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(faction) || model.factions.includes('all')));
    const cyphers = Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(faction) || cypher.factions.includes('all')));
    return (
        <div>
            <CardList header={"Models"} cards={models}></CardList>
            <CardList header={"Cyphers"} cards={cyphers}></CardList>
        </div>
    );
}

export default CardListViewer;
