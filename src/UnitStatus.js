import React from "react";
import { IonText, IonIcon, IonItem, IonLabel, IonAccordionGroup, IonAccordion } from "@ionic/react";
import { add, create, remove, checkmarkCircle, checkmarkCircleOutline, skull, skullOutline, build, buildOutline, flame, flameOutline, flask, flaskOutline, lockClosed, lockClosedOutline, flashOff, flashOffOutline } from "ionicons/icons";

import { modelsData } from "./data";

function UnitStatus(props) {
    const { id, setArc, toggleActivation, toggleContinuousEffect, toggleDamageBox, isPlayMode } = props;
    const { modelId, activated, arc, arcLimit, unitModels, attachments } = props.entry;

    const getSummary = () => {
        return <><IonIcon color={"secondary"} icon={create} size="large"/><HitBoxes modelIndex={0} model={unitModels[0]} showLabel={false} disabled={true}/></>;
    };

    function ArcTracker(props) {
        const { arc, arcLimit } = props;

        return <IonText color="primary">
            <IonLabel>Arc:</IonLabel>
            <h1 style={{margin: 0}}>                
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
                <IonText>{arc}</IonText> 
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
                <HitBoxes modelIndex={i} model={unitModels[i]} attachmentId={attachmentId ? attachmentId : undefined} showLabel={true}></HitBoxes>
                {isPlayMode && <ContinuousEffects modelIndex={i} model={unitModels[i]} attachmentId={attachmentId ? attachmentId : undefined}></ContinuousEffects>}
            </div>);
        }

        return modelComponents;
    }

    function HitBoxes(props) {
        const { modelIndex, attachmentId, showLabel, disabled } = props;
        const { boxes } = props.model;
        return <IonText color="primary">
            {showLabel && <IonLabel>Boxes:</IonLabel>}
            {[...Array(boxes.length)].map((e, i) => 
                <IonIcon 
                    key={i} 
                    color="secondary" 
                    icon={boxes[i] ? skull : skullOutline} 
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPlayMode && !disabled) {
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

    const attachmentComponents = [];
    attachments && attachments.forEach((attachment, index) => {
        const attachmentModelData = modelsData[attachment.modelId];
        attachmentComponents.push(<div key={index}>
            <IonText color="primary"><h2>{attachmentModelData.name}</h2></IonText>
            <UnitModels unitModels={attachment.unitModels} attachmentId={attachment.modelId}></UnitModels>
        </div>
        );
    });

    const modelData = modelsData[modelId];

    return (
        <IonAccordionGroup>
            <IonAccordion value={id}>
                <IonItem color={"dark"} slot="header">
                    <IonLabel>{getSummary()}</IonLabel>
                </IonItem>
                <div className="status-entry" slot="content">
                    {isPlayMode && <>
                        <Activation activated={activated}></Activation>
                        {arcLimit > 0 && <ArcTracker arc={arc} arcLimit={arcLimit}></ArcTracker>}
                    </>}
                    {attachments.length !== 0 && <IonText color="primary"><h2>{modelData.name}</h2></IonText>}
                    <UnitModels unitModels={unitModels}></UnitModels>
                    {isPlayMode && attachmentComponents}
                </div>
            </IonAccordion>
        </IonAccordionGroup>
    );
}

export default UnitStatus;