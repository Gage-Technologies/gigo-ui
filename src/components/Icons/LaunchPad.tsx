import {Icon} from "@material-ui/core";
import pad from "./launch-pad.svg";

import React from "react";

function LaunchPadIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;


    return (
        <div style={{...props.style, width: props.width, height: props.height, paddingBottom, position: 'relative'}}>
            <img alt="" src={pad} style={{position: 'absolute', width: '150%', height: '150%'}} />
        </div>
    );


}

export default LaunchPadIcon;
