import React from "react";
import hardBadge from './bytesHard.svg';

export type ByteBadgeProps = {
    style?: React.CSSProperties;
    finished: boolean;
    inByte?: boolean;
    sizeMultiplier?: number;
};
function BytesHardBadge(props: ByteBadgeProps) {
    // Default sizeMultiplier to 1 if not provided
    const multiplier = props.sizeMultiplier || 1;

    const baseSize = props.inByte ? 2 : 3;
    const size = `${baseSize * multiplier}vw`;

    const marginLeft = props.inByte ? `${-15 * multiplier}px` : undefined;

    let style = {
        width: size,
        height: size,
        marginLeft,
        ...(props.style ? props.style : {})
    };

    if (props.finished) {
        return (
            <div>
                <img
                    alt=""
                    src={hardBadge}
                    style={style}
                />
            </div>
        );
    } else {
        return <></>;
    }
}

export default BytesHardBadge;