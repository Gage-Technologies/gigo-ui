import {toParams, toQuery} from './utils';

class PopupWindow {
    private id: string;
    private url: string;
    private options: {};
    private window: WindowProxy | null | undefined;
    private promise: Promise<unknown> | undefined;
    private _iid: number | null | undefined;

    constructor(id: string, url: string, options = {}) {
        this.id = id;
        this.url = url;
        this.options = options;
    }

    open() {
        const {url, id, options} = this;

        this.window = window.open(url, id, toQuery(options, ','));
    }

    close() {
        this.cancel();
        if (this.window === null || this.window === undefined) {
            return
        }
        this.window.close();
    }

    poll() {
        this.promise = new Promise((resolve, reject) => {
            this._iid = window.setInterval(() => {
                try {
                    const popup = this.window;

                    if (!popup || popup.closed) {
                        this.close();

                        reject(new Error('The popup was closed'));

                        return;
                    }

                    if (popup.location.href === this.url || popup.location.pathname === 'blank') {
                        return;
                    }

                    const params = toParams(popup.location.search.replace(/^\?/, ''));

                    resolve(params);

                    this.close();
                } catch (error) {
                    /*
                     * Ignore DOMException: Blocked a frame with origin from accessing a
                     * cross-origin frame.
                     */
                }
            }, 500);
        });
    }

    cancel() {
        if (this._iid) {
            window.clearInterval(this._iid);
            this._iid = null;
        }
    }

    then(onSuccess: Function, onFailure: Function) {
        // @ts-ignore
        return this.promise.then(onSuccess, onFailure);
    }

    static open(id: string, url: string, options: {}) {
        const popup = new this(id, url, options);

        popup.open();
        popup.poll();

        return popup;
    }
}

export default PopupWindow;