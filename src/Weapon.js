import React from "react";
import { IonText, IonList, IonGrid, IonCol, IonRow, IonItem } from "@ionic/react";

import SpecialRuleList from "./SpecialRuleList";

import { getWeaponsData, getDamageTypesData } from "./DataLoader";

const weaponTypeNames = {"melee": "Melee", "range": "Ranged"};

function Weapon(props) {
    const { rulesetId, weaponId, count } = props;

    const weaponsData = getWeaponsData(rulesetId);
    const damageTypesData = getDamageTypesData(rulesetId);
    
    const weaponData = weaponsData[weaponId];

    function WeaponStatline(props) {
        const { name, type, damage_types, rng, pow, special_rules } = props;
        
        const damageTypeNames = [];
        damage_types && damage_types.forEach((damageType) => damageTypeNames.push(damageTypesData[damageType].name));
        return <IonItem>
            <div>
                <IonText color="primary"><h2>{weaponTypeNames[type]}</h2></IonText>
                <IonText color="primary"><h1>{name}</h1></IonText>
                {damage_types && damageTypeNames && <IonText color="secondary"><h4>Damage Types: {damageTypeNames.join(", ")}</h4></IonText>}
                <IonGrid className="statline" style={{"--background": "red"}}>
                    {(rng || pow) && <IonRow>
                        {rng && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>RNG</h2></IonText><IonText color="secondary"><h1>{rng}</h1></IonText></IonCol>}
                        {pow && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>POW</h2></IonText><IonText color="secondary"><h1>{pow}</h1></IonText></IonCol>}
                    </IonRow>}
                    {special_rules && <IonRow>
                        <SpecialRuleList rulesetId={rulesetId} special_rules={special_rules}/>
                    </IonRow>}
                </IonGrid>
            </div>
        </IonItem>;
    }

    const weaponStatlineComponents = [];
    if(weaponData.profiles) {
        weaponData.profiles.forEach((profile, index) => {
            if(profile) {
                weaponStatlineComponents.push(
                    <WeaponStatline 
                        key={index} 
                        type={profile.type} 
                        name={`${count > 1 ? `${count}x ` : ""}${profile.name ? profile.name : weaponData.name}`} 
                        damage_types={profile.damage_types} 
                        rng={profile.rng} 
                        pow={profile.pow} 
                        special_rules={profile.special_rules}
                    />
                );
            }
        }, [weaponData.name]);
    } 
    return <IonList>{weaponStatlineComponents}</IonList>;
}

export default Weapon;