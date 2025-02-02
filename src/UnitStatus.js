import React from "react";
import { useHistory } from "react-router-dom";
import { IonText, IonButton, IonIcon, IonLabel } from "@ionic/react";
import { add, remove, checkmarkCircle, checkmarkCircleOutline, skull, skullOutline, build, buildOutline, flame, flameOutline, flask, flaskOutline, lockClosed, lockClosedOutline, flashOff, flashOffOutline } from "ionicons/icons";

import { modelsData } from "./data";

function UnitStatus(props) {
    const history = useHistory();

    const { id, setArc, toggleActivation, toggleContinuousEffect, toggleDamageBox, isPlayMode } = props;
    const { activated, arc, arcLimit, unitModels, attachments } = props.entry;

    function ArcTracker(props) {
        const { arc, arcLimit } = props;

        return <IonText color="primary">
            <IonLabel>Arc:</IonLabel>
            <h1>
                <IonText>{arc}</IonText> 
                <IonIcon 
                    color={arc-1 >= 0 ? "secondary" : "tertiary"}
                    icon={remove} 
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPlayMode) {
                            if(arc-1 >= 0) {
                                setArc(id, arc-1);
                            }
                        }
                    }} 
                    size="large"
                ></IonIcon>
                <IonIcon 
                    color={arc+1 <= arcLimit ? "secondary" : "tertiary"}
                    icon={add} 
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPlayMode) {
                            if(arc+1 <= arcLimit) {
                                setArc(id, arc+1);
                            }
                        }
                    }} 
                    size="large"
                ></IonIcon>
            </h1>
        </IonText>;
    }

    function Activation(props) {
        const { activated } = props;

        return <IonText color="primary">
            <IonLabel>Activated:</IonLabel>
            <IonIcon 
                color="secondary" 
                icon={activated ? checkmarkCircle : checkmarkCircleOutline} 
                onClick={(e) => {
                    e.preventDefault();
                    if (isPlayMode) {
                        toggleActivation(id);
                    }
                }} 
                size="large"
            ></IonIcon>
        </IonText>;
    }

    function UnitModels(props) {
        const { unitModels, attachmentId } = props;
        const modelComponents = [];

        for (let i=0; i<unitModels.length; i++) {
            modelComponents.push(<div key={i}>
                <IonLabel>{unitModels.length > 1 && `Model ${i+1}: `}</IonLabel>
                <HitBoxes modelIndex={i} model={unitModels[i]} attachmentId={attachmentId ? attachmentId : undefined}></HitBoxes>
                {isPlayMode && <ContinuousEffects modelIndex={i} model={unitModels[i]} attachmentId={attachmentId ? attachmentId : undefined}></ContinuousEffects>}
            </div>);
        }

        return modelComponents;
    }

    function HitBoxes(props) {
        const { modelIndex, attachmentId } = props;
        const { boxes } = props.model;
        return <IonText color="primary">
            <IonLabel>Boxes:</IonLabel>
            {[...Array(boxes.length)].map((e, i) => 
                <IonIcon 
                    key={i} 
                    color="secondary" 
                    icon={boxes[i] ? skull : skullOutline} 
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPlayMode) {
                            toggleDamageBox(id, modelIndex, attachmentId, i);
                        }
                    }} 
                    size="large"
                ></IonIcon>
            )}
        </IonText>;
    }

    const continuousEffectApplied = (continuousEffects, effectId) => continuousEffects && (continuousEffects.find((id) => id === effectId));

    const onClickContinuousEffect = (e, modelIndex, attachmentId, effectId) => {
        e.preventDefault();
        if (isPlayMode) {
            toggleContinuousEffect(id, modelIndex, attachmentId, effectId);
        }
    };

    function ContinuousEffects(props) {
        const { modelIndex, attachmentId } = props;
        const { continuousEffects } = props.model;
        return <IonText color="primary">
            <IonLabel>Continuous Effects:</IonLabel>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "fire") ? flame : flameOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, attachmentId, "fire")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "corrosion") ? flask : flaskOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, attachmentId, "corrosion")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "lockdown") ? lockClosed : lockClosedOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, attachmentId, "lockdown")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "systemfailure") ? flashOff : flashOffOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, attachmentId, "systemfailure")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "tuneup") ? build : buildOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, attachmentId, "tuneup")} size="large"></IonIcon>
        </IonText>;
    }

    function openModelCard(id) {
        history.push(`/model/${id}`);
    }

    const attachmentComponents = [];
    attachments && attachments.forEach((attachment, index) => {
        const modelData = modelsData[attachment.modelId];
        const factionId = modelData.factions.length === 1 ? modelData.factions[0] : "wc";
        attachmentComponents.push(<>
            <IonButton size="medium" className={factionId} expand="block" onClick={() => openModelCard(modelData.id)}>                             
                <div className="button-inner">
                    <div className="button-text">{modelData.name}</div>
                </div></IonButton>
            <UnitModels key={index} unitModels={attachment.unitModels} attachmentId={attachment.modelId}></UnitModels>
        </>
        );
    });

    return (
        <>
            {isPlayMode && <>
                <Activation activated={activated}></Activation>
                {arcLimit > 0 && <ArcTracker arc={arc} arcLimit={arcLimit}></ArcTracker>}
            </>}
            <UnitModels unitModels={unitModels}></UnitModels>
            {isPlayMode && attachmentComponents}
        </>
    );
}

export default UnitStatus;