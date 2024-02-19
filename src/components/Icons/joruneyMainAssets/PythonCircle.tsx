import {Icon} from "@material-ui/core";
import python from "./journey-python-cirlce.svg";
import journey219 from "./forms-1-21-9.svg";
import React from "react";

function PythonCircleIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;


    return (
        <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
            <img alt="" src={python} style={{position: 'absolute', width: '100%', height: '100%'}} />
        </div>
    );


}

export default PythonCircleIcon;
