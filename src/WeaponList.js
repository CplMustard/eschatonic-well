import React from 'react';
import { IonItem, IonLabel, IonList } from '@ionic/react';

import Weapon from './Weapon';

function WeaponList(props) {
    const weaponComponents = [];
    props.weapons.forEach((weaponId, index) => 
        weaponId !== "empty" && weaponComponents.push(<IonItem key={index}><IonLabel><Weapon weaponId={weaponId}/></IonLabel></IonItem>)
    )
    return <IonList>{weaponComponents}</IonList>;
}

export default WeaponList;