import React from 'react';

import HardPoint from './HardPoint';

function HardPointList(props) {

    function updateHardPoint(option, hardPointIndex) {
        const newHardPointOptions = [...props.hardPointOptions.slice(0, hardPointIndex), option, ...props.hardPointOptions.slice(hardPointIndex+1)];
        props.onChangeHardPointOptions(newHardPointOptions);
    }

    const hardPointComponents = [];
    props.hard_points.forEach((hard_point, index) =>
        hardPointComponents.push(<li key={index}><HardPoint hard_point={hard_point} index={index} onChangeHardPoint={updateHardPoint.bind(this)}/></li>)
    )
    return <><h3>{props.header}</h3><ul>{hardPointComponents}</ul></>;
}

export default HardPointList;