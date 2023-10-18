import {Icon} from "@material-ui/core";
import banner from "./halloween-banner2.svg";
import journey219 from "./journey-page-21-9.svg";
import React from "react";

function HalloweenBannerIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;

    // if (props.aspectRatio === '21:9') {
    //     return (
    //         <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
    //             <img alt="" src={journey219} style={{position: 'absolute', width: '100%', height: '100%'}} />
    //         </div>
    //     );
    // }else{
    return (
        <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
            <img alt="" src={banner} style={{position: 'absolute', width: '100%', height: '100%'}} />
        </div>
    );
    // }

}

export default HalloweenBannerIcon;
