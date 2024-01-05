import React, { useEffect, useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";
import { IonText, IonIcon, useIonToast, IonToolbar, IonSegment, IonSegmentButton, IonLabel } from "@ionic/react";
import { add, remove, logOut, logIn } from "ionicons/icons";

import CardList from "./CardList";
import ForceCardList from "./ForceCardList.js";

import { isHidden } from "./util/isHidden.js";
import { useSessionStorage } from "./util/useStorage.js";

import { cadresData,  modelsData, weaponsData } from "./data";
import CadreList from "./CadreList";

const voidGateId = "void_gate";
const forceTabs = {force: 0, special_issue: 1, units: 2 };

function ForceEditor(props) {
    const history = useHistory();
    const [present] = useIonToast();

    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const [tabSelected, setTabSelected] = useSessionStorage("forceTabs", forceTabs.force);
    const [forceEmpty, setForceEmpty] = useState(true);

    const { factionId, forceModelsData, setForceModelsData, specialIssueModelsData, setSpecialIssueModelsData } = props;

    useEffect(() => {
        setForceModelsData(forceModelsData);
        setSpecialIssueModelsData(specialIssueModelsData);
    });

    useEffect(() => {
        let newForceData = forceModelsData;
        let addedModelNames = [];
        if(newForceData.findIndex((forceModel) => forceModel.modelId === voidGateId) === -1) {
            newForceData = insertModelCard(newForceData, voidGateId, addedModelNames);
        }

        const allMantlets = Object.values(modelsData).filter((modelData) => modelData.type === "mantlet");
        const availableMantlets = (factionId && factionId !== "all") ? allMantlets.filter((modelData) => {
            return modelData.factions.includes(factionId);
        }) : allMantlets;
        availableMantlets.forEach((modelData) => {
            if(newForceData.findIndex((forceModel) => forceModel.modelId === modelData.id) === -1) {
                newForceData = insertModelCard(newForceData, modelData.id, addedModelNames);
            }
        });

        //Show empty force prompt if we only have mantlets or void_gates
        setForceEmpty(newForceData.length === availableMantlets.length + 1);
        
        setForceModelsData(newForceData);
    }, [forceModelsData, specialIssueModelsData, factionId]);
    
    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "bottom",
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
        
        const canRemove = !isHidden(modelId);
        const forceEntry = {id: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, factions: modelData.factions, canRemove: canRemove, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
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

    function openModelCard(modelId, entryId) {
        history.push(`/model/${modelId}`, { entryId: entryId, isSpecialIssue: specialIssueModelsData.filter((entry) => entry.id === entryId).length !== 0 });
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
        
        presentToast(`Added ${addedModelNames.join(", ")} to forcelist`);

        setForceModelsData(newForceData);
        forceUpdate();
    }

    function removeModelCard(id) {
        let deletedModelNames = [];
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        if(index !== -1) {
            let newForceData = forceModelsData;
            newForceData = deleteModelCard(newForceData, index, deletedModelNames);

            presentToast(`Deleted ${deletedModelNames.join(", ")} from forcelist`);

            setForceModelsData(newForceData);
            forceUpdate();
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

                const canRemove = !isHidden(modelId);
                const forceEntry = {id: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, factions: modelData.factions, canRemove: canRemove, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
                addedModelNames.push(modelData.name);
                newSpecialIssueModelsData.push(forceEntry);
            }
        });

        presentToast(`Added ${addedModelNames.join(", ")} to special issue`);

        setSpecialIssueModelsData(newSpecialIssueModelsData);
        localStorage.setItem("specialIssueModelsData", JSON.stringify(newSpecialIssueModelsData));
        forceUpdate();
    }

    function removeSpecialIssue(id) {
        const index = specialIssueModelsData.findIndex((forceModel) => forceModel.id === id);
        const modelId = specialIssueModelsData[index].modelId;
        const modelData = modelsData[modelId];
    
        let newSpecialIssueModelsData = specialIssueModelsData;
        newSpecialIssueModelsData = [...newSpecialIssueModelsData.slice(0, index), ...newSpecialIssueModelsData.slice(index + 1)];
        
        presentToast(`Removed ${modelData.name} from special issue`);

        setSpecialIssueModelsData(newSpecialIssueModelsData);
        localStorage.setItem("specialIssueModelsData", JSON.stringify(newSpecialIssueModelsData));
        forceUpdate();
    }

    function swapToSpecialIssue(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        let newSpecialIssueModelsData = specialIssueModelsData;
        let deletedModelNames = [];
        if(index !== -1) {
            newSpecialIssueModelsData.push(forceModelsData[index]);
            let newForceData = forceModelsData;
            newForceData = deleteModelCard(newForceData, index, deletedModelNames);

            //Don't list the special issue model as deleted from forcelist
            deletedModelNames.splice(deletedModelNames.indexOf(forceModelsData[index].name), 1);

            presentToast(`Swapped ${forceModelsData[index].name} to special issue${deletedModelNames.length !== 0 ? `, ${deletedModelNames.join(", ")} deleted from forcelist` : ""}`);

            setSpecialIssueModelsData(newSpecialIssueModelsData);
            localStorage.setItem("specialIssueModelsData", JSON.stringify(newSpecialIssueModelsData));
            setForceModelsData(newForceData);
            forceUpdate();
        }
    }

    function swapFromSpecialIssue(id) {
        const index = specialIssueModelsData.findIndex((forceModel) => forceModel.id === id);
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
        
        presentToast(`Swapped ${modelData.name} to forcelist${addedModelNames.length !== 0 ? `, ${addedModelNames.join(", ")} added to forcelist` : ""}`);

        setSpecialIssueModelsData(newSpecialIssueModelsData);
        localStorage.setItem("specialIssueModelsData", JSON.stringify(newSpecialIssueModelsData));
        setForceModelsData(newForceData);
        forceUpdate();
    }

    function isCardUnremovable(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        return !forceModelsData[index].canRemove;
    }

    function canSpecialIssueSwap(id) {
        const index = forceModelsData.findIndex((forceModel) => forceModel.id === id);
        const modelType = forceModelsData[index].type;
        return !isCardUnremovable(id) && !specialIssueModelsData.some((forceModel) => forceModel.type === modelType);
    }

    function canAddToSpecialIssue(modelId) {
        const modelType = modelsData[modelId].type;
        return !specialIssueModelsData.some((forceModel) => forceModel.type === modelType);
    }

    function updateModelHardPoint(forceData, setModelsData, option, type, point_cost, hardPointIndex, id) {
        const index = forceData.findIndex((forceModel) => forceModel.id === id);
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
            <IonToolbar>
                <IonSegment mode="ios" value={tabSelected} onIonChange={(e) => setTabSelected(e.detail.value)}>
                    <IonSegmentButton value={forceTabs.force} fill="outline">
                        <IonLabel>Forcelist</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value={forceTabs.special_issue}>
                        <IonLabel>Special Issue</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value={forceTabs.units}>
                        <IonLabel>Units</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </IonToolbar>
            {tabSelected === forceTabs.force && <>
                {forceEmpty && <IonText color="primary"><h2>Add a unit to your Force with <IonIcon slot="icon-only" icon={add}></IonIcon> to view them here.</h2></IonText>}

                <ForceCardList 
                    header={"Force"} 
                    forceEntries={forceModelsData} 
                    handleCardClicked={openModelCard} 
                    cardActions={[
                        {handleClicked: removeModelCard, text: <IonIcon slot="icon-only" icon={remove}></IonIcon>, isDisabled: isCardUnremovable}, 
                        {handleClicked: swapToSpecialIssue, text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: (id) => !canSpecialIssueSwap(id)}
                    ]} 
                    updateModelHardPoint={(option, type, point_cost, hardPointIndex, id) => {updateModelHardPoint(forceModelsData, setForceModelsData, option, type, point_cost, hardPointIndex, id);}}
                ></ForceCardList>
            </>}
            {tabSelected === forceTabs.special_issue && <>
                {specialIssueModelsData.length === 0 && <IonText color="primary"><h2>Add a unit to your Special Issue with <IonIcon slot="icon-only" icon={logOut}></IonIcon> to view them here.</h2></IonText>}

                <ForceCardList 
                    header={"Special Issue"} 
                    forceEntries={specialIssueModelsData} 
                    handleCardClicked={openModelCard} 
                    cardActions={[
                        {handleClicked: removeSpecialIssue, text: <IonIcon slot="icon-only" icon={remove}></IonIcon>}, 
                        {handleClicked: swapFromSpecialIssue, text: <IonIcon slot="icon-only" icon={logIn}></IonIcon>}
                    ]} 
                    updateModelHardPoint={(option, type, point_cost, hardPointIndex, id) => {updateModelHardPoint(specialIssueModelsData, setSpecialIssueModelsData, option, type, point_cost, hardPointIndex, id);}}
                ></ForceCardList>
            </>}
            {tabSelected === forceTabs.units && <>
                <CadreList cadresData={cadresData} addModelCards={addModelCards} factionId={factionId}></CadreList>
                <br/>
                <CardList 
                    header={"Models"} 
                    cards={models} 
                    hideHiddenTypes={true} 
                    handleCardClicked={openModelCard} 
                    faText={(id) => getFAText([...forceModelsData, ...specialIssueModelsData], id)}
                    cardActions={[
                        {handleClicked: (modelId) => addModelCards([modelId]), text: <IonIcon slot="icon-only" icon={add}></IonIcon>, isDisabled: (id) => !checkFA([...forceModelsData, ...specialIssueModelsData], id) }, 
                        {handleClicked: (modelId) => addSpecialIssue([modelId]), text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: (id) => !canAddToSpecialIssue(id)}
                    ]}
                ></CardList>
            </>}
        </>
    );
}

export default ForceEditor;
