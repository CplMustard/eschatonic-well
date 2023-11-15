import React from 'react';
import { IonText, IonGrid, IonCol, IonRow } from '@ionic/react';

import HardPoint from './HardPoint';

function HardPointList(props) {
    const { hard_points, hardPointOptions } = props;
    const hardPointComponents = [];
    hard_points.forEach((hard_point, index) =>
        hardPointComponents.push(<IonCol key={index}><HardPoint hard_point={hard_point} index={index} selectedOption={hardPointOptions[index]} onChangeHardPoint={props.onChangeHardPoint.bind(this)}/></IonCol>)
    )
    return <><IonText><h3>{props.header}</h3></IonText><IonGrid><IonRow>{hardPointComponents}</IonRow></IonGrid></>;
}

export default HardPointList;