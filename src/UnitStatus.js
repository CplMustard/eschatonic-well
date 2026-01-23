import React from "react";
import { IonText, IonIcon, IonItem, IonLabel, IonAccordionGroup, IonAccordion } from "@ionic/react";
import { add, bodyOutline, create, remove, checkmarkCircle, checkmarkCircleOutline, skull, skullOutline, build, buildOutline, flame, flameOutline, flask, flaskOutline, lockClosed, lockClosedOutline, flashOff, flashOffOutline } from "ionicons/icons";

import { getModelsData } from "./DataLoader";

function UnitStatus(props) {
    const { rulesetId } = props;

    const modelsData = getModelsData(rulesetId);

    const { id, setArc, toggleActivation, toggleContinuousEffect, toggleDamageBox, arcInWell, isPlayMode, collapsible } = props;
    const { modelId, activated, arc, arcLimit, unitModels, attachments } = props.entry;

    const getSummary = () => {
        return <>
            <IonIcon color={"secondary"} icon={create} size="large"/><IonText style={{display: "inline-block"}}>{unitModels.length > 1 
                ? <><AliveSquadMembers unitModels={unitModels} attachments={attachments}/></>
                : unitModels[0].boxes.length !== 0 
                    ? <><HitBoxes modelIndex={0} model={unitModels[0]} showLabel={false} disabled={true}/></>
                    : <>{arcLimit > 0 && <ArcTracker arc={arc} arcLimit={arcLimit} disabled={true}></ArcTracker>}</>
                }
            </IonText>
        </>;
    };

    function ArcTracker(props) {
        const { arc, arcLimit, arcInWell, disabled } = props;
        console.log(arcInWell);

        return <IonText color="primary">
            <IonLabel>Arc:</IonLabel>
            {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
            {!collapsible && <br/>}
            <h1 style={{margin: 0}}>
                <IonIcon 
                    color={!disabled && arc-1 >= 0 ? "secondary" : "tertiary"}
                    icon={remove} 
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPlayMode) {
                            if(!disabled && arc-1 >= 0) {
                                setArc(id, arc-1);
                            }
                        }
                    }} 
                    size="large"
                ></IonIcon>
                <IonText>{arc}</IonText> 
                <IonIcon 
                    color={!disabled && (arc+1 <= arcLimit && arcInWell > 0) ? "secondary" : "tertiary"}
                    icon={add} 
                    onClick={(e) => {
                        e.preventDefault();
                        if (isPlayMode) {
                            if(!disabled && (arc+1 <= arcLimit && arcInWell > 0)) {
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
            {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
            {!collapsible && <br/>}
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
                {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
                {!collapsible && unitModels.length > 1 && <br/>}
                {unitModels[i].boxes.length !== 0 && <HitBoxes modelIndex={i} model={unitModels[i]} attachmentId={attachmentId ? attachmentId : undefined} showLabel={true}></HitBoxes>}
                {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
                {!collapsible && <br/>}
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
            {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
            {!collapsible && <br/>}            
            <h3 style={{margin: 0}}>
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
            </h3>
        </IonText>;
    }

    function AliveSquadMembers(props) {
        const { unitModels, attachments } = props;
        let AliveModelCount = 0;
        for (let i=0; i<unitModels.length; i++) {
            if (unitModels[i].boxes.some(box => box === false)) {
                AliveModelCount++;
            }
        }
        attachments.forEach((attachment) => {
            const unitModels = attachment.unitModels;
            for (let i=0; i<unitModels.length; i++) {
                if (unitModels[i].boxes.some(box => box === false)) {
                    AliveModelCount++;
                }
            }
        });
        return <IonText color="primary">
            <h1 style={{margin: 0, display: "inline"}}><IonIcon color={"secondary"} icon={bodyOutline} size="large"></IonIcon><IonText>{AliveModelCount}</IonText></h1>
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
            {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
            {!collapsible && <br/>}
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

    const statusEntryComponent = 
        <div className="status-entry" slot="content">
            {isPlayMode && <>
                <Activation activated={activated}></Activation>
                {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
                {!collapsible && <br/>}
                {arcLimit > 0 && <ArcTracker arc={arc} arcLimit={arcLimit} arcInWell={arcInWell}></ArcTracker>}
                {unitModels.length > 1 && <><AliveSquadMembers unitModels={unitModels} attachments={attachments}/><br/></>}
            </>}
            {attachments.length !== 0 && <IonText color="primary"><h2>{modelData.name}</h2></IonText>}
            <UnitModels unitModels={unitModels}></UnitModels>
            {isPlayMode && attachmentComponents}
        </div>;

    return (<div>
        {collapsible ? 
            <IonAccordionGroup>
                <IonAccordion value={id}>
                    <IonItem color={"dark"} slot="header">
                        <IonLabel>{getSummary()}</IonLabel>
                    </IonItem>
                    {statusEntryComponent}
                </IonAccordion>
            </IonAccordionGroup>
            : <>
                {statusEntryComponent}
            </>
        }
    </div>
    );
}

export default UnitStatus;