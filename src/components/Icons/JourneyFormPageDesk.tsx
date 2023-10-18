import {Icon} from "@material-ui/core";
import journey from "./journey-desk.svg";
import journey219 from "./journey-desk-21-9.svg";
import React from "react";

function JourneyFormPageDeskIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;

    if (props.aspectRatio === '21:9') {
        return (
            <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
                <img alt="" src={journey219} style={{position: 'absolute', width: '100%', height: 'calc(77% - 64px)'}} />
            </div>
        );
    }else{
        return (
            <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
                <img alt="" src={journey} style={{position: 'absolute', width: '100%', height: 'calc(87% - 64px)'}} />
            </div>
        );
    }

}

export default JourneyFormPageDeskIcon;
