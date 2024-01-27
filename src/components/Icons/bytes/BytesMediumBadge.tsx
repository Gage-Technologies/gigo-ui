import React from "react";
import mediumBadge from './bytesMedium.svg';

export type ByteBadgeProps = {
    style?: React.CSSProperties;
    finished: boolean;
    inByte?: boolean;
};

function BytesMediumBadge(props: any) {
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
                <img alt="" src={mediumBadge} style={style} />
            </div>
        );
    } else {
        return <></>;
    }

}

export default BytesMediumBadge;