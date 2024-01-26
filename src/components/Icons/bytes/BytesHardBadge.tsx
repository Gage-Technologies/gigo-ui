import React from "react";
import hardBadge from './bytesHard.svg';

export type ByteBadgeProps = {
    finished: boolean;
    inByte?: boolean;
};
function BytesHardBadge(props: any) {

    if (props.finished) {
        const size = props.inByte ? '2vw' : '7vw';
        const marginLeft = props.inByte ? '-15px' : '-40px';

        return (
            <div>
                <img alt="" src={hardBadge} style={{width: size, height: size, marginLeft: marginLeft}} />
            </div>
        );
    } else {
        return <></>;
    }


}

export default BytesHardBadge;