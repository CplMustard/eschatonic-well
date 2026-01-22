import React from "react";
import packageJson from "../package.json";
import { IonText } from "@ionic/react";

function VersionNumber() {
    return (
        <IonText className="version-number">{packageJson.version}</IonText>
    );
}

export default VersionNumber;