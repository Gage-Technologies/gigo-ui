import React, {FunctionComponent, ReactNode, useEffect, useState} from 'react'
import {Box} from "@mui/material";
import Lottie from "react-lottie";
import * as sword from "../../img/Nemesis/sword.json"
import * as clash from "../../img/Nemesis/clashing.json"

export type CustomizedProgressbarProps = {
    radius: number,
    progress: number,
    steps?: number,
    cut?: number,
    rotate?: number,
    strokeWidth?: number,
    strokeColor?: string,
    fillColor?: string,
    strokeLinecap?: 'round' | 'inherit' | 'butt' | 'square',
    transition?: string,
    pointerRadius?: number,
    pointerStrokeWidth?: number,
    pointerStrokeColor?: string,
    pointerFillColor?: string,
    trackStrokeColor?: string,
    trackStrokeWidth?: number,
    outlineColor?: string,
    trackStrokeLinecap?: 'round' | 'inherit' | 'butt' | 'square',
    trackTransition?: string,
    counterClockwise?: boolean,
    inverse?: boolean,
    initialAnimation?: boolean,
    initialAnimationDelay?: number,
    className?: string,
    mirror?: boolean,
    children?: ReactNode
}

const swords = {
    loop: true,
    autoplay: true,
    animationData: clash,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet'
    }
};

