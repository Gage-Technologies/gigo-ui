import {useState, useEffect, useRef, RefObject} from 'react';
import {debounce} from "@mui/material";

type FetchCallback = () => Promise<void>;

/**
 * Infinite scroll hook to fetch more data when user scrolls to the bottom of the page
 * @param disableInfiniteScroll
 * @param callback function that is called to fetch more data
 * @param initialize whether to call the callback function on initial render
 * @param buffer distance from the bottom of the page when the callback is triggered
 * @returns hook state and setter
 */
const useInfiniteScroll = (callback: FetchCallback, initialize: boolean = false, buffer: number = 1440, disableInfiniteScroll: RefObject<boolean> | null = null) => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const exit = useRef<boolean>(false);

  async function loop() {
    while (!exit.current) {
      handleScroll();
      await new Promise(r => setTimeout(r, 100));
    }
  }

  useEffect(() => {
    if (initialize && !isFetching && (disableInfiniteScroll !== null && !disableInfiniteScroll.current)) {
      setIsFetching(true);
    }
    loop();
    return () => {
      exit.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isFetching || (disableInfiniteScroll !== null && disableInfiniteScroll.current)) {
      setIsFetching(false);
      return;
    }
    // execute the callback function
    callback().then(() => setIsFetching(false));
  }, [isFetching, callback]);

  function handleScroll() {
    if (
        window.innerHeight + document.documentElement.scrollTop < document.documentElement.scrollHeight - buffer ||
        isFetching ||
        (disableInfiniteScroll !== null && disableInfiniteScroll.current)
    ) {
      return;
    }
    setIsFetching(true);
  }

  return [isFetching, setIsFetching] as const;
};

export default useInfiniteScroll;