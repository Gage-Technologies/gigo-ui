import { FC, memo, useState, useRef, useEffect } from "react";
import { Player } from '@lottiefiles/react-lottie-player';
import { useInView } from 'react-intersection-observer';

interface LottieAnimationProps {
    animationData: any;
    mouseMove?: boolean;
    [x: string]: any;
}

const LottieAnimation: FC<LottieAnimationProps> = memo(({ animationData, mouseMove, ...props }) => {
    if (window.innerWidth < 1000) {
        mouseMove = false
        props.autoplay = true
    }
    const animationRef = useRef<Player>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isCursorNear, setIsCursorNear] = useState(mouseMove === undefined ? true : !mouseMove);

    
    const [inViewRef, inView] = useInView({
        threshold: 0.1, // Adjust this value based on when you want the animation to play/pause
    });

    const handleMouseMove = (event: MouseEvent): any => {
        if (containerRef.current) {
            const bounds = containerRef.current.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height / 2;
            const distance = Math.sqrt(
                Math.pow(centerX - event.clientX, 2) + Math.pow(centerY - event.clientY, 2)
            );

            setIsCursorNear(distance <= 250);
        }
    };

    // Play or pause the animation based on the visibility
    useEffect(() => {
        if (inView && animationRef.current) {
            animationRef.current.play();
        } else if (!inView && animationRef.current) {
            animationRef.current.pause();
        }
    }, [inView]);

    useEffect(() => {
        if (mouseMove) {
            // Attach the event listener to the window object
            window.addEventListener('mousemove', handleMouseMove);

            // Clean up the event listener when the component unmounts
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, []);

    if (mouseMove) {
        props.autoplay = true
    }

    return (
        <div ref={inViewRef}>
            <div ref={containerRef}>
                {isCursorNear && (
                    <Player
                        ref={animationRef}
                        src={animationData}
                        {...props}
                    />
                )}
            </div>
        </div>
    );
});

export default LottieAnimation;
