import React from 'react';

import Weapon from './Weapon';

function WeaponList(props) {
    const weaponComponents = [];
    props.weapons.forEach((weaponID, index) => 
        weaponComponents.push(<li key={index}><Weapon weaponID={weaponID}/></li>)
    )
    return <ul>{weaponComponents}</ul>;
}

export default WeaponList;