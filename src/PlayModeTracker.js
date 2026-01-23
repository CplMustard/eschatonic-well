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

    return (<>
        <IonGrid className={factionId}>
            <IonRow>
                <IonCol>
                    <IonText color="primary"><h6 className="play-tracker-label">ARC IN WELL : <span className="play-tracker-value">{arcInWell}</span> / 7</h6></IonText>
                </IonCol>
                <IonCol>
                    <IonText color="primary"><h6 className="play-tracker-label">DC DEPLOYED : <span className="play-tracker-value">{dcDeployed}</span></h6></IonText>
                </IonCol>
                <IonCol>
                    <IonText color="primary">
                        <h6 className="play-tracker-label">SCORE : 
                            <span>
                                <IonIcon 
                                    color={score-1 < 0 ? "tertiary" : "primary"}
                                    style={{position: "relative", top: "0.5rem", fontSize: "24px"}}
                                    icon={remove} 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if(score > 0) {
                                            setScore(score-1);
                                        }
                                    }} 
                                    size="32px"
                                ></IonIcon>
                                <span className="play-tracker-value">{score}</span>
                                <IonIcon 
                                    color={score+1 > 99 ? "tertiary" : "primary"}
                                    style={{position: "relative", top: "0.5rem", fontSize: "24px"}}
                                    icon={add} 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if(score < 99) {
                                            setScore(score+1);
                                        }
                                    }} 
                                ></IonIcon>
                            </span>
                        </h6>
                    </IonText>
                </IonCol>
            </IonRow>
        </IonGrid>
    </>);
}

export default PlayModeTracker;
