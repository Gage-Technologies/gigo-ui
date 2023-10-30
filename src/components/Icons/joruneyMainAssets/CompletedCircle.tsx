
import completed from "./journey-completed-cirlce.svg";
import React from "react";

function CompletedCircleIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;


        return (
            <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
                <img alt="" src={completed} style={{position: 'absolute', width: '100%', height: '100%'}} />
            </div>
        );


}

export default CompletedCircleIcon;
