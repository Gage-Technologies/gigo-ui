import {Icon} from "@material-ui/core";
import vscode from "./journey-vscode-cirlce.svg";
import journey219 from "./forms-1-21-9.svg";
import React from "react";

function VscodeCircleIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;


    return (
        <div style={{...props.style, width: props.width, height: props.height, paddingBottom, position: 'relative'}}>
            <img alt="" src={vscode} style={{position: 'absolute', width: '100%', height: '100%'}} />
        </div>
    );


}

export default VscodeCircleIcon;
