import React from 'react';

import CardList from './CardList';

import { cyphersData, modelsData } from './data';

function CardListViewer(props) {
    const { factionID } = props;
    const models = Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionID) || model.factions.includes('all')));
    const cyphers = Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionID) || cypher.factions.includes('all')));

    function openModelCard(id) {
        console.log(id);
    }

    function openCypherCard(id) {
        console.log(id);
    }

    return (
        <div>
            <CardList header={"Models"} cards={models} handleCardClicked={openModelCard}></CardList>
            <CardList header={"Cyphers"} cards={cyphers} handleCardClicked={openCypherCard}></CardList>
        </div>
    );
}

export default CardListViewer;
