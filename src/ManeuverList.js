import React from 'react';
import { IonText, IonItem, IonList } from '@ionic/react';

import Maneuver from './Maneuver';

function ManeuverList(props) {
    const maneuverComponents = [];
    props.maneuvers.forEach((maneuverId, index) =>
        maneuverComponents.push(<IonItem key={index}><Maneuver maneuverId={maneuverId} /></IonItem>)
    )
    return <><IonText color="primary"><h2>{props.header}</h2></IonText><IonList>{maneuverComponents}</IonList></>;
}

export default ManeuverList;