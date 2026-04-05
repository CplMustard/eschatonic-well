import React from "react";
import { IonNote, IonItem, IonLabel, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from "@ionic/react";

import { getCortexesData, getWeaponsData } from "./DataLoader";

import HardPoint from "./HardPoint";

function HardPointList(props) {
    const { rulesetId, hard_points, hardPointOptions, weaponPoints, onChangeHardPoint, isDropdownOpen, readonly } = props;

    const cortexesData = getCortexesData(rulesetId);
    const weaponsData = getWeaponsData(rulesetId);

    const hardPointComponents = [];
    hard_points.forEach((hard_point, index) =>
        hardPointComponents.push(<IonRow key={index}>
            <IonCol>
                <HardPoint rulesetId={rulesetId} hard_point={hard_point} index={index} selectedOption={hardPointOptions[index]} onChangeHardPoint={onChangeHardPoint ? onChangeHardPoint.bind(this) : null}/>
            </IonCol>
        </IonRow>)
    );
    
    const weaponPointCost = hardPointOptions.reduce((totalPointCost, option) => totalPointCost + option.point_cost, 0);
    const hardPointOptionsText = hardPointOptions.map((hardPointOption) => hardPointOption.type === "cortex" ? cortexesData[hardPointOption.option].name : weaponsData[hardPointOption.option].name).join(", ");

    const accordionGroupProps = {};
    
    // use default behaviour if isDropdownOpen is not defined
    if(isDropdownOpen !== undefined) {
        accordionGroupProps.value = isDropdownOpen ? "hardpoints" : undefined;
    }

    return <IonAccordionGroup {...accordionGroupProps}>
        <IonAccordion value={"hardpoints"} readonly={readonly}>
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