import React, { useState, useEffect } from 'react';
import { IonText, IonItem, IonLabel, IonList } from '@ionic/react';

import { specialRulesData } from './data';

function SpecialRule(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [ruleData, setRuleData] = useState({});

    const ruleParts = props.ruleId.split('|');
    const ruleId = ruleParts.shift(); //don't include template strings in ID
    const ruleArguments = ruleParts

    useEffect(() => {
        setIsLoaded(true);
        setRuleData(specialRulesData[ruleId]);
    }, [ruleId]);

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Special Rule Data...</div>
    } else {
        let ruleTitleString = `${ruleData.name}: `;
        let ruleString = `${ruleData.text}`;
        ruleArguments.forEach((argument, index) => {
            ruleTitleString = ruleTitleString.replaceAll(`{${index}}`, argument);
            ruleString = ruleString.replaceAll(`{${index}}`, argument);
        });
        const subrules = ruleData.subrules
        const subruleEntries = subrules ? subrules.map((subrule) => <IonItem key={subrule}><SpecialRule ruleId={subrule}/></IonItem>) : undefined
        return (
            <div>
                <div>
                    <IonText style={{fontWeight: "bold"}}>{ruleTitleString}</IonText><IonText><div>{ruleString}</div></IonText>
                </div>
                {subrules && <div><IonList>{subruleEntries}</IonList></div>}
            </div>
        );
    }
}

export default SpecialRule;