import React from "react";
import banana from './banana.svg';
import darkBanana from './dark-banana.svg';

export type AboutPageStyle = {
    style: React.CSSProperties;
    miniIcon?: boolean | undefined
};

function AboutBytesIcon(props: AboutPageStyle) {

    if (props.miniIcon) {
        return (
            <div>
                <img alt="" src={darkBanana} style={props.style}/>
            </div>
        );
    } else {
        return (
            <div>
                <img alt="" src={banana} style={props.style}/>
            </div>
        );
    }
}

export default AboutBytesIcon;