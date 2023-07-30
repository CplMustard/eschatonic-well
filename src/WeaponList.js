import React from 'react';

import Weapon from './Weapon';

function WeaponList(props) {
    const weaponComponents = [];
    props.weapons.forEach((weaponId, index) => 
    weaponId !== "empty" && weaponComponents.push(<li key={index}><Weapon weaponId={weaponId}/></li>)
    )
    return <ul>{weaponComponents}</ul>;
}

export default WeaponList;