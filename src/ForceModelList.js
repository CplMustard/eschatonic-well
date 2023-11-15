import React from 'react';
import { IonText, IonAccordion, IonButton, IonLabel, IonList, IonItemDivider, IonListHeader, IonItem, IonItemGroup, IonAccordionGroup } from '@ionic/react';

import HardPointList from './HardPointList';

import { modelTypesData } from './data'

function ForceModelList(props) {
    const { forceEntries, header, handleCardClicked, cardActions, updateModelHardPoint } = props;

    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(forceGroups).sort().forEach(([key, value]) => {
        const entryComponents = [];
        value.sort((a, b) => a.name > b.name).forEach((entry, index) => {
            const weaponPointCost = entry.hard_points ? entry.hardPointOptions.reduce((totalPointCost, option) => totalPointCost + option.point_cost, 0) : undefined
            const cardActionButtons = [];
            cardActions && cardActions.forEach((action) => {
                action.handleClicked && action.text && !(action.isHidden && action.isHidden(entry.id)) && cardActionButtons.push(<IonButton key={action.text} size="medium" expand="full" onClick={() => action.handleClicked(entry.id)}>{action.text}</IonButton>)
            });
            entryComponents.push(
                <IonItem key={index}>
                    <IonButton size="medium" expand="full" onClick={() => handleCardClicked(entry.modelId, entry.id)}>{entry.name}</IonButton>
                    {cardActionButtons}
                    {entry.hard_points && <span>
                        {entry.weapon_points && <h4>Weapon Points: {weaponPointCost}/{entry.weapon_points}</h4>}
                        <HardPointList hard_points={entry.hard_points} hardPointOptions={entry.hardPointOptions} onChangeHardPoint={(option, type, point_cost, hardPointIndex) => updateModelHardPoint(option, type, point_cost, hardPointIndex, entry.id)}/>
                    </span>}
                </IonItem>
            );
        })
        const cardTypeName = modelTypesData[key].name;
        forceGroupComponents.push(<IonItemGroup key={key}>
            <IonItemDivider color="tertiary">
                <IonLabel><h4>{cardTypeName} ({entryComponents.length})</h4></IonLabel>
            </IonItemDivider>
            {entryComponents}
        </IonItemGroup>)
    })
    return <><IonListHeader color="primary"><IonLabel>{header}</IonLabel></IonListHeader><IonList>{forceGroupComponents}</IonList></>;
}

export default ForceModelList;