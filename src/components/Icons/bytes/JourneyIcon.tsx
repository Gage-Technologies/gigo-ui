import React from "react";
import banana from './compass.svg';

export type AboutPageStyle = {
    style: React.CSSProperties;
};

function JourneyIcon(props: AboutPageStyle) {
    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <img alt="" src={banana} style={props.style}/>
        </div>
    );
}

export default JourneyIcon;