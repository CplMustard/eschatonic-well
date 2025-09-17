import React from "react";
import { useParams, useHistory } from "react-router-dom";

import CardList from "./CardList";

import { getCyphersData, getModelsData } from "./data";

function CardListViewer(props) {
    const params = useParams();
    const history = useHistory();

    const factionId = props.factionId ? props.factionId : params.factionId;
    const models = (factionId && factionId !== "all") ? Object.values(getModelsData()).filter((model) => model.factions && (model.factions.includes(factionId) || model.factions.includes("all"))) : Object.values(getModelsData());
    const cyphers = (factionId && factionId !== "all") ? Object.values(getCyphersData()).filter((cypher) => cypher.factions && (cypher.factions.includes(factionId) || cypher.factions.includes("all"))) : Object.values(getCyphersData());

    function openModelCard(id) {
        history.push(`/model/${id}`);
    }

    function openCypherCard(id) {
        history.push(`/cypher/${id}`);
    }

    return (
        <div className="container">
            <CardList id={"ViewerModels"} header={"Models"} cards={models} handleCardClicked={openModelCard}></CardList>
            <CardList id={"ViewerCyphers"} header={"Cyphers"} cards={cyphers} handleCardClicked={openCypherCard}></CardList>
        </div>
    );
}

export default CardListViewer;
