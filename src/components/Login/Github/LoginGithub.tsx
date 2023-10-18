import React, {Component} from 'react';
import PropTypes from 'prop-types';

import PopupWindow from './PopupWindow';
import {toQuery} from './utils';
import {Button} from "@mui/material";

class LoginGithub extends Component {
    static propTypes = {
        buttonText: PropTypes.string,
        children: PropTypes.node,
        sx: PropTypes.object,
        color: PropTypes.string,
        clientId: PropTypes.string.isRequired,
        onRequest: PropTypes.func,
        onSuccess: PropTypes.func,
        onFailure: PropTypes.func,
        popupHeight: PropTypes.number,
        popupWidth: PropTypes.number,
        redirectUri: PropTypes.string,
        scope: PropTypes.string,
        disabled: PropTypes.bool
    }

    static defaultProps = {
        buttonText: 'Sign in with GitHub',
        redirectUri: '',
        scope: 'user:email',
        popupHeight: 650,
        popupWidth: 500,
        onRequest: () => {
        },
        onSuccess: () => {
        },
        onFailure: () => {
        },
    }

    onBtnClick = () => {
        // @ts-ignore
        const {clientId, scope, redirectUri, popupHeight, popupWidth} = this.props;
        const search = toQuery({
            client_id: clientId,
            scope,
            redirect_uri: redirectUri,
        });

        // To fix issues with window.screen in multi-monitor setups, the easier option is to
        // center the pop-up over the parent window.
        // @ts-ignore
        const top = window.top.outerHeight / 2 + window.top.screenY - (popupHeight / 2);
        // @ts-ignore
        const left = window.top.outerWidth / 2 + window.top.screenX - (popupWidth / 2);

        // @ts-ignore
        const popup = this.popup = PopupWindow.open(
            'github-oauth-authorize',
            `https://github.com/login/oauth/authorize?${search}`,
            {
                height: popupHeight,
                width: popupWidth,
                top: top,
                left: left
            }
        );

        this.onRequest();
        popup.then(
            // @ts-ignore
            data => this.onSuccess(data),
            // @ts-ignore
            error => this.onFailure(error)
        );
    }

    onRequest = () => {
        // @ts-ignore
        this.props.onRequest();
    }

    // @ts-ignore
    onSuccess = (data) => {
        if (!data.code) {
            return this.onFailure(new Error('\'code\' not found'));
        }

        // @ts-ignore
        this.props.onSuccess(data);
    }

    // @ts-ignore
    onFailure = (error) => {
        // @ts-ignore
        this.props.onFailure(error);
    }

    render() {
        // @ts-ignore
        const {buttonText, children, ...buttonProps} = this.props;
        const attrs = {
            onClick: this.onBtnClick,
            ...buttonProps
        };
        return <Button {...attrs}>{children || buttonText}</Button>;
    }
}

export default LoginGithub;