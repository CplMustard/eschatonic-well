import React from 'react';
import { IonItem, IonLabel, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from '@ionic/react';

import { cortexesData, weaponsData } from './data';

import HardPoint from './HardPoint';

function HardPointList(props) {
    const { hard_points, hardPointOptions, weaponPoints } = props;
    const hardPointComponents = [];
    hard_points.forEach((hard_point, index) =>
        hardPointComponents.push(<IonRow key={index}>
            <IonCol>
                <HardPoint hard_point={hard_point} index={index} selectedOption={hardPointOptions[index]} onChangeHardPoint={props.onChangeHardPoint.bind(this)}/>
            </IonCol>
        </IonRow>)
    )
    
    const weaponPointCost = hardPointOptions.reduce((totalPointCost, option) => totalPointCost + option.point_cost, 0)
    const hardPointOptionsText = hardPointOptions.map((hardPointOption) => hardPointOption.type === "cortex" ? cortexesData[hardPointOption.option].name : weaponsData[hardPointOption.option].name).join(", ")

    return <IonAccordionGroup>
        <IonAccordion value="first">
            <IonItem slot="header" color="dark" size="small">
                <IonLabel color="primary">{`${weaponPoints && `Weapon Points: ${weaponPointCost}/${weaponPoints}, `} ${hardPointOptionsText}`}</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
                <IonGrid>
                    {hardPointComponents}
                </IonGrid>
            </div>
        </IonAccordion>
    </IonAccordionGroup>;
}

export default HardPointList;