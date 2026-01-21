import React from "react";
import { IonText } from "@ionic/react";

import SpecialRuleList from "./SpecialRuleList";

import { getCortexesData } from "./DataLoader";

function Cortex(props) {
    const { rulesetId } = props;

    const cortexesData = getCortexesData(rulesetId);

    const cortexData = cortexesData[props.cortexId];

    const { special_rules, name } = cortexData;
    return (
        <div>
            <IonText color="primary"><h2>Cortex:</h2></IonText>
            <IonText color="primary"><h2>{name}</h2></IonText>
            {special_rules && <SpecialRuleList rulesetId={rulesetId} special_rules={special_rules}/>}
        </div>
    );
}

export default Cortex;