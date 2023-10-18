

import * as React from "react"
import {Avatar} from "@mui/material";
import ProfileIcon from "../img/profileicon.jpeg"

interface IProps {
    width: number | string,
    height: number | string,
    imageSrc: string
}

export default function ProfilePicture(props: IProps) {
    const styles = {
        avatar: {
            display: 'flex',
            width: props.width,
            height: props.height,
            objectFit: 'contain',
            // '& > img': {
            //     transform: "translateY(-50px)"
            // }
        },
        image: {}
    };

    let finalSrc = props.imageSrc;
    if (props.imageSrc !== undefined && props.imageSrc !== null){
        let lastSpot = props.imageSrc.split("/api");
        if (lastSpot[1] === "undefined"){
            finalSrc = "undefined"
        } else {
            finalSrc = props.imageSrc
        }
    }

    return (
        <Avatar
            alt={ProfileIcon}
            src={finalSrc === "undefined" || null ? ProfileIcon : finalSrc}
            sx={styles.avatar}
        />
    )
}

ProfilePicture.defaultProps = {
    width: 56,
    height: 56,
    imageSrc: ""
}