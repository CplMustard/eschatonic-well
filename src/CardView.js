import React, { createRef } from "react";
import { useLocalStorageState } from "ahooks";
import { IonPage, IonContent, IonHeader, IonToolbar, IonText, IonSelect,  IonButtons, IonBackButton, IonSelectOption, useIonAlert, useIonToast } from "@ionic/react";
import { warning } from "ionicons/icons";


import CardListViewer from "./CardListViewer.js";
import VersionNumber from "./VersionNumber.js";

import { getFactionsData, rulesets } from "./DataLoader.js";

function CardView() {
    const [presentAlert] = useIonAlert();
    const [present] = useIonToast();
    
    const [cardViewFactionId, setCardViewFactionId] = useLocalStorageState("cardViewFactionId", {defaultValue: "all"});
    const [rulesetId, setRulesetId] = useLocalStorageState("rulesetId", {defaultValue: "pp"});

    const factionsData = getFactionsData(rulesetId);

    const presentToast = (message, isWarning) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
            icon: isWarning ? warning : undefined,
            color: isWarning ? "warning" : undefined
        });
    };

    const contentRef = createRef();

    const changeCardViewFaction = (newFactionId) => {
        setCardViewFactionId(newFactionId);
    };

    const changeRuleset = (newRulesetId) => {
        presentToast(`Ruleset changed to ${rulesets[newRulesetId].name}`);
        setRulesetId(newRulesetId);
    };

    const changeRulesetConfirm = (newRulesetId) => {
        if(rulesetId !== newRulesetId) {
            presentAlert({
                header: "Change Ruleset?",
                buttons: [
                    {
                        text: "Cancel",
                        role: "cancel",
                        handler: () => {},
                    },
                    {
                        text: "OK",
                        role: "confirm",
                        handler: () => changeRuleset(newRulesetId),
                    },
                ],
                onDidDismiss: () => {}
            });
        }
    };

    const factionSelectOptions = [];
    Object.entries(factionsData).forEach(([key, value]) => {
        if(!value.hidden) {
            factionSelectOptions.push(<IonSelectOption key={key} value={value.id}>{value.name}</IonSelectOption>);
        }
    });
    factionSelectOptions.push(<IonSelectOption key={"all"} value={"all"}>ALL</IonSelectOption>);

    const rulesetSelectOptions = [];
    Object.entries(rulesets).forEach(([key, value]) => {
        if(!value.hidden) {
            rulesetSelectOptions.push(<IonSelectOption key={key} value={value.id}>{value.name}</IonSelectOption>);
        }
    });

    return (
        <IonPage className={cardViewFactionId}>
            <IonHeader>
                <VersionNumber/>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent ref={contentRef}>
                <>
                    <IonText color="primary"><h3 className="label"><IonSelect label="Ruleset:" justify="start" value={rulesetId} onIonChange={(e) => changeRulesetConfirm(e.detail.value)}>{rulesetSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3 className="label"><IonSelect label="Faction:" justify="start" value={cardViewFactionId} onIonChange={(e) => changeCardViewFaction(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                </>

                <CardListViewer 
                    rulesetId={rulesetId}
                    factionId={cardViewFactionId}
                ></CardListViewer>

            </IonContent>
        </IonPage>
    );
}

export default CardView;
