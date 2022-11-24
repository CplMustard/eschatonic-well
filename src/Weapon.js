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
        const { name, type, damage_types, rng, pow } = props.weaponData;
        return <div>
            <h2>{type}</h2>
            <h2>{name}</h2>
            {damage_types && <><div>DAMAGE TYPES</div><div>{damage_types}</div></>}
            {rng && <><div>RNG</div><div>{rng}</div></>}
            {pow && <><div>POW</div><div>{pow}</div></>}
        </div>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Weapon Data...</div>
    } else {
        return (
            <div>
                <WeaponStatline weaponData={weaponData}/>
                {weaponData.special_rules && <SpecialRuleList special_rules={weaponData.special_rules}/>}
            </div>
        );
    }
}

export default Weapon;