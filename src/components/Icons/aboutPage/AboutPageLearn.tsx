import learn from "./learn.svg";
import React from "react";

function AboutPageLearnIcon(props: any) {
    const aspectRatio = props.aspectRatio || '16:9';

    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
    const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;

    if (props.aspectRatio === '21:9') {
        return (
            <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
                <img alt="" src={learn} style={{position: 'absolute', width: '100%', height: '100%', bottom: '10%'}} />
            </div>
        );
    }else if (props.aspectRatio === 'mobile') {
        return (
            <div style={{...props.style, width: props.width, paddingBottom: '60%', position: 'relative'}}>
                <img alt="" src={learn} style={{position: 'absolute', width: '100%', height: '100%', bottom: '10%'}} />
            </div>
        );
    } else{
        return (
            <div style={{...props.style, width: props.width, paddingBottom, position: 'relative'}}>
                <img alt="" src={learn} style={{position: 'absolute', width: '100%', height: '100%', bottom: '10%'}} />
            </div>
        );
    }
}
export default AboutPageLearnIcon;