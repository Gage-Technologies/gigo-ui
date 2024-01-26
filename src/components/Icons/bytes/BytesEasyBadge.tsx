import React from "react";
import easyBadge from './bytesEasy.svg';

export type ByteBadgeProps = {
    finished: boolean;
    inByte?: boolean;
};
function BytesEasyBadge(props: ByteBadgeProps) {
    if (props.finished) {
        const size = props.inByte ? '2vw' : '7vw';
        const marginLeft = props.inByte ? '-15px' : '-40px';

        return (
            <div>
                <img alt="" src={easyBadge} style={{width: size, height: size, marginLeft: marginLeft}} />
            </div>
        );
    } else {
        return <></>;
    }
}

export default BytesEasyBadge;