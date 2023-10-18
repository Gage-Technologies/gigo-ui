import React, {FC, memo} from "react";
import { Player } from '@lottiefiles/react-lottie-player';
import { useInView } from 'react-intersection-observer';

interface LottieAnimationProps {
    animationData: any;
    [x: string]: any;
}

const LottieAnimation: FC<LottieAnimationProps> = memo(({ animationData, ...props }) => {
    const animationRef = React.useRef<Player>(null);

    const [inViewRef, inView] = useInView({
        threshold: 0.1, // Adjust this value based on when you want the animation to play/pause
    });

    // Play or pause the animation based on the visibility
    React.useEffect(() => {
        if (inView && animationRef.current) {
            animationRef.current.play();
        } else if (!inView && animationRef.current) {
            animationRef.current.pause();
        }
    }, [inView]);

    return (
        <div ref={inViewRef}>
            <Player
                ref={animationRef}
                src={animationData}
                {...props}
            />
        </div>
    );
});

export default LottieAnimation;
