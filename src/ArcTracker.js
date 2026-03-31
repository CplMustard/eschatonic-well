import React from "react";
import { IonText, IonIcon, IonLabel } from "@ionic/react";
import { add, remove } from "ionicons/icons";

function ArcTracker(props) {
    const { id, arc, arcLimit, arcInWell, disabled, color, size, setArc, isPlayMode, collapsible } = props;

    //TODO: fix issue where void gates don't update their arc properly when deployed
    return <IonText color={color ? color : "primary"} style={{display: "flex", alignContent: "center", justifyContent: "flex-start"}}>
        <IonLabel style={{position: "relative", top: "0.5rem"}}>Arc:</IonLabel>
        {/*TODO: Card viewer specific formatting change, should be handled with styles instead*/}
        {!collapsible && <br/>}
        <h1 style={{margin: 0}}>
            {!disabled && <IonIcon 
                color={arc-1 >= 0 ? "secondary" : "tertiary"}
                icon={remove} 
                style={{position: "relative", top: "0.25rem"}}
                onClick={(e) => {
                    e.preventDefault();
                    if (isPlayMode) {
                        if(!disabled && arc-1 >= 0) {
                            setArc(id, arc-1);
                        }
                    }
                }} 
                size={size ? size : "large"}
            ></IonIcon>}
            <IonText style={{position: "relative", top: "0.125rem", margin: "0.25rem"}}>{arc}</IonText> 
            {!disabled && <IonIcon 
                color={!disabled && (arc+1 <= arcLimit && arcInWell > 0) ? "secondary" : "tertiary"}
                icon={add} 
                style={{position: "relative", top: "0.25rem"}}
                onClick={(e) => {
                    e.preventDefault();
                    if (isPlayMode) {
                        if(!disabled && (arc+1 <= arcLimit && arcInWell > 0)) {
                            setArc(id, arc+1);
                        }
                    }
                }} 
                size={size ? size : "large"}
            ></IonIcon>}
        </h1>
    </IonText>;
}

export default ArcTracker;