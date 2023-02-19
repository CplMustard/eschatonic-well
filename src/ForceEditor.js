import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';

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
        const modelData = modelsData[id];
        const FA = modelData.FA ? modelData.FA : 4;

        const modelCount = forceModelsData.filter((forceModel) => forceModel.modelId === id).length;
        if(modelCount < FA) {
            const forceEntry = {id: uuidv1(), modelId: id, name: modelData.name, hard_points: modelData.hard_point};
            setForceModelsData(forceModelsData.concat(forceEntry).sort((a, b) => a.name > b.name));
        }

        console.log("add " + id);
    }

    function addCypherCard(id) {
        const cypherCount = forceCyphersData.filter((forceCypher) => forceCypher.cypherId === id).length
        console.log(cypherCount);
        if(cypherCount === 0) {
            const cypherEntry = {id: uuidv1(), cypherId: id, name: cyphersData[id].name};
            setForceCyphersData(forceCyphersData.concat(cypherEntry).sort((a, b) => a.name > b.name));
        }
        
        console.log("add " + id);
    }

    function removeModelCard(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        if(index !== -1) {
            setForceModelsData([...forceModelsData.slice(0, index), ...forceModelsData.slice(index + 1)]);
        }
        console.log("delete " + id);
    }

    function removeCypherCard(id) {
        const index = forceCyphersData.indexOf(cyphersData[id]);
        if(index !== -1) {
            setForceCyphersData([...forceCyphersData.slice(0, index), ...forceCyphersData.slice(index + 1)]);
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
