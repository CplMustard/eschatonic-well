import React, { useReducer } from "react";
import { useHistory } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";
import { IonText, IonIcon, useIonToast } from "@ionic/react";
import { add, remove, logOut, logIn } from "ionicons/icons";

import CardList from "./CardList";
import ForceCardList from "./ForceCardList";
import { rackTabs } from "./EditorView.js";

import { getCyphersData } from "./DataLoader";

const cypherTypeMin = 3;

function RackEditor(props) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const history = useHistory();
    const [present] = useIonToast();
    
    const { tabSelected, rulesetId, factionId, forceCyphersData, setForceCyphersData, specialIssueCyphersData, setSpecialIssueCyphersData } = props;

    const cyphersData = getCyphersData(rulesetId);

    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
        });
    };

    const cyphers = (factionId && factionId !== "all") ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionId) || cypher.factions.includes("all"))) : Object.values(cyphersData);

    function cypherCount(rackData, cypherId) {
        return rackData.filter((forceCypher) => forceCypher.cypherId === cypherId).length;
    }

    function openCypherCard(id) {
        history.push(`/cypher/${id}`, { rulesetId: rulesetId });
    }

    function addCypherCards(cypherIds) {
        let newForceCyphersData = forceCyphersData;
        const addedCypherNames = [];
        cypherIds.forEach((cypherId) => {
            if(cypherCount([...forceCyphersData, ...specialIssueCyphersData], cypherIds) === 0) {
                const cypherEntry = {id: uuidv1(), cypherId: cypherId, type: cyphersData[cypherId].type, name: cyphersData[cypherId].name, factions: cyphersData[cypherId].factions};
                newForceCyphersData = newForceCyphersData.concat(cypherEntry);
                addedCypherNames.push(cyphersData[cypherId].name);
            }
        });

        presentToast(`Added ${addedCypherNames.join(", ")} to rack`);

        updateForceData(newForceCyphersData);
    }

    function removeCypherCard(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        if(index !== -1) {
            const removedCypherName = forceCyphersData[index].name;
            updateForceData([...forceCyphersData.slice(0, index), ...forceCyphersData.slice(index + 1)]);
            
            presentToast(`Removed ${removedCypherName} from rack`);
        }
    }

    function addSpecialIssue(cypherIds) {
        let newSpecialIssueCyphersData = specialIssueCyphersData;
        const addedCypherNames = [];
        cypherIds.forEach((cypherId) => {
            if(cypherCount([...forceCyphersData, ...specialIssueCyphersData], cypherIds) === 0) {
                const cypherEntry = {id: uuidv1(), cypherId: cypherId, type: cyphersData[cypherId].type, name: cyphersData[cypherId].name, factions: cyphersData[cypherId].factions};
                newSpecialIssueCyphersData = newSpecialIssueCyphersData.concat(cypherEntry);
                addedCypherNames.push(cyphersData[cypherId].name);
            }
        });

        presentToast(`Added ${addedCypherNames.join(", ")} to special issue`);

        updateSpecialIssueData(newSpecialIssueCyphersData);
    }

    function removeSpecialIssue(id) {
        const index = specialIssueCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        if(index !== -1) {
            const removedCypherName = specialIssueCyphersData[index].name;
            updateSpecialIssueData([...specialIssueCyphersData.slice(0, index), ...specialIssueCyphersData.slice(index + 1)]);
            
            presentToast(`Removed ${removedCypherName} from special issue`);
        }
    }

    function swapToSpecialIssue(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        let newSpecialIssueCyphersData = specialIssueCyphersData;
        newSpecialIssueCyphersData.push(forceCyphersData[index]);

        presentToast(`Swapped ${forceCyphersData[index].name} to special issue`);

        removeCypherCard(id);
        updateSpecialIssueData(newSpecialIssueCyphersData);
    }

    function swapFromSpecialIssue(id) {
        const index = specialIssueCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        addCypherCards([specialIssueCyphersData[index].cypherId]);
        let newSpecialIssueCyphersData = specialIssueCyphersData;
        newSpecialIssueCyphersData = [...newSpecialIssueCyphersData.slice(0, index), ...newSpecialIssueCyphersData.slice(index + 1)];

        presentToast(`Swapped ${specialIssueCyphersData[index].name} to rack`);

        updateSpecialIssueData(newSpecialIssueCyphersData);
    }

    function updateForceData(newForceData) {
        setForceCyphersData(newForceData);
        localStorage.setItem("forceCyphersData", JSON.stringify(newForceData));
        forceUpdate();
    }

    function updateSpecialIssueData(newSpecialIssueCyphersData) {
        setSpecialIssueCyphersData(newSpecialIssueCyphersData);
        localStorage.setItem("specialIssueCyphersData", JSON.stringify(newSpecialIssueCyphersData));
        forceUpdate();
    }

    function canSpecialIssueSwap(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        const cypherType = forceCyphersData[index].type;
        return specialIssueCyphersData.some((forceCypher) => forceCypher.type === cypherType);
    }

    function canAddToSpecialIssue(cypherId) {
        const cypherType = cyphersData[cypherId].type;
        return !specialIssueCyphersData.some((forceCypher) => forceCypher.type === cypherType);
    }

    const remainingCypherCardList = cyphers.filter((cypher) => forceCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1 && specialIssueCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1);

    return (
        <div>
            {tabSelected === rackTabs.rack && <>
                <ForceCardList 
                    rulesetId={rulesetId} 
                    id={"Rack"}
                    header={"Rack"} 
                    forceEntries={forceCyphersData} 
                    typeMin={cypherTypeMin}
                    handleCardClicked={openCypherCard} 
                    cardActions={[
                        {handleClicked: removeCypherCard, text: <IonIcon slot="icon-only" icon={remove}></IonIcon>},
                        {handleClicked: swapToSpecialIssue, text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: canSpecialIssueSwap}
                    ]}
                ></ForceCardList>

                {forceCyphersData.length === 0 && <IonText color="primary"><h2>Tap <i>Cyphers</i> and add a cypher to your Rack with <IonIcon slot="icon-only" icon={add}></IonIcon> to view them here.</h2></IonText>}
            </>}
            {tabSelected === rackTabs.special_issue && <>
                <ForceCardList 
                    rulesetId={rulesetId} 
                    id={"RackSpecialIssue"}
                    header={"Special Issue"} 
                    forceEntries={specialIssueCyphersData} 
                    handleCardClicked={openCypherCard} 
                    cardActions={[
                        {handleClicked: removeSpecialIssue, text: <IonIcon slot="icon-only" icon={remove}></IonIcon>}, 
                        {handleClicked: swapFromSpecialIssue, text: <IonIcon slot="icon-only" icon={logIn}></IonIcon>}
                    ]}
                ></ForceCardList>
                
                {specialIssueCyphersData.length === 0 && <IonText color="primary"><h2>Add a cypher to your Special Issue with <IonIcon slot="icon-only" icon={logOut}></IonIcon> to view them here.</h2></IonText>}
            </>}
            {tabSelected === rackTabs.cyphers && <>
                <CardList 
                    rulesetId={rulesetId} 
                    id={"CypherEditor"}
                    header={"Cyphers"} 
                    cards={remainingCypherCardList} 
                    handleCardClicked={openCypherCard} 
                    cardActions={[
                        {handleClicked: (cypherId) => addCypherCards([cypherId]), text: <IonIcon slot="icon-only" icon={add}></IonIcon>},
                        {handleClicked: (cypherId) => addSpecialIssue([cypherId]), text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: (id) => !canAddToSpecialIssue(id) || cypherCount([...forceCyphersData, ...specialIssueCyphersData], id) !== 0}
                    ]}
                ></CardList>
            </>}
        </div>
    );
}

export default RackEditor;
