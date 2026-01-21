import React from "react";
import { useParams, useHistory } from "react-router-dom";

import CardList from "./CardList";

import { getCyphersData, getModelsData } from "./DataLoader";

function CardListViewer(props) {
    const params = useParams();
    const history = useHistory();

    const { rulesetId } = props;

    const modelsData = getModelsData(rulesetId);
    const cyphersData = getCyphersData(rulesetId);

    const factionId = props.factionId ? props.factionId : params.factionId;
    const models = (factionId && factionId !== "all") ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionId) || model.factions.includes("all"))) : Object.values(modelsData);
    const cyphers = (factionId && factionId !== "all") ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionId) || cypher.factions.includes("all"))) : Object.values(cyphersData);

    function openModelCard(id) {
        history.push(`/model/${id}`, { rulesetId: rulesetId });
    }

    function openCypherCard(id) {
        history.push(`/cypher/${id}`, { rulesetId: rulesetId });
    }

    return (
        <div className="container">
            <CardList rulesetId={rulesetId} id={"ViewerModels"} header={"Models"} cards={models} handleCardClicked={openModelCard}></CardList>
            <CardList rulesetId={rulesetId} id={"ViewerCyphers"} header={"Cyphers"} cards={cyphers} handleCardClicked={openCypherCard}></CardList>
        </div>
    );
}

export default CardListViewer;
