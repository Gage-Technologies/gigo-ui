import { useState, useEffect } from 'react';

export const useImagePreloader = (urls: string[]) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        Promise.all(
            urls.map(url => {
                return new Promise<void>((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve();
                    img.onerror = () => reject();
                });
            })
        )
            .then(() => setLoaded(true))
            .catch(() => console.error('Error loading images'));
    }, [urls]);

    return loaded;
};
