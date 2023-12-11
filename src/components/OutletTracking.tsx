import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTracking } from 'react-tracking';
import { RecordWebUsage, WebTrackingEvent } from '../models/web_usage';
import call from '../services/api-call';
import config from '../config';

interface TrackedOutletProps {
    trackingData?: object;
    onTrack?: (data: object) => void; // Callback function type definition
}

const TrackedOutlet: React.FC<TrackedOutletProps> = ({ trackingData, onTrack }) => {
    const { trackEvent } = useTracking({}, {
        dispatch: (data: any) => {
            call(
                "/api/recordUsage",
                "POST",
                null, null, null,
                data,
            )
        }
    });
    const enterTimeRef = useRef<number>(Date.now());
    const location = useLocation();

    useEffect(() => {
        // Store the current time when the component mounts
        enterTimeRef.current = Date.now();

        const payload: RecordWebUsage = {
            host: window.location.host,
            event: WebTrackingEvent.PageVisit,
            timespent: 0,
            path: location.pathname,
            latitude: null,
            longitude: null,
            metadata: {
                mobile: window.innerWidth < 1000,
                width: window.innerWidth,
                heigth: window.innerHeight,
                user_agent: navigator.userAgent,
                referrer: document.referrer,
            },
        }
        trackEvent(payload);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this effect is only run on mount and unmount

    // Add window event listeners to catch when the user navigates away or closes the page
    useEffect(() => {
        const handleBeforeUnload = () => {
            const timeSpent = (Date.now() - enterTimeRef.current); // Time in millis
            const payload: RecordWebUsage = {
                host: window.location.host,
                event: WebTrackingEvent.PageExit,
                timespent: timeSpent,
                path: location.pathname,
                latitude: null,
                longitude: null,
                metadata: {
                    mobile: window.innerWidth < 1000,
                    width: window.innerWidth,
                    heigth: window.innerHeight,
                    user_agent: navigator.userAgent,
                    referrer: document.referrer,
                }
            }

            // Convert payload to a string
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

            // Use navigator.sendBeacon to send the data to the server
            navigator.sendBeacon(config.rootPath + '/api/recordUsage', blob);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Outlet />;
};

export default TrackedOutlet;
