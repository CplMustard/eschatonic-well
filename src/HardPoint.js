import React from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';

import { cortexesData, weaponsData } from './data';

function HardPoint(props) {
    const { hard_point, index, selectedOption, onChangeHardPoint } = props
    function handleChange (e) {
        onChangeHardPoint(e.target.value, hard_point.type, hard_point.type === "weapon" ? weaponsData[e.target.value].point_cost : 0, index); 
    }

    const optionComponents = []
    hard_point.options.forEach((option, index) => {
        const optionName = hard_point.type === "weapon" ? `${weaponsData[option].name} (${weaponsData[option].point_cost})` : cortexesData[option].name
        optionComponents.push(<IonSelectOption key={index} value={option}>{optionName}</IonSelectOption>);
    });
    return (
        <div>
            <span>{hard_point.name}</span>
            <IonSelect onIonChange={handleChange.bind(this)} value={selectedOption.option}>
                {optionComponents}
            </IonSelect>
        </div>
    );
}

export default HardPoint;