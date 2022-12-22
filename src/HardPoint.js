import React from 'react';

import cortexes from './data/cortexes';
import weapons from './data/weapons';

function HardPoint(props) {
    function handleChange (e) {
        props.onChangeHardPoint(e.target.value, props.hard_point.type, props.index); 
    }

    const optionComponents = []
    props.hard_point.options.forEach((option, index) => {
        const optionName = props.hard_point.type === "cortex" ? cortexes[option].name : weapons[option].name
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