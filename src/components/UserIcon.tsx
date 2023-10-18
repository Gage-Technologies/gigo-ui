

import React from "react"
import {ButtonBase} from "@mui/material";
import Badge from '@mui/material/Badge';
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import config from "../config";
import LottieAnimation from "./LottieAnimation";
import ProBannerCircle from "./Icons/ProBannerCircle";
import { Buffer } from 'buffer';

interface IProps {
    size: number | string,
    userTier: string | number,
    userThumb: string,
    userId: string,
    imageTop: number | null;
    backgroundName: string | null,
    backgroundPalette: string | null,
    backgroundRender: boolean | null,
    profileButton: boolean | null,
    pro: boolean | null,
}

export default function UserIcon(props: IProps) {
    let styles = {
        lottie: {
            zIndex: 4,
            position: "absolute",
            top: 0,
            left: 0
        },
    };

    const [svgData, setSvgData] = React.useState<string>("");

    useEffect(() => {
        fetch(props.userThumb)
            .then(response => response.text())
            // @ts-ignore
            .then(data => {
                let formattedWidth = typeof props.size === "string" ? props.size : props.size + "px";
                let formattedHeight = typeof props.size === "string" ? props.size : props.size + "px";

                // replace the internal height and width of the svg element
                let modifiedSvgString = data.replace(/(<svg[^>]*)( width="[^"]+")/, `$1 width="${formattedWidth}"`)
                    .replace(/(<svg[^>]*)( height="[^"]+")/, `$1 height="${formattedHeight}"`);

                // remove the entire style attribute from the svg element
                modifiedSvgString = modifiedSvgString.replace(/(<svg[^>]*)( style="[^"]+")/, `$1`);

                // format into a base64 encoded string
                modifiedSvgString = "data:image/svg+xml;base64," + Buffer.from(modifiedSvgString).toString("base64");

                setSvgData(modifiedSvgString)
            });
    }, [props.userThumb]);

    const [lottieBackground, setLottieBackground] = React.useState(null)

    useEffect(() => {
        if (props.backgroundName && props.backgroundPalette) {
            fetch(`${config.rootPath}/static/ui/lottie/user_backgrounds/${props.backgroundPalette}_${props.backgroundName}.json`, {credentials: 'include'})
                .then(data => {
                    data.json().then(json => {
                        setLottieBackground(json)
                    })
                })
                .catch(error => console.error(error));
        }
    }, [props.backgroundPalette, props.backgroundName])


    let navigate = useNavigate();

    const scaleSize = (scale: number) => {
        if (typeof props.size === "string") {
            return `calc(${props.size} * ${scale})`
        }
        return props.size * scale
    }

    const internalContent = () => {
        return (
            <div style={{ position: "relative" }}> {/* Common Parent */}
                {props.pro && (
                    <ProBannerCircle
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                        width={scaleSize(1.2)}
                        height={scaleSize(1.2)}
                    />
                )}
                <Badge
                    overlap="circular"
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    variant="dot"
                    style={{
                        position: "absolute",
                        zIndex: 1 // Adjust as needed
                    }}
                >
                    <img src={svgData} style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1 // Adjust as needed
                    }}/>
                </Badge>
                {lottieBackground !== null && props.backgroundName && props.backgroundPalette && (
                    <div>
                        <LottieAnimation
                            animationData={lottieBackground}
                            loop={true}
                            autoplay={true}
                            renderer="svg"
                            style={{
                                width: scaleSize(2),
                                height: scaleSize(2),
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                zIndex: 2,
                                transform: "translate(-50%, -50%)"
                            }}
                        />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            {props.userId !== "n/a" ?
                <ButtonBase
                    onClick={() =>  navigate("/user/" + props.userId)}
                    style={ window.innerWidth > 1000 ? {
                        position: "relative",
                        //@ts-ignore
                        width: scaleSize(1.5),
                        //@ts-ignore
                        height: scaleSize(1.5),
                        display: "flex", // Add Flexbox
                        justifyContent: "center", // Center horizontally
                        alignItems: "center" // Center vertically
                    } : {
                        position: "relative",
                        //@ts-ignore
                        width: scaleSize(1.5),
                        //@ts-ignore
                        height: scaleSize(1.2),
                        display: "flex", // Add Flexbox
                        justifyContent: "center", // Center horizontally
                        alignItems: "center" // Center vertically
                    }}
                    disabled={!props.profileButton}
                >
                    {/* bound content to the center of the button */}
                    <div style={{
                        // position: "absolute",
                        // top: scaleSize(.25),  // Center vertically
                        // left: scaleSize(.25),  // Center horizontally
                        display: "flex", // Add Flexbox
                    }}>
                        {internalContent()}
                    </div>
                </ButtonBase>
                :
                <Badge
                    overlap="circular"
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    variant="dot"
                >
                    {/*<Avatar alt={ProfileIcon}             src={finalSrc === "undefined" ? ProfileIcon : finalSrc}/>*/}
                    <div style={{position: "relative", width: props.size, height: props.size}}>
                        <img src={props.userThumb}
                            //@ts-ignore
                             style={styles.imageTop} width={props.size} height={props.size}></img>
                    </div>
                </Badge>
            }
        </div>
    )
}

UserIcon.defaultProps = {
    size: "10px",
    userTier: "",
    userThumb: "",
    imageTop: null,
    profileButton: true,
    pro: false,
}