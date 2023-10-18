import {Icon} from "@material-ui/core";
import nemesis from "../../img/Nemesis/background.svg";
import nemesis219 from "../../img/Nemesis/background219.svg";
import React from "react";

function NemesisPageIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}vh`;

    if (props.aspectRatio === '21:9') {
        return (
            <div style={{...props.style, width: props.width, paddingBottom: paddingBottom, position: 'relative'}}>
                <img alt="" src={nemesis219} style={{position: 'absolute', width: '100vw', height: '100vh', top: '-4vh'}} />
            </div>
        );
    } else {
        return (
            <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
                <img alt="" src={nemesis} style={{position: 'absolute', width: '100vw', height: '115vh'}} />
            </div>
        );
    }

}

export default NemesisPageIcon;