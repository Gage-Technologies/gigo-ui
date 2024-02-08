import React from "react";
import mediumBadge from './bytesMedium.svg';

export type ByteBadgeProps = {
    style?: React.CSSProperties;
    finished: boolean;
    inByte?: boolean;
    sizeMultiplier?: number;
};

function BytesMediumBadge(props: ByteBadgeProps) {
    const multiplier = props.sizeMultiplier || 1;
    const baseSize = props.inByte ? 2 : 3;
    const size = `${baseSize * multiplier}vw`;
    const marginLeft = props.inByte ? `${-15 * multiplier}px` : undefined;

    let style = {
        width: size,
        height: size,
        marginLeft,

        ...(props.style ? props.style : {})
    }

    if (props.finished) {
        return (
            <div>
                <img alt="" src={mediumBadge} style={style} />
            </div>
        );
    } else {
        return <></>;
    }
}

export default BytesMediumBadge;