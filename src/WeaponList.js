import React from "react";
import { IonItem, IonLabel, IonList } from "@ionic/react";

import Weapon from "./Weapon";

function WeaponList(props) {
    const { rulesetId } = props;

    const weaponComponents = [];
    const weaponCounts = {};
    props.weapons.forEach((weaponId) => weaponCounts[weaponId] ? weaponCounts[weaponId]++ : weaponCounts[weaponId] = 1);
    
    //convert to set to remove duplicates
    const weaponSet = new Set(props.weapons);
    Array.from(weaponSet).forEach((weaponId, index) => 
        weaponId !== "empty" && weaponComponents.push(<IonItem key={index}><IonLabel><Weapon rulesetId={rulesetId} weaponId={weaponId} count={weaponCounts[weaponId]}/></IonLabel></IonItem>)
    );
    return <IonList>{weaponComponents}</IonList>;
}

export default WeaponList;