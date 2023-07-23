import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';

import CardList from './CardList';
import ForceModelList from './ForceModelList';
import ForceCypherList from './ForceCypherList';

import { cyphersData, modelsData, weaponsData } from './data';

function ForceEditor(props) {
    const params = useParams();
    const navigate  = useNavigate();
    const [forceModelsData, setForceModelsData] = useState([]);
    const [forceCyphersData, setForceCyphersData] = useState([]);
    const modelCount = useRef({});
    const cypherCount = useRef({});

    const factionID = props.factionID ? props.factionID : params.factionID;

    const models = factionID ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionID) || model.factions.includes('all'))) : Object.values(modelsData);
    const cyphers = factionID ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionID) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function openModelCard(id) {
        navigate(`/model/${id}`);
    }

    function openCypherCard(id) {
        navigate(`/cypher/${id}`);
    }

    function addModelCard(id) {
        const modelData = modelsData[id];
        const fa = modelData.fa ? modelData.fa : 4;
        if(!modelCount.current[id]) {
            modelCount.current[id] = 0;
        }

        if(modelCount.current[id] < fa) {
            modelCount.current[id]++;
            const defaultHardPoints = [];
            if(modelData.hard_points) {
                modelData.hard_points.forEach((hard_point) => {
                    defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0], point_cost: hard_point.type === "weapon" ? weaponsData[hard_point.options[0]].point_cost : 0})
                }, [weaponsData]);
            }
            const forceEntry = {id: uuidv1(), modelId: id, name: modelData.name, type: modelData.type, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints };
            setForceModelsData(forceModelsData.concat(forceEntry).sort((a, b) => a.name > b.name));
        }
    }

    function addCypherCard(id) {
        if(!cypherCount.current[id]) {
            cypherCount.current[id] = 0;
        }

        if(cypherCount.current[id] === 0) {
            cypherCount.current[id]++;
            const cypherEntry = {id: uuidv1(), cypherId: id, type: cyphersData[id].type, name: cyphersData[id].name};
            setForceCyphersData(forceCyphersData.concat(cypherEntry).sort((a, b) => a.name > b.name));
        }
    }

    function removeModelCard(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        if(index !== -1) {
            modelCount.current[forceModelsData[index].modelId]--;
            setForceModelsData([...forceModelsData.slice(0, index), ...forceModelsData.slice(index + 1)]);
        }
    }

    function removeCypherCard(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        if(index !== -1) {
            cypherCount.current[forceCyphersData[index].cypherId]--;
            setForceCyphersData([...forceCyphersData.slice(0, index), ...forceCyphersData.slice(index + 1)]);
        }
    }

    function updateModelHardPoint(option, type, point_cost, hardPointIndex, id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        const entry = forceModelsData[index]
        const newHardPointOptions = [...entry.hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...entry.hardPointOptions.slice(hardPointIndex+1)];
        const forceEntry = {id: entry.id, modelId: entry.modelId, name: entry.name, type: entry.type, weapon_points: entry.weapon_points, hard_points: entry.hard_points, hardPointOptions: newHardPointOptions };
        setForceModelsData([...forceModelsData.slice(0, index), forceEntry, ...forceModelsData.slice(index + 1)]);
    }

    return (
        <div>
            <ForceModelList header={"Models"} forceEntries={forceModelsData} handleCardClicked={removeModelCard} viewCardClicked={openModelCard} updateModelHardPoint={updateModelHardPoint}></ForceModelList>
            <ForceCypherList header={"Cyphers"} forceEntries={forceCyphersData} handleCardClicked={removeCypherCard} viewCardClicked={openCypherCard}></ForceCypherList>
            <CardList header={"Models"} cards={models} hideHiddenTypes={true} handleCardClicked={addModelCard} viewCardClicked={openModelCard}></CardList>
            <CardList header={"Cyphers"} cards={cyphers} handleCardClicked={addCypherCard} viewCardClicked={openCypherCard}></CardList>
        </div>
    );
}

export default ForceEditor;
