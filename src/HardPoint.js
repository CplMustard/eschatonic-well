import React from 'react';

function HardPoint(props) {
    function handleChange (e) {
        props.onChangeHardPoint(e.target.value, props.hard_point.type, props.index); 
    }

    const optionComponents = []
    props.hard_point.options.forEach((option, index) => {
        // TODO: Find a way to get the real weapon name
        optionComponents.push(<option key={index} value={option}>{option}</option>);
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