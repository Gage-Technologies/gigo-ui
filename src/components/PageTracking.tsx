// withPageTracking.tsx
import React, { useEffect, useRef, ComponentType } from 'react';
import track, { useTracking, TrackingProp } from 'react-tracking';
import { useLocation } from 'react-router-dom';
import { RecordWebUsage, WebTrackingEvent } from '../models/web_usage';
import call from '../services/api-call';

interface WithPageTrackingProps {
    trackingData?: object;
}

export function withPageTracking<P extends WithPageTrackingProps>(
    WrappedComponent: ComponentType<P>,
    pageData?: object
) {
    const WithPageTracking: React.FC<P & WithPageTrackingProps> = (props) => {
        const { trackEvent } = useTracking();
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
                latitude: 0,
                longitude: 0,
                metadata: {
                    ...pageData,
                    ...props.trackingData,
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
                        ...pageData,
                        ...props.trackingData,
                    }
                }
                trackEvent(payload);
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const dispatchWithWebSocket = (data: any) => {
            call(
                "/api/recordUsage",
                "POST",
                null, null,
                data,
            )
        };

        const TrackedComponent = track(
            {
                host: window.location.host,
            },
            {
                dispatch: dispatchWithWebSocket,
            }
        )(WrappedComponent);

        // Render the wrapped component with all original props passed down
        return <TrackedComponent {...(props as P)} />;
    };

    // Set the display name for the wrapped component for easier debugging
    const wrappedComponentName =
        WrappedComponent.displayName || WrappedComponent.name || 'Component';
    WithPageTracking.displayName = `withPageTracking(${wrappedComponentName})`;

    return WithPageTracking;
}
