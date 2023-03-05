import React, { useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';

import CardList from './CardList';
import ForceModelList from './ForceModelList';
import ForceCypherList from './ForceCypherList';

import { cyphersData, modelsData } from './data';

function ForceEditor(props) {
    const params = useParams();
    const [forceModelsData, setForceModelsData] = useState([]);
    const [forceCyphersData, setForceCyphersData] = useState([]);
    const modelCount = useRef({});
    const cypherCount = useRef({});

    const factionID = props.factionID ? props.factionID : params.factionID;

    const models = factionID ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionID) || model.factions.includes('all'))) : Object.values(modelsData);
    const cyphers = factionID ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionID) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function addModelCard(id) {
        const modelData = modelsData[id];
        const FA = modelData.FA ? modelData.FA : 4;
        if(!modelCount.current[id]) {
            modelCount.current[id] = 0;
        }

        if(modelCount.current[id] < FA) {
            modelCount.current[id]++;
            const forceEntry = {id: uuidv1(), modelId: id, name: modelData.name, hard_points: modelData.hard_points};
            setForceModelsData(forceModelsData.concat(forceEntry).sort((a, b) => a.name > b.name));
        }
    }

    function addCypherCard(id) {
        if(!cypherCount.current[id]) {
            cypherCount.current[id] = 0;
        }

        if(cypherCount.current[id] === 0) {
            cypherCount.current[id]++;
            const cypherEntry = {id: uuidv1(), cypherId: id, name: cyphersData[id].name};
            setForceCyphersData(forceCyphersData.concat(cypherEntry).sort((a, b) => a.name > b.name));
        }
    }

    function removeModelCard(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        if(index !== -1) {
            modelCount.current[id]--;
            setForceModelsData([...forceModelsData.slice(0, index), ...forceModelsData.slice(index + 1)]);
        }
    }

    function removeCypherCard(id) {
        const index = forceCyphersData.indexOf(cyphersData[id]);
        if(index !== -1) {
            cypherCount.current[id]--;
            setForceCyphersData([...forceCyphersData.slice(0, index), ...forceCyphersData.slice(index + 1)]);
        }
    }

    return (
        <div>
            <ForceModelList header={"Models"} forceEntries={forceModelsData} handleCardClicked={removeModelCard}></ForceModelList>
            <ForceCypherList header={"Cyphers"} forceEntries={forceCyphersData} handleCardClicked={removeCypherCard}></ForceCypherList>
            <CardList header={"Models"} cards={models} handleCardClicked={addModelCard}></CardList>
            <CardList header={"Cyphers"} cards={cyphers} handleCardClicked={addCypherCard}></CardList>
        </div>
    );
}

export default ForceEditor;
