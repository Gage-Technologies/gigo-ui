import React, { useEffect } from 'react';

const camelToKebabCase = (str: string) => 
    str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const useDynamicStyles = (id: string, target: string, style: React.CSSProperties) => {
    useEffect(() => {
        const styleString = Object.entries(style)
            .map(([key, value]) => `${camelToKebabCase(key)}: ${value};`)
            .join(' ');

        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.id = id;
        styleSheet.innerText = `${target} { ${styleString} }`;
        document.head.appendChild(styleSheet);

        return () => {
            const existingStyleTag = document.getElementById(id);
            if (existingStyleTag) {
                existingStyleTag.remove();
            }
        };
    }, [id, style]);
};

export default useDynamicStyles;
