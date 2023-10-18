import {Icon} from "@material-ui/core";
import jungle from "./jungle-sun-4k.svg";
import jungle219 from "./jungle-sun-21-9.svg";
import React from "react";

function AboutPageIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;

    if (props.aspectRatio === '21:9') {
        return (
            <div style={{...props.style, width: props.width, paddingBottom}}>
                <img alt="" src={jungle219} style={{position: 'absolute', width: '100%', height: '100%'}} />
            </div>
        );
    }else{
        return (
            <div style={{...props.style, width: props.width, paddingBottom}}>
                <img alt="" src={jungle} style={{position: 'absolute', width: '100%', height: '100%'}} />
            </div>
        );
    }

}

export default AboutPageIcon;
