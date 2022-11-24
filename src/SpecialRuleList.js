import React from 'react';

import SpecialRule from './SpecialRule';

function SpecialRuleList(props) {
    const specialRuleComponents = [];
    props.special_rules.forEach((ruleID, index) => 
        specialRuleComponents.push(<li key={index}><SpecialRule ruleID={ruleID}/></li>)
    )
    return <ul>{specialRuleComponents}</ul>;
}

export default SpecialRuleList;