const CustomizedProgressbar: FunctionComponent<CustomizedProgressbarProps> = ({
radius,
progress,
steps,
cut,
rotate,
strokeWidth,
strokeColor,
fillColor,
strokeLinecap,
transition,
pointerRadius,
pointerStrokeWidth,
pointerStrokeColor,
pointerFillColor,
outlineColor,
trackStrokeColor,
trackStrokeWidth,
trackStrokeLinecap,
trackTransition,
counterClockwise,
inverse,
initialAnimation,
mirror,
initialAnimationDelay,
className,
children
}) => {

    const [ animationInited, setAnimationInited ] = useState(false)

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if(initialAnimation) timeout = setTimeout(() => setAnimationInited(true), initialAnimationDelay)

        return () => clearTimeout(timeout)
    }, [])

    const getProgress = () => initialAnimation && !animationInited ? 0 : progress

    const getStrokeDashoffset = (strokeLength: number) => {
        const progress = getProgress()
        const progressLength = (strokeLength / steps!) * (steps! - progress)

        if(inverse) {
            return counterClockwise ? 0 : progressLength - strokeLength
        }

        return counterClockwise ? -1 * progressLength : progressLength
    }

    const getStrokeDashArray = (strokeLength: number, circumference: number) => {
        const progress = getProgress()
        const progressLength = (strokeLength / steps!) * (steps! - progress)

        if(inverse) {
            return `${progressLength}, ${circumference}`
        }

        return counterClockwise
            ? `${strokeLength * (progress / 100)}, ${circumference}`
            : `${strokeLength}, ${circumference}`
    }

    const getTrackStrokeDashArray = (strokeLength: number, circumference: number) => {
        if(initialAnimation && !animationInited) {
            return `0, ${circumference}`
        }

        return `${strokeLength}, ${circumference}`
    }

    const getExtendedWidth = () => {
        const pointerWidth = pointerRadius! + pointerStrokeWidth!

        if(pointerWidth > strokeWidth! && pointerWidth > trackStrokeWidth!) {
            return pointerWidth * 2
        } else if(strokeWidth! > trackStrokeWidth!) {
            return strokeWidth! * 2
        }

        return trackStrokeWidth! * 2
    }

    const getPointerAngle = () => {
        const progress = getProgress()

        return counterClockwise
            ? ((360 - cut!) / steps!) * (steps! - progress)
            : ((360 - cut!) / steps!) * progress
    }

    const d = 2 * radius
    const width = d + getExtendedWidth()

    const circumference = 2 * Math.PI * radius
    let strokeLength = (circumference / 360) * (360 - cut!)


    // strokeLength = 350

    return (
        <div
            className={`RCP ${className}`}
            style={{
                position: 'relative',
                width: `${width}px`
            }}
        >
            <svg
                width={width}
                height={width}
                viewBox={`0 0 ${width} ${width}`}
                style={{transform: `rotate(${rotate}deg)`, overflow: 'visible',}}

            >
                {outlineColor !== undefined  && (
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke={outlineColor}
                        strokeWidth={"20px"}
                        strokeDasharray={getTrackStrokeDashArray(
                            (strokeLength - 7),
                            circumference
                        )}
                        strokeLinecap={"square"}
                        className="RCP__track"
                        style={{ transition: trackTransition, zIndex: -1 }}
                    />
                )}
                {trackStrokeWidth! > 0 && (
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke={trackStrokeColor}
                        strokeWidth={trackStrokeWidth}
                        strokeDasharray={getTrackStrokeDashArray(
                            strokeLength,
                            circumference
                        )}
                        strokeLinecap={"square"}
                        className="RCP__track"
                        style={{ transition: trackTransition }}
                    />
                )}
                {strokeWidth! > 0 && (
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={getStrokeDashArray(
                            strokeLength,
                            circumference
                        )}
                        strokeDashoffset={getStrokeDashoffset(
                            strokeLength
                        )}
                        strokeLinecap={"square"}
                        className="RCP__progress"
                        style={{ transition }}
                    />
                )}
                {progress !== 0 && progress!== 100 && (
                    <>
                        <circle
                            id={"nemesis"}
                            cx={d}
                            cy="50%"
                            r={pointerRadius}
                            fill={pointerFillColor}
                            stroke={pointerStrokeColor}
                            strokeWidth={pointerStrokeWidth}
                            className="RCP__pointer"
                            style={{
                                transformOrigin: '50% 50%',
                                transform: `rotate(${getPointerAngle()}deg) translate(${getExtendedWidth() / 2}px)`,
                                transition,
                                overflow: 'visible'
                        }}/>
                        {/*<foreignObject*/}
                        {/*    x={d - 15}*/}
                        {/*    y="45%"*/}
                        {/*    overflow="visible"*/}
                        {/*    style={{*/}
                        {/*        transformOrigin: '50% 50%',*/}
                        {/*        transform: `rotate(${getPointerAngle()}deg) translate(${getExtendedWidth() / 2}px)`,*/}
                        {/*        transition,*/}
                        {/*        zIndex: 999*/}
                        {/*}} >*/}
                        {/*    <div style={{zIndex: 9999}}>*/}
                        {/*        {mirror ?*/}
                        {/*            <Lottie*/}
                        {/*                options={swords}*/}
                        {/*                width={75}*/}
                        {/*                height={75}*/}
                        {/*                style={{zIndex: 999, overflow: 'visible', transform: `rotate(225deg) translatex(30px) translateY(-20px)`}}*/}
                        {/*            />*/}
                        {/*        :*/}
                        {/*            <Lottie*/}
                        {/*                options={swords}*/}
                        {/*                width={75}*/}
                        {/*                height={75}*/}
                        {/*                style={{zIndex: 999, overflow: 'visible', transform: `rotate(45deg) translatex(-30px)`,}}*/}
                        {/*            />}*/}
                        {/*    </div>*/}
                        {/*</foreignObject>*/}
                    </>
                )}
            </svg>

            {children || null}
        </div>
    )

}

CustomizedProgressbar.defaultProps = {
    radius: 100,
    progress: 0,
    steps: 100,
    cut: 0,
    rotate: -90,

    strokeWidth: 20,
    strokeColor: 'indianred',
    fillColor: 'none',
    strokeLinecap: 'round',
    transition: '.3s ease',

    pointerRadius: 0,
    pointerStrokeWidth: 20,
    pointerStrokeColor: 'indianred',
    pointerFillColor: 'white',

    trackStrokeColor: '#e6e6e6',
    trackStrokeWidth: 20,
    trackStrokeLinecap: 'round',
    trackTransition: '.3s ease',

    counterClockwise: false,
    inverse: false,

    initialAnimation: false,
    initialAnimationDelay: 0,
    className: ''
}

export default CustomizedProgressbar