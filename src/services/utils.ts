/**
 * Returns a promise that when awaited sleeps for the specified time in millis
 * @param millis time in millis to sleep
 */
export async function sleep(millis: number) {
    return new Promise<void>(resolve => setTimeout(resolve, millis));
}