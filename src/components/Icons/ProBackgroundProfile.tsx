import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import { Icon } from "@material-ui/core";
import ProBanner from '../../img/pro-background-profile.svg'
function ProBackgroundProfile(props: any) {
    return (
        <Icon style={{width: "100%", height: "100%"}}>
            <img alt="" src={ProBanner} height={props.height} width={props.width} style={props.style}/>
        </Icon>
    );
}

export default ProBackgroundProfile;