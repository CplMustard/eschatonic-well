import React from "react";
import { IonText, IonIcon, IonLabel } from "@ionic/react";
import { arrowDown, arrowUp, checkmarkCircle, checkmarkCircleOutline, skull, skullOutline, build, buildOutline, flame, flameOutline, flask, flaskOutline, lockClosed, lockClosedOutline, flashOff, flashOffOutline } from "ionicons/icons";

function UnitStatus(props) {
    const { id, setArc, toggleActivation, toggleContinuousEffect, toggleDamageBox, isPlayMode } = props;
    const { activated, arc, arcLimit, unitModels } = props.entry;

    function ArcTracker(props) {
        const { arc, arcLimit } = props;

        return <IonText color="primary">
            <IonLabel>Arc:</IonLabel>
            <h1>
                <IonIcon 
                    color={arc-1 >= 0 ? "secondary" : "tertiary"}
                    icon={arrowDown} 
                    onClick={(e) => {
                        console.log("whomst");
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
                    icon={arrowUp} 
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
        const { unitModels } = props;
        const modelComponents = [];

        for (let i=0; i<unitModels.length; i++) {
            modelComponents.push(<div key={i}>
                <IonLabel>{unitModels.length > 1 && `Model ${i+1}: `}</IonLabel>
                <HitBoxes modelIndex={i} model={unitModels[i]}></HitBoxes>
                {isPlayMode && <ContinuousEffects modelIndex={i} model={unitModels[i]}></ContinuousEffects>}
            </div>);
        }

        return modelComponents;
    }

    function HitBoxes(props) {
        const { modelIndex } = props;
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
                            toggleDamageBox(id, modelIndex, i);
                        }
                    }} 
                    size="large"
                ></IonIcon>
            )}
        </IonText>;
    }

    const continuousEffectApplied = (continuousEffects, effectId) => continuousEffects && (continuousEffects.find((id) => id === effectId));

    const onClickContinuousEffect = (e, modelIndex, effectId) => {
        e.preventDefault();
        if (isPlayMode) {
            toggleContinuousEffect(id, modelIndex, effectId);
        }
    };

    function ContinuousEffects(props) {
        const { modelIndex } = props;
        const { continuousEffects } = props.model;
        return <IonText color="primary">
            <IonLabel>Continuous Effects:</IonLabel>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "fire") ? flame : flameOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, "fire")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "corrosion") ? flask : flaskOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, "corrosion")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "lockdown") ? lockClosed : lockClosedOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, "lockdown")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "systemfailure") ? flashOff : flashOffOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, "systemfailure")} size="large"></IonIcon>
            <IonIcon color="secondary" icon={continuousEffectApplied(continuousEffects, "tuneup") ? build : buildOutline} onClick={(e) => onClickContinuousEffect(e, modelIndex, "tuneup")} size="large"></IonIcon>
        </IonText>;
    }

    return (
        <>
            {isPlayMode && <>
                <Activation activated={activated}></Activation>
                {arcLimit > 0 && <ArcTracker arc={arc} arcLimit={arcLimit}></ArcTracker>}
            </>}
            {<UnitModels unitModels={unitModels}></UnitModels>}
        </>
    );
}

export default UnitStatus;