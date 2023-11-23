import React from 'react';
import { useParams, useNavigate } from "react-router-dom";

import CardList from './CardList';

import { cyphersData, modelsData } from './data';

function CardListViewer(props) {
    const params = useParams();
    const navigate  = useNavigate();

    const factionId = props.factionId ? props.factionId : params.factionId;
    const models = (factionId && factionId !== "all") ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionId) || model.factions.includes('all'))) : Object.values(modelsData);
    const cyphers = (factionId && factionId !== "all") ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionId) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function openModelCard(id) {
        navigate(`/model/${id}`);
    }

    function openCypherCard(id) {
        navigate(`/cypher/${id}`);
    }

    return (
        <div className="container">
            <CardList header={"Models"} cards={models} handleCardClicked={openModelCard}></CardList>
            <CardList header={"Cyphers"} cards={cyphers} handleCardClicked={openCypherCard}></CardList>
        </div>
    );
}

export default CardListViewer;
