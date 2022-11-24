import React from 'react';

import SpecialRule from './SpecialRule';

function SpecialRuleList(props) {
    const specialRuleComponents = [];
    props.special_rules.forEach((ruleID, index) =>
        specialRuleComponents.push(<li key={index}><SpecialRule ruleID={ruleID} /></li>)
    )
    return <><h3>{props.header}</h3><ul>{specialRuleComponents}</ul></>;
}

export default SpecialRuleList;