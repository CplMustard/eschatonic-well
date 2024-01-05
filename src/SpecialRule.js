import React from "react";
import { IonText, IonItem, IonList } from "@ionic/react";

import { specialRulesData } from "./data";

function SpecialRule(props) {
    const ruleParts = props.ruleId.split("|");
    const ruleId = ruleParts.shift(); //don't include template strings in ID
    const ruleArguments = ruleParts;

    const ruleData = specialRulesData[ruleId];

    let ruleTitleString = `${ruleData.name}: `;
    let ruleString = `${ruleData.text}`;
    ruleArguments.forEach((argument, index) => {
        ruleTitleString = ruleTitleString.replaceAll(`{${index}}`, argument);
        ruleString = ruleString.replaceAll(`{${index}}`, argument);
    });
    const subrules = ruleData.subrules;
    const subruleEntries = subrules ? subrules.map((subrule) => <IonItem key={subrule}><SpecialRule ruleId={subrule}/></IonItem>) : undefined;
    return (
        <div>
            <div>
                <IonText style={{fontWeight: "bold"}}>{ruleTitleString}</IonText><IonText><div className="rules-text">{ruleString}</div></IonText>
            </div>
            {subrules && <div><IonList>{subruleEntries}</IonList></div>}
        </div>
    );
}

export default SpecialRule;