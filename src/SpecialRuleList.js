import React from 'react';

import SpecialRule from './SpecialRule';

function SpecialRuleList(props) {
    const specialRuleComponents = [];
    props.special_rules.forEach((ruleId, index) =>
        specialRuleComponents.push(<li key={index}><SpecialRule ruleId={ruleId} /></li>)
    )
    return <><h3>{props.header}</h3><ul>{specialRuleComponents}</ul></>;
}

export default SpecialRuleList;