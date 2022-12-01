import React, { useState, useEffect } from 'react';

import SpecialRuleList from './SpecialRuleList';

function Weapon(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [weaponData, setWeaponData] = useState({});

    useEffect(() => {
        const weaponPath = `data/weapons/${props.weaponID}.json`;
        fetch(weaponPath)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setWeaponData(result);
                }, 
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [props.weaponID]);

    function WeaponStatline(props) {
        const { name, type, damage_types, rng, pow, special_rules } = props;
        return <div>
            <h2>{type}</h2>
            <h2>{name}</h2>
            {damage_types && <><div>DAMAGE TYPES</div><div>{damage_types}</div></>}
            {rng && <><div>RNG</div><div>{rng}</div></>}
            {pow && <><div>POW</div><div>{pow}</div></>}
            {special_rules && <SpecialRuleList special_rules={special_rules}/>}
        </div>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Weapon Data...</div>
    } else {
        const weaponStatlineComponents = [];
        if(weaponData.profiles) {
            weaponData.profiles.forEach((profile) => {
                weaponStatlineComponents.push(<WeaponStatline type={profile.type} name={profile.name ? profile.name : weaponData.name} damage_type={profile.damage_types} rng={profile.rng} pow={profile.pow} special_rules={profile.special_rules}/>)
            }, [weaponData.name])
        } 
        return (
            <div>
                {weaponStatlineComponents}
            </div>
        );
    }
}

export default Weapon;