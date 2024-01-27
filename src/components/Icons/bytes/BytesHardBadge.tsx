import React from "react";
import hardBadge from './bytesHard.svg';

export type ByteBadgeProps = {
    style?: React.CSSProperties;
    finished: boolean;
    inByte?: boolean;
};
function BytesHardBadge(props: any) {
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