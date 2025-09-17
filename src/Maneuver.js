import React from "react";
import { IonText } from "@ionic/react";

import { getManeuversData } from "./data";

function Maneuver(props) {
    const maneuverData = getManeuversData()[props.maneuverId];

    return (
        <div>
            <IonText style={{fontWeight: "bold"}}>{maneuverData.name}:</IonText><IonText><div className="rules-text">{maneuverData.text}</div></IonText>
        </div>
    );
}

export default Maneuver;