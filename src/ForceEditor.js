import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';

import { useLocalStorage } from "./util/useLocalStorage";

import CardList from './CardList';
import ForceModelList from './ForceModelList';
import ForceCypherList from './ForceCypherList';

import { cadresData, cyphersData, factionsData, modelTypesData, modelsData, weaponsData } from './data';

const minCyphers = 15;
const maxCyphers = 15;

function ModelCountComponent(props) {
    const {models, maxUnits, freeHeroSolos} = props;

    function countUnits(forceModelsData) {
        return forceModelsData.filter((forceModel) => {
            const hasHiddenSubtype = forceModel.subtypes ? forceModel.subtypes.every((subtype) => modelTypesData[subtype].hidden) : false;
            return !modelTypesData[forceModel.type].hidden && !hasHiddenSubtype;
        }).length - Math.min(countHeroSolos(forceModelsData), freeHeroSolos ? freeHeroSolos : 0);
    }

    function countHeroSolos(forceModelsData) {
        return forceModelsData.filter((forceModel) => {
            const hasHeroSubtype = forceModel.subtypes ? forceModel.subtypes.includes("hero") : false;
            return forceModel.type === "solo" && hasHeroSubtype;
        }).length;
    }

    const showHeroSoloCount = freeHeroSolos ? (freeHeroSolos !== 0) : false
    return <>
        <h3>Units: {countUnits(models)}{maxUnits && <span> / {maxUnits}</span>}</h3>
        {showHeroSoloCount && (<h3>Free Hero Solos: {`${Math.min(countHeroSolos(models), freeHeroSolos)} / ${freeHeroSolos}`}</h3>)}
    </>
}

function CypherCountComponent(props) {
    const { cyphers } = props;
    return <>
        <h3>Cyphers: {cyphers.length} / {maxCyphers}</h3>
    </>
}

