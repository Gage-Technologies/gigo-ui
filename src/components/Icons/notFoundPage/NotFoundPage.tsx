import notFoundDark from "../notFoundPage/404-dark.svg";
import notFoundDark219 from "../notFoundPage/404-dark-219.svg"
import notFoundLight from "../notFoundPage/404-light.svg";
import notFoundLight219 from "../notFoundPage/404-light-219.svg"

import React from "react";

function NotFoundPageIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;


    if (props.theme === 'dark') {
        if (props.aspectRatio === '21:9') {
            return (
                <div style={{paddingBottom}}>
                    <img alt="" src={notFoundDark219} style={{position: "fixed", width: '100%', height: '100%'}} />
                </div>
            );
        }else{
            return (
                <div>
                    <img alt="" src={notFoundDark} style={{position: "fixed", width: '100%', height: '100%'}} />
                </div>
            );
        }
    }else {
        if (props.aspectRatio === '21:9') {
            return (
                <div style={{paddingBottom}}>
                    <img alt="" src={notFoundLight219} style={{position: "fixed", width: '100%', height: '100%'}} />
                </div>
            );
        }else{
            return (
                <div>
                    <img alt="" src={notFoundLight} style={{position: "fixed", width: '100%', height: '100%'}} />
                </div>
            );
        }
    }

}

export default NotFoundPageIcon;