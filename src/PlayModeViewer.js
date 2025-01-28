import React, { useReducer } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStorageState } from "ahooks";
import { IonText, IonIcon, useIonToast } from "@ionic/react";
import { download, push } from "ionicons/icons";

import ForceCardList from "./ForceCardList";
import { playTabs } from "./EditorView.js";

import { modelsData } from "./data";

function PlayModeViewer(props) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const history = useHistory();
    const [present] = useIonToast();

    const [unitsStatus, setUnitsStatus] = useSessionStorageState("unitsStatus", {defaultValue: []});
    
    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
        });
    };

    const tabSelected = props.tabSelected;
    const models = props.forceModelsData;
    const cyphers = props.forceCyphersData;
    const specialIssueModels = props.specialIssueModelsData;
    const specialIssueCyphers = props.specialIssueCyphersData;

    function openModelCard(modelId, entryId) {
        history.push(`/model/${modelId}`, { entryId: entryId, isPlayMode: true, isSpecialIssue: specialIssueModels.filter((entry) => entry.id === entryId).length !== 0 });
    }

    function openCypherCard(cypherId) {
        history.push(`/cypher/${cypherId}`);
    }

    function deployModel(entryId) {
        let newUnitsStatus = unitsStatus;
        const modelId = models.find((entry) => entry.id === entryId).modelId;
        const modelData = modelsData[modelId];
        const unitModels = [];

        if (modelData.stats.squad_size) {
            for (let i=0; i < modelData.stats.squad_size; i++) {
                unitModels.push({boxes: Array(modelData.stats.boxes).fill(false), continuousEffects: new Set()});
            }
        } else {
            unitModels.push({boxes: Array(modelData.stats.boxes).fill(false), continuousEffects: new Set()});
        }

        const arcLimit = modelData.type === "void_gate" ? 5 : modelData.type === "warjack" ? 3 : modelData.special_rules.includes("awakened_spirit") ? 0 : 1;

        newUnitsStatus.push({id: entryId, modelId: modelId, activated: false, arc: 0, arcLimit: arcLimit, unitModels: unitModels});

        const isSpecialIssue = specialIssueModels.filter((entry) => entry.id === entryId).length !== 0;
        const modelName = isSpecialIssue ? specialIssueModels.find((entry) => entry.entryId === entryId).name : modelData.name;

        presentToast(`Deployed ${modelName} to the table.`);
        setUnitsStatus(newUnitsStatus);
        forceUpdate();
    }

    function recallModel(entryId) {
        const index = unitsStatus.findIndex((entry) => entry.id === entryId);

        const isSpecialIssue = specialIssueModels.filter((entry) => entry.id === entryId).length !== 0;
        const modelName = isSpecialIssue ? specialIssueModels.find((entry) => entry.entryId === entryId).name : models.find((entry) => entry.id === entryId).name;

        let newUnitsStatus = [...unitsStatus.slice(0, index), ...unitsStatus.slice(index + 1)];

        presentToast(`Recalled ${modelName} from the table.`);
        setUnitsStatus(newUnitsStatus);
        forceUpdate();
    }

    function setArc(id, arc) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        if(arc <= unitsStatus[index].arcLimit) {
            unitsStatus[index].arc = arc;
            setUnitsStatus(newUnitsStatus);
            forceUpdate();
        }
    }

    function toggleActivation(id) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        unitsStatus[index].activated = !unitsStatus[index].activated;
        setUnitsStatus(newUnitsStatus);
        forceUpdate();
    }

    function toggleContinuousEffect(id, modelIndex, effectId) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        const continuousEffects = unitsStatus[index].unitModels[modelIndex].continuousEffects;
        if(continuousEffects.has(effectId)) {
            continuousEffects.delete(effectId);
        } else {
            continuousEffects.add(effectId);
        }
        setUnitsStatus(newUnitsStatus);
        forceUpdate();
    }

    function toggleDamageBox(id, modelIndex, boxIndex) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        const boxes = unitsStatus[index].unitModels[modelIndex].boxes;
        boxes[boxIndex] = !boxes[boxIndex];
        setUnitsStatus(newUnitsStatus);
        forceUpdate();
    }

    const deployedModels = models.filter((model) => unitsStatus.find((entry) => entry.id === model.id));

    return (
        <div className="container">
            {(tabSelected === playTabs.deployed) && <>
                <IonText><h3>Tap Reserves and deploy a unit with <IonIcon slot="icon-only" icon={download}></IonIcon> to track their status here. Recall units with <IonIcon slot="icon-only" icon={push}></IonIcon></h3></IonText>
                <ForceCardList
                    id={"PlayDeployed"}
                    header={"Deployed"}
                    forceEntries={deployedModels} 
                    unitsStatus={unitsStatus}
                    isPlayMode={true}
                    handleCardClicked={openModelCard} 
                    hideHiddenTypes={false}
                    setArc={setArc}
                    toggleActivation={toggleActivation}
                    toggleContinuousEffect={toggleContinuousEffect}
                    toggleDamageBox={toggleDamageBox}
                    cardActions={[
                        {handleClicked: (entryId) => recallModel(entryId), text: <IonIcon slot="icon-only" icon={push}></IonIcon> }, 
                    ]}
                >
                </ForceCardList>
            </>}
            {(tabSelected === playTabs.reserves) && <>
                <ForceCardList 
                    id={"PlayReserves"} 
                    header={"Models"} 
                    forceEntries={models} 
                    isPlayMode={true}
                    handleCardClicked={openModelCard} 
                    hideHiddenTypes={true}
                    cardActions={[
                        {handleClicked: (entryId) => deployModel(entryId), text: <IonIcon slot="icon-only" icon={download}></IonIcon>, isDisabled: (entryId) => unitsStatus.find((entry) => entry.id === entryId) }, 
                    ]}
                >
                </ForceCardList>
                <ForceCardList id={"PlaySpecialIssueModels"} header={"Special Issue"} forceEntries={specialIssueModels} handleCardClicked={openModelCard}></ForceCardList>
            </>}
            {(tabSelected === playTabs.rack) && <>
                <ForceCardList id={"PlayCyphers"} header={"Cyphers"} forceEntries={cyphers} handleCardClicked={openCypherCard}></ForceCardList>
                <ForceCardList id={"PlaySpecialIssueCyphers"} header={"Special Issue"} forceEntries={specialIssueCyphers} handleCardClicked={openCypherCard}></ForceCardList>
            </>}
        </div>
    );
}

export default PlayModeViewer;
