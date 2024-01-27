import React from "react";
import easyBadge from './bytesEasy.svg';

export type ByteBadgeProps = {
    style?: React.CSSProperties;
    finished: boolean;
    inByte?: boolean;
};
function BytesEasyBadge(props: ByteBadgeProps) {
    const size = props.inByte ? '2vw' : '3vw';
    const marginLeft = props.inByte ? '-15px' : undefined;
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