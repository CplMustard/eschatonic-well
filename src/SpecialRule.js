import React, { useState, useEffect } from 'react';

import { specialRulesData } from './data';

function SpecialRule(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [ruleData, setRuleData] = useState({});

    const ruleParts = props.ruleID.split('|');
    const ruleID = ruleParts.shift(); //don't include template strings in ID
    const ruleArguments = ruleParts

    useEffect(() => {
        setIsLoaded(true);
        setRuleData(specialRulesData[ruleID]);
    }, [ruleID]);

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
        return (
            <div className="special-rule">
                <div className="special-rule-title">{ruleTitleString}</div><div>{ruleString}</div>
            </div>
        );
    }
}

export default SpecialRule;