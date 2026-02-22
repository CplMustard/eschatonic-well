import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";
import { IonText, IonIcon, useIonToast } from "@ionic/react";
import { add, remove, logOut, logIn } from "ionicons/icons";

import CardList from "./CardList";
import { forceTabs } from "./EditorView.js";

import { isHidden } from "./util/isHidden.js";

import { getCadresData, getModelsData, getWeaponsData } from "./DataLoader";
import CadreList from "./CadreList";

const voidGateId = "void_gate";

function ForceEditor(props) {
    const history = useHistory();
    const [present] = useIonToast();

    const [forceEmpty, setForceEmpty] = useState(true);

    const { tabSelected, rulesetId, factionId, forceModelsData, setForceModelsData, specialIssueModelsData, setSpecialIssueModelsData } = props;
    
    const cadresData = getCadresData(rulesetId);
    const modelsData = getModelsData(rulesetId);
    const weaponsData = getWeaponsData(rulesetId);

    useEffect(() => {
        let newForceData = forceModelsData;
        let addedModelNames = [];
        while (checkFA(newForceData, voidGateId)) {
            newForceData = insertModelCard(newForceData, voidGateId, addedModelNames);
        }

        const allMantlets = Object.values(modelsData).filter((modelData) => modelData.type === "mantlet");
        const availableMantlets = (factionId && factionId !== "all") ? allMantlets.filter((modelData) => {
            return modelData.factions.includes(factionId);
        }) : allMantlets;
        availableMantlets.forEach((modelData) => {
            while (checkFA(newForceData, modelData.id)) {
                newForceData = insertModelCard(newForceData, modelData.id, addedModelNames);
            }
        });

        if(newForceData != forceModelsData) {
            //Show empty force prompt if we only have mantlets or void_gates
            setForceEmpty(newForceData.filter((forceModel) => forceModel.type !== "mantlet" && forceModel.type !== "void_gate").length === 0);
            
            setForceModelsData(newForceData);
        }
    }, [forceModelsData, specialIssueModelsData]);
    
    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
        });
    };

    const models = (factionId && factionId !== "all") ? Object.values(modelsData).filter((model) => model.factions && (model.factions.includes(factionId) || model.factions.includes("all"))) : Object.values(modelsData);

    function modelCount(forceData, modelId) {
        return forceData.filter((forceModel) => forceModel.modelId === modelId).length;
    }

    function checkFA(forceData, modelId) {
        const modelData = modelsData[modelId];
        const defaultFA = (modelData.subtypes && modelData.subtypes.includes("hero") ? 1 : 4);
        const fa = modelData.fa ? modelData.fa : defaultFA;

        return modelCount(forceData, modelId) < fa;
    }

    function updateEmptyForceState(forceData) {
        if(forceData != forceModelsData) {
            //Show empty force prompt if we only have mantlets or void_gates
            setForceEmpty(forceData.filter((forceModel) => forceModel.type !== "mantlet" && forceModel.type !== "void_gate").length === 0);
            
            setForceModelsData(forceData);
        }
    }

    function addAttachments(forceData, modelData, addedModelNames) {
        let newForceData = forceData;
        modelData.attachments.forEach((attachment) => {
            if(newForceData.findIndex((forceModel) => forceModel.modelId === attachment) === -1) {
                newForceData = insertModelCard(newForceData, attachment, addedModelNames);
            }
        });
        
        return newForceData;
    }

    function deleteAttachments(forceData, modelData, deletedModelNames) {
        let newForceData = forceData;
        modelData.attachments.forEach((attachment) => {
            //only delete if we're the last eligible unit for this attachment
            const attachmentIndex = newForceData.findIndex((forceModel) => forceModel.modelId === attachment);
            const remainingEligibleUnitCount = newForceData.filter((forceModel) => modelsData[forceModel.modelId].attachments && modelsData[forceModel.modelId].attachments.includes(attachment)).length;
            if(attachmentIndex !== -1 && remainingEligibleUnitCount === 0) {
                newForceData = deleteModelCard(newForceData, attachmentIndex, deletedModelNames);
            }
        });
        return newForceData;
    }

    function countCadreModels(forceData, cadreId) {
        if (cadreId) {
            const cadreModels = cadresData[cadreId].models;
            const cadreModelCounts = [];
            cadreModels.forEach((cadreModelId) => cadreModelCounts.push(modelCount(forceData, cadreModelId)));
            return Math.min(...cadreModelCounts);
        }
        return 0;
    }

    function addCadreChampion(forceData, cadreId, addedModelNames) {
        let newForceData = forceData;
        const cadre = cadresData[cadreId];
        //add a champion for this cadre if the count doesn't match
        if(modelCount(newForceData, cadre.champion) !== countCadreModels(newForceData, cadreId)) {
            newForceData = insertModelCard(newForceData, cadre.champion, addedModelNames);
        }
        return newForceData;
    }

    function deleteCadreChampion(forceData, cadreId, deletedModelNames) {
        let newForceData = forceData;
        const cadre = cadresData[cadreId];
        //remove a champion for this cadre if the count doesn't match
        if(modelCount(newForceData, cadre.champion) !== countCadreModels(newForceData, cadreId)) {
            const championIndex = newForceData.findIndex((forceModel) => forceModel.modelId === cadre.champion);
            newForceData = deleteModelCard(newForceData, championIndex, deletedModelNames);
        }
        return newForceData;
    }

    function insertModelCard(forceData, modelId, addedModelNames) {
        let newForceData = forceData;
        const newId = uuidv1();
        const modelData = modelsData[modelId];
        const defaultHardPoints = [];
        if(modelData.hard_points) {
            modelData.hard_points.forEach((hard_point) => {
                defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0], point_cost: hard_point.type === "weapon" ? weaponsData[hard_point.options[0]].point_cost : 0});
            }, [weaponsData]);
        }
        if (modelData.attachments) {
            newForceData = addAttachments(newForceData, modelData, addedModelNames);
        }
        
        const canRemove = !isHidden(modelId, rulesetId);
        const forceEntry = {entryId: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, factions: modelData.factions, cadre: modelData.cadre, canRemove: canRemove, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
        addedModelNames.push(modelData.name);
        newForceData = newForceData.concat(forceEntry);

        if (modelData.cadre) {
            newForceData = addCadreChampion(newForceData, modelData.cadre, addedModelNames);
        }

        return newForceData;
    }

    function deleteModelCard(forceData, index, deletedModelNames) {
        let newForceData = forceData;
        const modelId = newForceData[index].modelId;
        const modelData = modelsData[modelId];
        newForceData = [...newForceData.slice(0, index), ...newForceData.slice(index + 1)];
        deletedModelNames.push(modelData.name);
        if (modelData.attachments) {
            newForceData = deleteAttachments(newForceData, modelData, deletedModelNames);
        }

        if(modelData.cadre) {
            newForceData = deleteCadreChampion(newForceData, modelData.cadre, deletedModelNames);
        }

        return newForceData;
    }

    function openModelCard(entry) {
        const modelId = entry.modelId ? entry.modelId : entry.id;
        const entryId = entry.entryId;
        history.push(`/model/${modelId}`, { rulesetId: rulesetId, entryId: entryId, isSpecialIssue: specialIssueModelsData.filter((entry) => entry.entryId === entryId).length !== 0 });
    }

    function addModelCards(modelIds) {
        let newForceData = forceModelsData;
        let addedModelNames = [];
        modelIds.forEach((modelId) => {
            // Make sure to check the special issue list for FA as well
            if(checkFA([...newForceData, ...specialIssueModelsData], modelId)) {
                newForceData = insertModelCard(newForceData, modelId, addedModelNames);
            }
        });

        updateEmptyForceState(newForceData);
        
        presentToast(`Added ${addedModelNames.join(", ")} to forcelist`);

        setForceModelsData(newForceData);
    }

    function removeModelCard(entryId) {
        let deletedModelNames = [];
        const index = forceModelsData.findIndex((forceModel) => forceModel.entryId === entryId);
        if(index !== -1) {
            let newForceData = forceModelsData;
            newForceData = deleteModelCard(newForceData, index, deletedModelNames);

            updateEmptyForceState(newForceData);

            presentToast(`Deleted ${deletedModelNames.join(", ")} from forcelist`);

            setForceModelsData(newForceData);
        }
    }

    function addSpecialIssue(modelIds) {
        let newSpecialIssueModelsData = specialIssueModelsData;
        let addedModelNames = [];
        modelIds.forEach((modelId) => {
            // Make sure to check the special issue list for FA as well
            if(checkFA([...forceModelsData, ...newSpecialIssueModelsData], modelId)) {
                const newId = uuidv1();
                const modelData = modelsData[modelId];

                const defaultHardPoints = [];
                if(modelData.hard_points) {
                    modelData.hard_points.forEach((hard_point) => {
                        defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0], point_cost: hard_point.type === "weapon" ? weaponsData[hard_point.options[0]].point_cost : 0});
                    }, [weaponsData]);
                }

                const canRemove = !isHidden(modelId, rulesetId);
                const forceEntry = {entryId: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, factions: modelData.factions, cadre: modelData.cadre, canRemove: canRemove, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
                addedModelNames.push(modelData.name);
                newSpecialIssueModelsData.push(forceEntry);
            }
        });

        presentToast(`Added ${addedModelNames.join(", ")} to special issue`);

        setSpecialIssueModelsData(newSpecialIssueModelsData);
    }

    function removeSpecialIssue(entryId) {
        const index = specialIssueModelsData.findIndex((forceModel) => forceModel.entryId === entryId);
        const modelId = specialIssueModelsData[index].modelId;
        const modelData = modelsData[modelId];
    
        let newSpecialIssueModelsData = specialIssueModelsData;
        newSpecialIssueModelsData = [...newSpecialIssueModelsData.slice(0, index), ...newSpecialIssueModelsData.slice(index + 1)];
        
        presentToast(`Removed ${modelData.name} from special issue`);

        setSpecialIssueModelsData(newSpecialIssueModelsData);
    }

    function swapToSpecialIssue(entryId) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.entryId === entryId);
        let newSpecialIssueModelsData = specialIssueModelsData;
        let deletedModelNames = [];
        if(index !== -1) {
            newSpecialIssueModelsData.push(forceModelsData[index]);
            let newForceData = forceModelsData;
            newForceData = deleteModelCard(newForceData, index, deletedModelNames);

            //Don't list the special issue model as deleted from forcelist
            deletedModelNames.splice(deletedModelNames.indexOf(forceModelsData[index].name), 1);

            updateEmptyForceState(newForceData);

            presentToast(`Swapped ${forceModelsData[index].name} to special issue${deletedModelNames.length !== 0 ? `, ${deletedModelNames.join(", ")} deleted from forcelist` : ""}`);

            setSpecialIssueModelsData(newSpecialIssueModelsData);
            setForceModelsData(newForceData);
        }
    }

    function swapFromSpecialIssue(entryId) {
        const index = specialIssueModelsData.findIndex((forceModel) => forceModel.entryId === entryId);
        let newForceData = forceModelsData;
        let addedModelNames = [];

        const modelId = specialIssueModelsData[index].modelId;
        const modelData = modelsData[modelId];
        if(checkFA(newForceData, modelId)) {
            newForceData = newForceData.concat(specialIssueModelsData[index]);

            if (modelData.attachments) {
                newForceData = addAttachments(newForceData, modelData, addedModelNames);
            }
        }

        if(modelData.cadre) {
            newForceData = addCadreChampion(newForceData, modelData.cadre, addedModelNames);
        }
    
        let newSpecialIssueModelsData = specialIssueModelsData;
        newSpecialIssueModelsData = [...newSpecialIssueModelsData.slice(0, index), ...newSpecialIssueModelsData.slice(index + 1)];

        updateEmptyForceState(newForceData);
        
        presentToast(`Swapped ${modelData.name} to forcelist${addedModelNames.length !== 0 ? `, ${addedModelNames.join(", ")} added to forcelist` : ""}`);

        setSpecialIssueModelsData(newSpecialIssueModelsData);
        setForceModelsData(newForceData);
    }

    function isCardUnremovable(entryId) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.entryId === entryId);
        return forceModelsData[index] && !forceModelsData[index].canRemove;
    }

    function canSpecialIssueSwap(entryId) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.entryId === entryId);
        const modelType = forceModelsData[index] && forceModelsData[index].type;
        return forceModelsData[index] && !isCardUnremovable(entryId) && !specialIssueModelsData.some((forceModel) => forceModel.type === modelType);
    }

    function canAddToSpecialIssue(modelId) {
        const modelType = modelsData[modelId].type;
        return !specialIssueModelsData.some((forceModel) => forceModel.type === modelType);
    }

    function updateModelHardPoint(forceData, setModelsData, option, type, point_cost, hardPointIndex, entryId) {
        const index = forceData.findIndex((forceModel) => forceModel.entryId === entryId);
        let entry = forceData[index];
        const newHardPointOptions = [...entry.hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...entry.hardPointOptions.slice(hardPointIndex+1)];
        entry.hardPointOptions = newHardPointOptions;
        setModelsData([...forceData.slice(0, index), entry, ...forceData.slice(index + 1)]);
    }

    function getFAText(forceData, modelId) {
        const modelData = modelsData[modelId];
        const defaultFA = (modelData.subtypes && modelData.subtypes.includes("hero") ? 1 : 4);
        const fa = modelData.fa ? modelData.fa : defaultFA;
        return `(${modelCount(forceData, modelId)}/${fa})`;
    }

    return (
        <>
            {tabSelected === forceTabs.force && <>
                {forceEmpty && <IonText color="primary"><h2 className={"label"}>Tap <i>Units</i> and add a unit to your Force with <IonIcon slot="icon-only" icon={add}></IonIcon> to view them here.</h2></IonText>}

                <CardList 
                    rulesetId={rulesetId} 
                    id={"Force"}
                    header={"Force"} 
                    cards={forceModelsData} 
                    handleCardClicked={openModelCard} 
                    cardActions={[
                        {handleClicked: (entry) => removeModelCard(entry.entryId), text: <IonIcon slot="icon-only" icon={remove}></IonIcon>, isDisabled: (entry) => isCardUnremovable(entry.entryId)}, 
                        {handleClicked: (entry) => swapToSpecialIssue(entry.entryId), text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: (entry) => !canSpecialIssueSwap(entry.entryId)}
                    ]} 
                    updateModelHardPoint={(option, type, point_cost, hardPointIndex, entryId) => {updateModelHardPoint(forceModelsData, setForceModelsData, option, type, point_cost, hardPointIndex, entryId);}}
                ></CardList>
            </>}
            {tabSelected === forceTabs.special_issue && <>
                {specialIssueModelsData.length === 0 && <IonText color="primary"><h2>Add a unit to your Special Issue with <IonIcon slot="icon-only" icon={logOut}></IonIcon> to view them here.</h2></IonText>}

                <CardList 
                    rulesetId={rulesetId} 
                    id={"ForceSpecialIssue"}
                    header={"Special Issue"} 
                    cards={specialIssueModelsData} 
                    handleCardClicked={openModelCard} 
                    cardActions={[
                        {handleClicked: (entry) => removeSpecialIssue(entry.entryId), text: <IonIcon slot="icon-only" icon={remove}></IonIcon>}, 
                        {handleClicked: (entry) => swapFromSpecialIssue(entry.entryId), text: <IonIcon slot="icon-only" icon={logIn}></IonIcon>}
                    ]} 
                    updateModelHardPoint={(option, type, point_cost, hardPointIndex, entryId) => {updateModelHardPoint(specialIssueModelsData, setSpecialIssueModelsData, option, type, point_cost, hardPointIndex, entryId);}}
                ></CardList>
            </>}
            {tabSelected === forceTabs.units && <>
                <CadreList rulesetId={rulesetId} cadresData={cadresData} addModelCards={addModelCards} factionId={factionId}></CadreList>
                <br/>
                <CardList 
                    rulesetId={rulesetId} 
                    id={"ForceEditor"}
                    header={"Models"} 
                    cards={models} 
                    hideHiddenTypes={true} 
                    handleCardClicked={openModelCard} 
                    rightInfoText={(card) => getFAText([...forceModelsData, ...specialIssueModelsData], card.id)}
                    cardActions={[
                        {handleClicked: (card) => addModelCards([card.id]), text: <IonIcon slot="icon-only" icon={add}></IonIcon>, isDisabled: (card) => !checkFA([...forceModelsData, ...specialIssueModelsData], card.id) }, 
                        {handleClicked: (card) => addSpecialIssue([card.id]), text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: (card) => !canAddToSpecialIssue(card.id) || !checkFA([...forceModelsData, ...specialIssueModelsData], card.id)}
                    ]}
                ></CardList>
            </>}
        </>
    );
}

export default ForceEditor;
