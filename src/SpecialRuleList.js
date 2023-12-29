import React from 'react';
import { IonText, IonItem, IonList, IonListHeader } from '@ionic/react';

import SpecialRule from './SpecialRule';

function SpecialRuleList(props) {
    const specialRuleComponents = [];
    specialRuleComponents.push(<IonText key={-1} color="primary"><h2>{props.header}</h2></IonText>)
    props.special_rules.forEach((ruleId, index) =>
        specialRuleComponents.push(<IonItem key={index}><SpecialRule ruleId={ruleId} /></IonItem>)
    )
    return <IonList style={{"whiteSpace": "normal"}}>{specialRuleComponents}</IonList>;
}

export default SpecialRuleList;