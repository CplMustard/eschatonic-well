import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';
import { IonText } from '@ionic/react';

import CardList from './CardList';
import ForceModelList from './ForceModelList';

import { cadresData, factionsData, modelTypesData, modelsData, weaponsData } from './data';
import CadreList from './CadreList';

const voidGateId = "void_gate";

function isHidden(modelId) {
    const modelData = modelsData[modelId];
    const hasHiddenType = modelTypesData[modelData.type].hidden;
    const hasHiddenSubtype = modelData.subtypes ? modelData.subtypes.some((subtype) => modelTypesData[subtype].hidden) : false;
    return (hasHiddenType || hasHiddenSubtype || modelData.hidden)
}

function ModelCountComponent(props) {
    const {models, maxUnits, freeHeroSolos} = props;

    function countUnits(forceModelsData) {
        return forceModelsData.filter((forceModel) => {        
            return !isHidden(forceModel.modelId);
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
        <IonText color={countUnits(models) < maxUnits || countUnits(models) > maxUnits ? "danger" : "primary"}><h3>Units: {countUnits(models)}{maxUnits && <span> / {maxUnits}</span>}</h3></IonText>
        {showHeroSoloCount && (<IonText color={countHeroSolos(models) < freeHeroSolos ? "danger" : "primary"}><h3>Free Hero Solos: {`${Math.min(countHeroSolos(models), freeHeroSolos)} / ${freeHeroSolos}`}</h3></IonText>)}
    </>
}

function ForceEditor(props) {
    const navigate = useNavigate();

    const { factionId, forceSize, forceModelsData, setForceModelsData } = props;
    const maxUnits = forceSize.units;
    const freeHeroSolos = forceSize.hero_solos;

    useEffect(() => {
        let newForceModelsData = forceModelsData;
        if(forceModelsData.findIndex((forceModel) => forceModel.modelId === voidGateId) === -1) {
            newForceModelsData = insertModelCard(forceModelsData, voidGateId);
        }

        const allMantlets = Object.values(modelsData).filter((modelData) => modelData.type === "mantlet");
        const availableMantlets = factionId ? allMantlets.filter((modelData) => {
            return modelData.factions.includes(factionId);
        }) : allMantlets;
        availableMantlets.forEach((modelData) => {
            if(newForceModelsData.findIndex((forceModel) => forceModel.modelId === modelData.id) === -1) {
                newForceModelsData = insertModelCard(newForceModelsData, modelData.id);
            }
        });
        
        setForceModelsData(newForceModelsData);
    }, [forceModelsData, factionId]);

    const models = factionId ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionId) || model.factions.includes('all'))) : Object.values(modelsData);

    function modelCount(modelsData, modelId) {
        return modelsData.filter((forceModel) => forceModel.modelId === modelId).length;
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
        const canRemove = !isHidden(modelId);
        const forceEntry = {id: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, canRemove: canRemove, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
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

    function isCardUnremovable(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        return !forceModelsData[index].canRemove;
    }

    function updateModelHardPoint(option, type, point_cost, hardPointIndex, id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        const entry = forceModelsData[index]
        const newHardPointOptions = [...entry.hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...entry.hardPointOptions.slice(hardPointIndex+1)];
        const forceEntry = {id: entry.id, modelId: entry.modelId, name: entry.name, type: entry.type, subtypes: entry.subtypes, canRemove: entry.canRemove, weapon_points: entry.weapon_points, hard_points: entry.hard_points, hardPointOptions: newHardPointOptions};
        setForceModelsData([...forceModelsData.slice(0, index), forceEntry, ...forceModelsData.slice(index + 1)]);
    }

    return (
        <div>
            {<IonText color="primary"><h3>Faction: {factionId ? factionsData[factionId].name : "ALL"}</h3></IonText>}

            <ModelCountComponent models={forceModelsData} maxUnits={maxUnits} freeHeroSolos={freeHeroSolos}/>
            <ForceModelList header={"Force"} forceEntries={forceModelsData} handleCardClicked={openModelCard} cardActions={[{handleClicked: removeModelCard, text: "REMOVE", isHidden: isCardUnremovable}]} updateModelHardPoint={updateModelHardPoint}></ForceModelList>

            <CadreList cadresData={cadresData} addModelCards={addModelCards} factionId={factionId}></CadreList>
            <CardList header={"Models"} cards={models} hideHiddenTypes={true} handleCardClicked={openModelCard} cardActions={[{handleClicked: (modelId) => addModelCards([modelId]), text: "ADD"}]}></CardList>
        </div>
    );
}

export default ForceEditor;
