import React from 'react';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import CardList from './CardList';

import { cyphersData, modelsData } from './data';

function CardListViewer(props) {
    const params = useParams();
    const navigate  = useNavigate();

    const factionID = props.factionID ? props.factionID : params.factionID;
    const models = factionID ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionID) || model.factions.includes('all'))) : Object.values(modelsData);
    const cyphers = factionID ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionID) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function openModelCard(id) {
        navigate(`/model/${id}`);
    }

    function openCypherCard(id) {
        navigate(`/cypher/${id}`);
    }

    return (
        <div>
            <CardList header={"Models"} cards={models} handleCardClicked={openModelCard}></CardList>
            <CardList header={"Cyphers"} cards={cyphers} handleCardClicked={openCypherCard}></CardList>
        </div>
    );
}

export default CardListViewer;
