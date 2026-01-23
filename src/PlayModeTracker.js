import React, {useState} from "react";
import { useSessionStorageState } from "ahooks";
import { IonText, IonGrid, IonCol, IonRow, IonIcon } from "@ionic/react";
import { remove, add } from "ionicons/icons";

import { getModelsData } from "./DataLoader";

function PlayModeTracker(props) {
    const [unitsStatus, ] = useSessionStorageState("unitsStatus", {defaultValue: [], listenStorageChange: true});
    const [score, setScore] = useState(0);

    const { rulesetId, factionId } = props;

    const modelsData = getModelsData(rulesetId);

    const totalArc = 7;
    const arcInWell = unitsStatus.reduce((currentArc, unitStatus) => currentArc - (unitStatus.arc ? unitStatus.arc : 0), totalArc);

    const dcDeployed = unitsStatus.reduce((currentDC, unitStatus) => currentDC + (Number.isInteger(modelsData[unitStatus.modelId].stats.dc) && modelsData[unitStatus.modelId].type !== "mantlet" ? modelsData[unitStatus.modelId].stats.dc : 0), 0);

    return <div className={factionId}>
        <IonGrid>
            <IonRow>
                <IonCol>
                    <IonText color="primary"><h3 className="play-tracker-status">ARC IN WELL : <span style={{fontSize: "2rem", position: "relative", top: "0.25rem"}}>{arcInWell}</span> / 7</h3></IonText>
                </IonCol>
                <IonCol>
                    <IonText color="primary"><h3 className="play-tracker-status">DC DEPLOYED : <span style={{fontSize: "2rem", position: "relative", top: "0.25rem"}}>{dcDeployed}</span></h3></IonText>
                </IonCol>
                <IonCol>
                    <IonText color="primary"><h3 className="play-tracker-status">SCORE : 
                        <span style={{position: "relative", top: "0.25rem"}}>
                            <IonIcon 
                                color={score-1 < 0 ? "tertiary" : "primary"}
                                style={{position: "relative", top: "0.125rem"}}
                                icon={remove} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    if(score > 0) {
                                        setScore(score-1);
                                    }
                                }} 
                                size="large"
                            ></IonIcon>
                            <span style={{fontSize: "2rem"}}>{score}</span>
                            <IonIcon 
                                color={score+1 > 99 ? "tertiary" : "primary"}
                                style={{position: "relative", top: "0.125rem"}}
                                icon={add} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    if(score < 99) {
                                        setScore(score+1);
                                    }
                                }} 
                                size="large"
                            ></IonIcon>
                        </span>
                        </h3>
                    </IonText>
                </IonCol>
            </IonRow>
        </IonGrid>
    </div>;
}

export default PlayModeTracker;
