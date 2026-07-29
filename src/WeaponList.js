import React from "react";
import { useLocalStorageState } from "ahooks";
import { IonItem, IonLabel, IonList } from "@ionic/react";

import { loadUserSettings } from "./util/fileUtil";

import Weapon from "./Weapon";

let loadedUserSettings = await loadUserSettings();

function WeaponList(props) {
    const { rulesetId } = props;

    const [currentUserSettings, ] = useLocalStorageState("currentUserSettings", {defaultValue: loadedUserSettings, listenStorageChange: true});
    const combineIdenticalWeapons = currentUserSettings.combineIdenticalWeapons;

    const weaponComponents = [];
    const weaponCounts = {};
    props.weapons.forEach((weaponId) => weaponCounts[weaponId] ? weaponCounts[weaponId]++ : weaponCounts[weaponId] = 1);
    
    //convert to set to remove duplicates
    const weaponSet = new Set(props.weapons);
    const weapons = combineIdenticalWeapons ? Array.from(weaponSet) : props.weapons;
    weapons.forEach((weaponId, index) => 
        weaponId !== "empty" && weaponComponents.push(<IonItem key={index}><IonLabel><Weapon rulesetId={rulesetId} weaponId={weaponId} count={combineIdenticalWeapons ? weaponCounts[weaponId] : 1}/></IonLabel></IonItem>)
    );
    return <IonList>{weaponComponents}</IonList>;
}

export default WeaponList;