import React, { useState, useEffect } from 'react';

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
        const subruleEntries = subrules ? subrules.map((subrule) => {console.log(subrule); return <li key={subrule}><SpecialRule ruleId={subrule}/></li>}) : undefined
        return (
            <div>
                <div className="special-rule">
                    <div className="special-rule-title">{ruleTitleString}</div><div>{ruleString}</div>
                </div>
                {subrules && <div><ul>{subruleEntries}</ul></div>}
            </div>
        );
    }
}

export default SpecialRule;