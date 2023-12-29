import React, { useState, useEffect } from 'react';
import { IonText, IonList, IonGrid, IonCol, IonRow, IonItem } from '@ionic/react';

import SpecialRuleList from './SpecialRuleList';

import { weaponsData, damageTypesData } from './data';

const weaponTypeNames = {"melee": "Melee", "range": "Ranged"}

function Weapon(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [weaponData, setWeaponData] = useState({});

    useEffect(() => {
        setIsLoaded(true);
        setWeaponData(weaponsData[props.weaponId]);
    }, [props.weaponId]);

    function WeaponStatline(props) {
        const { name, type, damage_types, rng, pow, special_rules } = props;
        
        const damageTypeNames = [];
        damage_types && damage_types.forEach((faction) => damageTypeNames.push(damageTypesData[faction].name))
        return <IonItem>
            <div>
                <IonText color="primary"><h2>{weaponTypeNames[type]}</h2></IonText>
                <IonText color="primary"><h1>{name}</h1></IonText>
                {damageTypeNames && <IonText color="tertiary"><h4>Damage Types: {damageTypeNames.join(", ")}</h4></IonText>}
                <IonGrid>
                    {(rng || pow) && <IonRow>
                        {rng && <IonCol size="auto"><IonText color="secondary"><h1>RNG</h1><h1 className="statline-value">{rng}</h1></IonText></IonCol>}
                        {pow && <IonCol size="auto"><IonText color="secondary"><h1>POW</h1><h1 className="statline-value">{pow}</h1></IonText></IonCol>}
                    </IonRow>}
                    {special_rules && <IonRow>
                        <SpecialRuleList special_rules={special_rules}/>
                    </IonRow>}
                </IonGrid>
            </div>
        </IonItem>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Weapon Data...</div>
    } else {
        const weaponStatlineComponents = [];
        if(weaponData.profiles) {
            weaponData.profiles.forEach((profile, index) => {
                if(profile) {
                    weaponStatlineComponents.push(
                        <WeaponStatline 
                            key={index} 
                            type={profile.type} 
                            name={profile.name ? profile.name : weaponData.name} 
                            damage_types={profile.damage_types} 
                            rng={profile.rng} 
                            pow={profile.pow} 
                            special_rules={profile.special_rules}
                        />
                    );
                }
            }, [weaponData.name])
        } 
        return <IonList>{weaponStatlineComponents}</IonList>;
    }
}

export default Weapon;