
import React from "react";
import Lottie from "react-lottie";
import journeySide1 from "./joureny-side-1.svg";
import * as portal from "./portal.json";

function JourneyPortals() {

    const portalOptions = {
        loop: true,
        autoplay: true,
        animationData: portal,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

    return (
        <div style={{position: 'relative', width: '400px', height: '400px'}}>
            <Lottie options={portalOptions} speed={0.25} isClickToPauseDisabled={true} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '410px',
                height: '420px',
                zIndex: 3,
                overflow: "visible"
            }}/>
            <img
                src={journeySide1}
                style={{
                    position: 'absolute',
                    top: 17,
                    left: 1,
                    height: '100%',
                    width: '100%',
                    zIndex: 1
                }}
                alt="py"
            />
        </div>
    );


}

export default JourneyPortals;
