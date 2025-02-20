import React from "react";
import { IonNote, IonItem, IonLabel, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from "@ionic/react";

import { cortexesData, weaponsData } from "./data";

import HardPoint from "./HardPoint";

function HardPointList(props) {
    const { hard_points, hardPointOptions, weaponPoints, onChangeHardPoint, isPlayMode } = props;
    const hardPointComponents = [];
    hard_points.forEach((hard_point, index) =>
        hardPointComponents.push(<IonRow key={index}>
            <IonCol>
                <HardPoint hard_point={hard_point} index={index} selectedOption={hardPointOptions[index]} onChangeHardPoint={onChangeHardPoint ? onChangeHardPoint.bind(this) : null}/>
            </IonCol>
        </IonRow>)
    );
    
    const weaponPointCost = hardPointOptions.reduce((totalPointCost, option) => totalPointCost + option.point_cost, 0);
    const hardPointOptionsText = hardPointOptions.map((hardPointOption) => hardPointOption.type === "cortex" ? cortexesData[hardPointOption.option].name : weaponsData[hardPointOption.option].name).join(", ");

    return <IonAccordionGroup>
        <IonAccordion readonly={isPlayMode}>
            <IonItem slot="header" color="dark" size="small">
                <IonLabel color="primary">{hardPointOptionsText}</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
                <IonNote color={weaponPointCost > weaponPoints ? "danger" : "primary"}><h3>{weaponPoints && `Weapon Points: ${weaponPointCost}/${weaponPoints}`}</h3></IonNote>
                <IonGrid>
                    {hardPointComponents}
                </IonGrid>
            </div>
        </IonAccordion>
    </IonAccordionGroup>;
}

export default HardPointList;