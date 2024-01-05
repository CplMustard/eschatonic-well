import React from "react";
import { useHistory } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";
import { IonText, IonIcon, useIonToast, IonToolbar, IonSegment, IonSegmentButton, IonLabel } from "@ionic/react";
import { add, remove, logOut, logIn } from "ionicons/icons";

import { useSessionStorage } from "./util/useStorage.js";

import CardList from "./CardList";
import ForceCardList from "./ForceCardList";

import { cyphersData } from "./data";

const cypherTypeMin = 3;
const rackTabs = {rack: 0, special_issue: 1, cyphers: 2};

function RackEditor(props) {
    const history = useHistory();
    const [present] = useIonToast();

    const [tabSelected, setTabSelected] = useSessionStorage("rackTabs", rackTabs.rack);

    const { factionId, forceCyphersData, setForceCyphersData, specialIssueCyphersData, setSpecialIssueCyphersData } = props;

    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "bottom",
        });
    };

    const cyphers = (factionId && factionId !== "all") ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionId) || cypher.factions.includes("all"))) : Object.values(cyphersData);

    function cypherCount(cyphersData, cypherId) {
        return cyphersData.filter((forceCypher) => forceCypher.cypherId === cypherId).length;
    }

    function openCypherCard(id) {
        history.push(`/cypher/${id}`);
    }

    function addCypherCards(cypherIds) {
        let newForceCyphersData = forceCyphersData;
        const addedCypherNames = [];
        cypherIds.forEach((cypherId) => {
            if(cypherCount(newForceCyphersData, cypherId) === 0) {
                const cypherEntry = {id: uuidv1(), cypherId: cypherId, type: cyphersData[cypherId].type, name: cyphersData[cypherId].name, factions: cyphersData[cypherId].factions};
                newForceCyphersData = newForceCyphersData.concat(cypherEntry);
                addedCypherNames.push(cyphersData[cypherId].name);
            }
        });

        presentToast(`Added ${addedCypherNames.join(", ")} to rack`);

        setForceCyphersData(newForceCyphersData);
    }

    function removeCypherCard(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        if(index !== -1) {
            const removedCypherName = forceCyphersData[index].name;
            setForceCyphersData([...forceCyphersData.slice(0, index), ...forceCyphersData.slice(index + 1)]);
            
            presentToast(`Removed ${removedCypherName} from rack`);
        }
    }

    function addSpecialIssue(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        let newSpecialIssueCyphersData = specialIssueCyphersData;
        newSpecialIssueCyphersData.push(forceCyphersData[index]);
        removeCypherCard(id);
        setSpecialIssueCyphersData(newSpecialIssueCyphersData);
    }

    function removeSpecialIssue(id) {
        const index = specialIssueCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        addCypherCards([specialIssueCyphersData[index].cypherId]);
        let newSpecialIssueCyphersData = specialIssueCyphersData;
        newSpecialIssueCyphersData = [...newSpecialIssueCyphersData.slice(0, index), ...newSpecialIssueCyphersData.slice(index + 1)];
        setSpecialIssueCyphersData(newSpecialIssueCyphersData);
    }

    function canSpecialIssueSwap(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        const cypherType = forceCyphersData[index].type;
        return specialIssueCyphersData.filter((forceCypher) => forceCypher.type === cypherType).length !== 0;
    }

    const remainingCypherCardList = cyphers.filter((cypher) => forceCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1 && specialIssueCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1);

    return (
        <div>
            <IonToolbar>
                <IonSegment mode="ios" value={tabSelected} onIonChange={(e) => setTabSelected(e.detail.value)}>
                    <IonSegmentButton value={rackTabs.rack} fill="outline">
                        <IonLabel>Rack</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value={rackTabs.special_issue}>
                        <IonLabel>Special Issue</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value={rackTabs.cyphers}>
                        <IonLabel>Cyphers</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </IonToolbar>
            {tabSelected === rackTabs.rack && <>
                <ForceCardList 
                    header={"Rack"} 
                    forceEntries={forceCyphersData} 
                    typeMin={cypherTypeMin}
                    handleCardClicked={openCypherCard} 
                    cardActions={[
                        {handleClicked: removeCypherCard, text: <IonIcon slot="icon-only" icon={remove}></IonIcon>},
                        {handleClicked: addSpecialIssue, text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: canSpecialIssueSwap}
                    ]}
                ></ForceCardList>

                {forceCyphersData.length === 0 && <IonText color="primary"><h2>Add a cypher to your Rack with <IonIcon slot="icon-only" icon={add}></IonIcon> to view them here.</h2></IonText>}
            </>}
            {tabSelected === rackTabs.special_issue && <>
                <ForceCardList 
                    header={"Special Issue"} 
                    forceEntries={specialIssueCyphersData} 
                    handleCardClicked={openCypherCard} 
                    cardActions={[
                        {handleClicked: removeSpecialIssue, text: <IonIcon slot="icon-only" icon={logIn}></IonIcon>}
                    ]}
                ></ForceCardList>
                
                {specialIssueCyphersData.length === 0 && <IonText color="primary"><h2>Add a cypher to your Special Issue with <IonIcon slot="icon-only" icon={logOut}></IonIcon> to view them here.</h2></IonText>}
            </>}
            {tabSelected === rackTabs.cyphers && <>
                <CardList 
                    header={"Cyphers"} 
                    cards={remainingCypherCardList} 
                    handleCardClicked={openCypherCard} 
                    cardActions={[{handleClicked: (cypherId) => addCypherCards([cypherId]), text: <IonIcon slot="icon-only" icon={add}></IonIcon>}]}
                ></CardList>
            </>}
        </div>
    );
}

export default RackEditor;
