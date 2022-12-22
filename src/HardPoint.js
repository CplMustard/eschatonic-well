import React from 'react';

import cortexesList from './data/cortexes';
import weaponsList from './data/weapons';

function HardPoint(props) {
    function handleChange (e) {
        props.onChangeHardPoint(e.target.value, props.hard_point.type, props.hard_point.type === "weapon" ? weaponsList[e.target.value].point_cost : 0, props.index); 
    }

    const optionComponents = []
    props.hard_point.options.forEach((option, index) => {
        const optionName = props.hard_point.type === "cortex" ? cortexesList[option].name : weaponsList[option].name
        optionComponents.push(<option key={index} value={option}>{optionName}</option>);
    });
    return (
        <div>
            <h3>{props.hard_point.name}</h3>
            <select onChange={handleChange.bind(this)}>
                {optionComponents}
            </select>
        </div>
    );
}

export default HardPoint;