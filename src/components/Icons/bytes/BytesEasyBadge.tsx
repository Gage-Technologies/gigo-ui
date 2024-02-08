import React from "react";
import easyBadge from './bytesEasy.svg';

export type ByteBadgeProps = {
    style?: React.CSSProperties;
    finished: boolean;
    inByte?: boolean;
    sizeMultiplier?: number;
};
function BytesEasyBadge(props: ByteBadgeProps) {
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
                <img alt="" src={easyBadge} style={style} />
            </div>
        );
    } else {
        return <></>;
    }
}

export default BytesEasyBadge;