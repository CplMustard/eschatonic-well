import React from 'react';
import { IonItem, IonList } from '@ionic/react';

import Maneuver from './Maneuver';

function ManeuverList(props) {
    const maneuverComponents = [];
    props.maneuvers.forEach((maneuverId, index) =>
        maneuverComponents.push(<IonItem key={index}><Maneuver maneuverId={maneuverId} /></IonItem>)
    )
    return <><h3>{props.header}</h3><IonList>{maneuverComponents}</IonList></>;
}

export default ManeuverList;