import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { build } from "ionicons/icons";

function SettingsButton(props) {
    const { setIsOpen } = props;
    return (
        <IonButton className="settings-button" slot={"end"} onClick={() => setIsOpen(true)}><IonIcon icon={build}></IonIcon></IonButton>
    );
}

export default SettingsButton;