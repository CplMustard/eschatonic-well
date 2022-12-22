import React, { useState, useEffect } from 'react';

import SpecialRuleList from './SpecialRuleList';

import weaponsData from './data/weapons';

function Weapon(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [weaponData, setWeaponData] = useState({});

    useEffect(() => {
        setIsLoaded(true);
        setWeaponData(weaponsData[props.weaponID]);
    }, [props.weaponID]);

    function WeaponStatline(props) {
        const { name, type, damage_types, rng, pow, special_rules } = props;
        return <div>
            <h2>{type}</h2>
            <h2>{name}</h2>
            {rng && pow && <div className="statline">
                {damage_types && <div className="statline-entry"><div>DAMAGE TYPES</div><div>{damage_types}</div></div>}
                {rng && <div className="statline-entry"><div>RNG</div><div>{rng}</div></div>}
                {pow && <div className="statline-entry"><div>POW</div><div>{pow}</div></div>}
            </div>}
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
            weaponData.profiles.forEach((profile, index) => {
                weaponStatlineComponents.push(<WeaponStatline key={index} type={profile.type} name={profile.name ? profile.name : weaponData.name} damage_types={profile.damage_types} rng={profile.rng} pow={profile.pow} special_rules={profile.special_rules}/>);
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