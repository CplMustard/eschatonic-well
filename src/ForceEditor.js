import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';

import { copyForceToText } from "./util/copyForceToText";
import { useLocalStorage } from "./util/useLocalStorage";

import CardList from './CardList';
import ForceModelList from './ForceModelList';
import ForceCypherList from './ForceCypherList';

import { cadresData, cyphersData, factionsData, forceSizesData, modelTypesData, modelsData, weaponsData } from './data';

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
    const navigate = useNavigate();
    const [forceName, setForceName] = useLocalStorage("forceName", "New Force");
    const [forceModelsData, setForceModelsData] = useLocalStorage("forceModelsData", []);
    const [forceCyphersData, setForceCyphersData] = useLocalStorage("forceCyphersData", []);

    const factionId = props.factionId ? props.factionId : params.factionId;
    const { forceSize } = props
    const maxUnits = forceSize.units;
    const freeHeroSolos = forceSize.hero_solos;

    const models = factionId ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionId) || model.factions.includes('all'))) : Object.values(modelsData);
    const cyphers = factionId ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionId) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function saveForce(forceName, factionId, forceSize, forceModelsData, forceCyphersData) {
        const json = JSON.stringify(forceModelsData.concat(forceCyphersData));
        console.log(forceName + ": \n");
        console.log(json);
    }

    function modelCount(modelsData, modelId) {
        return modelsData.filter((forceModel) => forceModel.modelId === modelId).length;
    }

    function cypherCount(cyphersData, cypherId) {
        return cyphersData.filter((forceCypher) => forceCypher.cypherId === cypherId).length;
    }

    function countCadreModels(modelsData, cadre) {
        if (cadre) {
            const cadreModels = cadresData[cadre].models;
            const cadreModelCounts = [];
            cadreModels.forEach((cadreModelId) => cadreModelCounts.push(modelCount(modelsData, cadreModelId)));
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
        const hasHiddenType = modelTypesData[modelData.type].hidden;
        const hasHiddenSubtypes = modelData.subtypes ? modelData.subtypes.every((subtype) => modelTypesData[subtype].hidden) : false;
        const canRemove = !(hasHiddenType || hasHiddenSubtypes)
        const forceEntry = {id: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, showAction: canRemove, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
        return newForceModelsData.concat(forceEntry);
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

    function openModelCard(modelId, entryId) {
        navigate(`/model/${modelId}`, {state: { entryId: entryId }});
    }

    function openCypherCard(id) {
        navigate(`/cypher/${id}`);
    }

    function addModelCards(modelIds) {
        let newForceModelsData = forceModelsData;
        modelIds.forEach((modelId) => {
            const modelData = modelsData[modelId];
            const defaultFA = (modelData.subtypes && modelData.subtypes.includes("hero") ? 1 : 4);
            const fa = modelData.fa ? modelData.fa : defaultFA;
    
            if(modelCount(newForceModelsData, modelId) < fa) {
                newForceModelsData = insertModelCard(newForceModelsData, modelId);
                if(modelData.cadre) {
                    const cadre = cadresData[modelData.cadre];
                    //add a champion for this cadre if the count doesn't match
                    if(modelCount(newForceModelsData, cadre.champion) !== countCadreModels(newForceModelsData, cadre.id)) {
                        newForceModelsData = insertModelCard(newForceModelsData, cadre.champion);
                    }
                }
            }
        })
        
        setForceModelsData(newForceModelsData);
    }

    function addCypherCards(cypherIds) {
        let newForceCyphersData = forceCyphersData;
        cypherIds.forEach((cypherId) => {
            if(cypherCount(newForceCyphersData, cypherId) === 0) {
                const cypherEntry = {id: uuidv1(), cypherId: cypherId, type: cyphersData[cypherId].type, name: cyphersData[cypherId].name};
                newForceCyphersData = newForceCyphersData.concat(cypherEntry);
            }
        });
        setForceCyphersData(newForceCyphersData);
    }

    function removeModelCard(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        if(index !== -1) {
            const modelData = modelsData[forceModelsData[index].modelId];
            let newForceModelsData = forceModelsData;
            newForceModelsData = deleteModelCard(newForceModelsData, index);

            if(modelData.cadre) {
                const cadre = cadresData[modelData.cadre];
                //remove a champion for this cadre if the count doesn't match
                if(modelCount(newForceModelsData, cadre.champion) !== countCadreModels(newForceModelsData, cadre.id)) {
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
            setForceCyphersData([...forceCyphersData.slice(0, index), ...forceCyphersData.slice(index + 1)]);
        }
    }

    function updateModelHardPoint(option, type, point_cost, hardPointIndex, id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        const entry = forceModelsData[index]
        const newHardPointOptions = [...entry.hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...entry.hardPointOptions.slice(hardPointIndex+1)];
        const forceEntry = {id: entry.id, modelId: entry.modelId, name: entry.name, type: entry.type, subtypes: entry.subtypes, showAction: entry.showAction, weapon_points: entry.weapon_points, hard_points: entry.hard_points, hardPointOptions: newHardPointOptions};
        setForceModelsData([...forceModelsData.slice(0, index), forceEntry, ...forceModelsData.slice(index + 1)]);
    }

    const remainingCypherCardList = cyphers.filter((cypher) => forceCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1);
    const cadreButtonComponents = []
    Object.entries(cadresData).forEach(([key, value]) => {
        if(value.faction === factionId) {
            cadreButtonComponents.push(<span key={key}><label>{value.name} <button onClick={() => addModelCards(value.models)}>ADD</button></label></span>);
        }
    })

    return (
        <div>
            {<h3>Faction: {factionId ? factionsData[factionId].name : "ALL"}</h3>}
            <ModelCountComponent models={forceModelsData} maxUnits={maxUnits} freeHeroSolos={freeHeroSolos}/>
            <CypherCountComponent cyphers={forceCyphersData}/>
            <label>Force Name: <input type="text" defaultValue={forceName} onChange={(e) => setForceName(e.target.value)}/></label>
            <button onClick={() => {saveForce(forceName, factionId, forceSize, forceModelsData, forceCyphersData)}}>SAVE</button>
            <button onClick={() => {copyForceToText(forceName, factionId, forceSize, forceModelsData, forceCyphersData)}}>COPY TO TEXT</button>

            <ForceModelList header={"Force"} forceEntries={forceModelsData} handleCardClicked={openModelCard} cardActionClicked={removeModelCard} cardActionText={"REMOVE"} updateModelHardPoint={updateModelHardPoint}></ForceModelList>
            <ForceCypherList header={"Rack"} forceEntries={forceCyphersData} handleCardClicked={openCypherCard} cardActionClicked={removeCypherCard} cardActionText={"REMOVE"}></ForceCypherList>
            <h3>Cadres </h3>{factionId && factionId !== "all" && cadreButtonComponents}
            <CardList header={"Models"} cards={models} hideHiddenTypes={true} handleCardClicked={openModelCard} cardActionClicked={(modelId) => addModelCards([modelId])} cardActionText={"ADD"}></CardList>
            <CardList header={"Cyphers"} cards={remainingCypherCardList} handleCardClicked={openCypherCard} cardActionClicked={(cypherId) => addCypherCards([cypherId])} cardActionText={"ADD"}></CardList>
        </div>
    );
}

export default ForceEditor;
