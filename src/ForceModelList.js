import React from 'react';
import { IonAccordion, IonButton, IonList, IonItem, IonAccordionGroup } from '@ionic/react';

import HardPointList from './HardPointList';

import { modelTypesData } from './data'

function ForceModelList(props) {
    const { forceEntries, header, handleCardClicked, cardActionClicked, cardActionText, updateModelHardPoint } = props;

    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(forceGroups).sort().forEach(([key, value]) => {
        const entryComponents = [];
        value.sort((a, b) => a.name > b.name).forEach((entry, index) => {
            const weaponPointCost = entry.hard_points ? entry.hardPointOptions.reduce((totalPointCost, option) => totalPointCost + option.point_cost, 0) : undefined
            entryComponents.push(
                <IonItem key={index}>
                    <IonButton onClick={() => handleCardClicked(entry.modelId, entry.id)}>{entry.name}</IonButton>
                    {cardActionClicked && entry.showAction && <IonButton onClick={() => cardActionClicked(entry.id)}>{cardActionText}</IonButton>}
                    {entry.hard_points && <span>
                        {entry.weapon_points && <h6>Weapon Points: {weaponPointCost}/{entry.weapon_points}</h6>}
                        <HardPointList hard_points={entry.hard_points} hardPointOptions={entry.hardPointOptions} onChangeHardPoint={(option, type, point_cost, hardPointIndex) => updateModelHardPoint(option, type, point_cost, hardPointIndex, entry.id)}/>
                    </span>}
                </IonItem>
            );
        })
        const cardTypeName = modelTypesData[key].name;
        forceGroupComponents.push(<div key={key}><h4>{cardTypeName} ({entryComponents.length})</h4><IonItem><IonList>{entryComponents}</IonList></IonItem></div>)
    })
    return <><h3>{header}</h3><IonList>{forceGroupComponents}</IonList></>;
}

export default ForceModelList;