function ForceEditor(props) {
    const params = useParams();
    const navigate  = useNavigate();
    const [forceName, setForceName] = useLocalStorage("forceName", "New Force");
    const [forceModelsData, setForceModelsData] = useLocalStorage("forceModelsData", []);
    const [forceCyphersData, setForceCyphersData] = useLocalStorage("forceCyphersData", []);
    const modelCount = useRef({});
    const cypherCount = useRef({});

    const factionID = props.factionID ? props.factionID : params.factionID;
    const { maxUnits, freeHeroSolos } = props;

    const models = factionID ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionID) || model.factions.includes('all'))) : Object.values(modelsData);
    const cyphers = factionID ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionID) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function saveForce(forceName, forceModelsData, forceCyphersData) {
        const json = JSON.stringify(forceModelsData.concat(forceCyphersData));
        console.log(forceName + ": \n");
        console.log(json);
    }

    function countCadreModels(cadre) {
        if (cadre) {
            const cadreModels = cadresData[cadre].models;
            const cadreModelCounts = [];
            cadreModels.forEach((cadreModelId) => cadreModelCounts.push(modelCount.current[cadreModelId] ? modelCount.current[cadreModelId] : 0));
            return Math.min(...cadreModelCounts);
        }
        return 0;
    }

    function insertModelCard(forceModelsData, modelId) {
        let newForceModelsData = forceModelsData;
        const newId = uuidv1();
        const modelData = modelsData[modelId];
        const defaultHardPoints = [];
        if(modelData.hard_points) {
            modelData.hard_points.forEach((hard_point) => {
                defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0], point_cost: hard_point.type === "weapon" ? weaponsData[hard_point.options[0]].point_cost : 0})
            }, [weaponsData]);
        }
        if (modelData.attachments) {
            modelData.attachments.forEach((attachment) => {
                if(newForceModelsData.findIndex((forceModel) => forceModel.modelId === attachment) === -1) {
                    newForceModelsData = insertModelCard(newForceModelsData, attachment);
                }
            });
        }
        const forceEntry = {id: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
        return newForceModelsData.concat(forceEntry).sort((a, b) => a.name > b.name);
    }

    function deleteModelCard(forceModelsData, index) {
        let newForceModelsData = forceModelsData;
        const modelId = newForceModelsData[index].modelId;
        const modelData = modelsData[modelId];
        newForceModelsData = [...newForceModelsData.slice(0, index), ...newForceModelsData.slice(index + 1)]
        if (modelData.attachments) {
            modelData.attachments.forEach((attachment) => {
                //only delete if we're the last eligible unit for this attachment
                const attachmentIndex = newForceModelsData.findIndex((forceModel) => forceModel.modelId === attachment);
                const remainingEligibleUnitCount = newForceModelsData.filter((forceModel) => modelsData[forceModel.modelId].attachments && modelsData[forceModel.modelId].attachments.includes(attachment)).length
                if(attachmentIndex !== -1 && remainingEligibleUnitCount === 0) {
                    newForceModelsData = deleteModelCard(newForceModelsData, attachmentIndex);
                }
            });
        }
        return newForceModelsData;
    }

    function openModelCard(id) {
        navigate(`/model/${id}`);
    }

    function openCypherCard(id) {
        navigate(`/cypher/${id}`);
    }

    function addModelCard(modelId) {
        const modelData = modelsData[modelId];
        const defaultFA = (modelData.subtypes && modelData.subtypes.includes("hero") ? 1 : 4);
        const fa = modelData.fa ? modelData.fa : defaultFA;
        if(!modelCount.current[modelId]) {
            modelCount.current[modelId] = 0;
        }

        if(modelCount.current[modelId] < fa) {
            modelCount.current[modelId]++;
            let newForceModelsData = insertModelCard(forceModelsData, modelId);
            if(modelData.cadre) {
                const cadre = cadresData[modelData.cadre];
                const championCount = newForceModelsData.filter((forceModel) => forceModel.modelId === cadre.champion).length;
                //add a champion for this cadre if the count doesn't match
                if(championCount !== countCadreModels(cadre.id)) {
                    newForceModelsData = insertModelCard(newForceModelsData, cadre.champion);
                }
            }
            setForceModelsData(newForceModelsData);
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
            const modelData = modelsData[forceModelsData[index].modelId];
            let newForceModelsData = deleteModelCard(forceModelsData, index);

            if(modelData.cadre) {
                const cadre = cadresData[modelData.cadre];
                const championCount = newForceModelsData.filter((forceModel) => forceModel.modelId === cadre.champion).length;
                //remove a champion for this cadre if the count doesn't match
                if(championCount !== countCadreModels(cadre.id)) {
                    const championIndex = newForceModelsData.findIndex((forceModel) => forceModel.modelId === cadre.champion);
                    newForceModelsData = deleteModelCard(newForceModelsData, championIndex);
                }
            }
            setForceModelsData(newForceModelsData);
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
        const forceEntry = {id: entry.id, modelId: entry.modelId, name: entry.name, type: entry.type, subtypes: entry.subtypes,  weapon_points: entry.weapon_points, hard_points: entry.hard_points, hardPointOptions: newHardPointOptions};
        setForceModelsData([...forceModelsData.slice(0, index), forceEntry, ...forceModelsData.slice(index + 1)]);
    }

    const remainingCypherCardList = cyphers.filter((cypher) => forceCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1);

    return (
        <div>
            {<h3>Faction: {factionID ? factionsData[factionID].name : "ALL"}</h3>}
            <ModelCountComponent models={forceModelsData} maxUnits={maxUnits} freeHeroSolos={freeHeroSolos}/>
            <CypherCountComponent cyphers={forceCyphersData}/>
            <label>Force Name: <input type="text" defaultValue={forceName} onChange={(e) => setForceName(e.target.value)} /></label>
            <button onClick={() => {saveForce(forceName, forceModelsData, forceCyphersData)}}>SAVE</button>

            <ForceModelList header={"Models"} forceEntries={forceModelsData} handleCardClicked={openModelCard} cardActionClicked={removeModelCard} cardActionText={"REMOVE"} updateModelHardPoint={updateModelHardPoint}></ForceModelList>
            <ForceCypherList header={"Cyphers"} forceEntries={forceCyphersData} handleCardClicked={openCypherCard} cardActionClicked={removeCypherCard} cardActionText={"REMOVE"}></ForceCypherList>
            <CardList header={"Models"} cards={models} hideHiddenTypes={true} handleCardClicked={openModelCard} cardActionClicked={addModelCard} cardActionText={"ADD"}></CardList>
            <CardList header={"Cyphers"} cards={remainingCypherCardList} handleCardClicked={openCypherCard} cardActionClicked={addCypherCard} cardActionText={"ADD"}></CardList>
        </div>
    );
}

export default ForceEditor;
