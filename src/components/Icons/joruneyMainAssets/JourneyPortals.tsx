import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import config from "../../../config";
import journeySide1 from "./journey-side-1.svg";
import journeySide2 from "./journey-side-2.svg";
import journeySide3 from "./journey-side-3.svg";
import journeySide4 from "./journey-side-4.svg";
import journeySide5 from "./journey-side-5.svg";

// @ts-ignore
function JourneyPortals({ currentIndex }) {  // Assume currentIndex is passed as a prop based on the map data

    const [animationData, setAnimationData] = useState("");

    useEffect(() => {
        // TODO add light theme portal
        fetch(`${config.rootPath}/static/ui/lottie/general/journey-portal-dark.json`, { credentials: 'include' })
            .then(data => {
                data.json().then(json => {
                    setAnimationData(json);
                });
            })
            .catch(error => console.error(error));
    }, []);

    const images = [journeySide1, journeySide2, journeySide3, journeySide4, journeySide5];
    const currentImage = images[currentIndex % images.length];

    const portalOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        },
    };

    return (
        <div style={{ position: 'relative', width: '400px', height: '400px' }}>
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
                src={currentImage}
                style={{
                    position: 'absolute',
                    top: 17,
                    left: 1,
                    height: '100%',
                    width: '100%',
                    zIndex: 1
                }}
                alt="Journey Portal"
            />
        </div>
    );
}

export default JourneyPortals;
