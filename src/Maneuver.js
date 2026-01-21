import React from "react";
import { IonText } from "@ionic/react";

import { getManeuversData } from "./DataLoader";

function Maneuver(props) {
    const { rulesetId } = props;

    const manueversData = getManeuversData(rulesetId);

    const maneuverData = manueversData[props.maneuverId];

    return (
        <div>
            <IonText style={{fontWeight: "bold"}}>{maneuverData.name}:</IonText><IonText><div className="rules-text">{maneuverData.text}</div></IonText>
        </div>
    );
}

export default Maneuver;