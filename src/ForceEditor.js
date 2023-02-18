import React, { useState } from 'react';
import { useParams } from "react-router-dom";

import CardList from './CardList';

import { cyphersData, modelsData } from './data';

function ForceEditor(props) {
    const params = useParams();
    const [forceModelsData, setForceModelsData] = useState([]);
    const [forceCyphersData, setForceCyphersData] = useState([]);

    const factionID = props.factionID ? props.factionID : params.factionID;

    const models = factionID ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionID) || model.factions.includes('all'))) : Object.values(modelsData);
    const cyphers = factionID ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionID) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function addModelCard(id) {
        setForceModelsData(forceModelsData.concat(id));

        console.log("add " + id);
    }

    function addCypherCard(id) {
        setForceCyphersData(forceCyphersData.concat(id));
        
        console.log("add " + id);
    }

    function removeModelCard(id) {
        const index = forceModelsData.indexOf(id);
        if(index !== -1) {
            setForceModelsData(forceModelsData.splice(index, 1));
        }
        console.log("delete " + id);
    }

    function removeCypherCard(id) {
        const index = forceCyphersData.indexOf(id);
        if(index !== -1) {
            setForceCyphersData(forceCyphersData.splice(index, 1));
        }
        console.log("delete " + id);
    }

    return (
        <div>
            <CardList header={"Models"} cards={forceModelsData} handleCardClicked={removeModelCard}></CardList>
            <CardList header={"Cyphers"} cards={forceCyphersData} handleCardClicked={removeCypherCard}></CardList>
            <CardList header={"Models"} cards={models} handleCardClicked={addModelCard}></CardList>
            <CardList header={"Cyphers"} cards={cyphers} handleCardClicked={addCypherCard}></CardList>
        </div>
    );
}

export default ForceEditor;
