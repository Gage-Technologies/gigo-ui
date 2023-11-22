import React, { useState, IframeHTMLAttributes, CSSProperties, forwardRef } from 'react';
import { CircularProgress, Box } from '@mui/material';

interface IframeRendererProps extends IframeHTMLAttributes<HTMLIFrameElement> {
    src: string;
    title: string;
    style: CSSProperties | undefined;
}

const IframeRenderer = forwardRef<HTMLIFrameElement, IframeRendererProps>(({ src, title, style, ...rest }, ref) => {
    const [loading, setLoading] = useState(true);

    const handleLoad = () => {
        setLoading(false);
    };

    const loadingContent = (
        <Box
            position="absolute"
            top="50%"
            left="50%"
            style={{ transform: 'translate(-50%, -50%)' }}
        >
            <CircularProgress color="inherit" />
        </Box>
    )

    let s = {
        display: loading ? 'none' : 'block',
    };
    if (style) {
        s = {
            display: loading ? 'none' : 'block',
            ...style
        }
    }

    return (
        <Box position="relative" width="100%" height="100%">
            {(loading || src.length === 0) && loadingContent}
            {src.length !== 0 && (
                <iframe
                    src={src}
                    title={title}
                    style={s}
                    onLoad={handleLoad}
                    ref={ref}
                    {...rest} // Spread additional props here
                />
            )}
        </Box>
    );
});

export default IframeRenderer;
