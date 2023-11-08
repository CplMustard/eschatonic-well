import React, { useState, useEffect } from 'react';
import { IonText, IonItem, IonList, IonLabel, IonGrid, IonCol, IonRow } from '@ionic/react';

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
            <IonLabel>
                <h1>{weaponTypeNames[type]}</h1>
                <h1>{name}</h1>
                {rng && pow && <IonGrid fixed="true">
                    <IonRow class="ion-justify-content-start">
                        {damageTypeNames && <IonCol><IonText><div>DAMAGE TYPES</div><div>{damageTypeNames.join(", ")}</div></IonText></IonCol>}
                        {rng && <IonCol><IonText><div>RNG</div><div>{rng}</div></IonText></IonCol>}
                        {pow && <IonCol><IonText><div>POW</div><div>{pow}</div></IonText></IonCol>}
                    </IonRow>
                    {special_rules && <IonRow>
                        <SpecialRuleList special_rules={special_rules}/>
                    </IonRow>}
                </IonGrid>}
            </IonLabel>
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
        return (
            <div>
                <IonList>{weaponStatlineComponents}</IonList>
            </div>
        );
    }
}

export default Weapon;