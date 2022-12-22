import React from 'react';

import cortexesData from './data/cortexes';
import weaponsData from './data/weapons';

function HardPoint(props) {
    function handleChange (e) {
        props.onChangeHardPoint(e.target.value, props.hard_point.type, props.hard_point.type === "weapon" ? weaponsData[e.target.value].point_cost : 0, props.index); 
    }

    const optionComponents = []
    props.hard_point.options.forEach((option, index) => {
        const optionName = props.hard_point.type === "weapon" ? weaponsData[option].name : cortexesData[option].name
        optionComponents.push(<option key={index} value={option}>{optionName}</option>);
    });
    return (
        <div>
            <span>{props.hard_point.name}</span>
            <select onChange={handleChange.bind(this)}>
                {optionComponents}
            </select>
        </div>
    );
}

export default HardPoint;