import React from "react";
import banana from './banana.svg';

export type AboutPageStyle = {
    style: React.CSSProperties;
};

function AboutBytesIcon(props: AboutPageStyle) {
    return (
        <div>
            <img alt="" src={banana} style={props.style}/>
        </div>
    );
}

export default AboutBytesIcon;