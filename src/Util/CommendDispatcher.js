
// Simple channel-based pub/sub dispatcher
// Usage:
//   import CommendDispatcher, { ChannelEnum } from './CommendDispatcher';
//   const unsubscribe = CommendDispatcher.Subscribe2Channel(ChannelEnum.DISPLAY_CONTROL, (value) => { ... });
//   CommendDispatcher.Publish2Channel(ChannelEnum.DISPLAY_CONTROL, payload);

export const ChannelEnum = Object.freeze({
    DISPLAY_CONTROL: 'DISPLAY_CONTROL',
    REFRESH_CONTROL: 'REFRESH_CONTROL',
});

class CommendDispatcher {
    constructor() {
        // Map<string, Set<Function>>
        this._channels = new Map();
    }

    /**
     * Subscribe to a channel.
     * @param {string} channel - One of ChannelEnum values.
     * @param {(value:any)=>void} handler - Callback to invoke when a value is published.
     * @returns {() => void} Unsubscribe function.
     */
    Subscribe2Channel(channel, handler) {
        if (!channel || typeof handler !== 'function') {
            console.warn('CommendDispatcher.Subscribe2Channel: invalid arguments', { channel, handlerType: typeof handler });
            return () => {};
        }
        let set = this._channels.get(channel);
        if (!set) {
            set = new Set();
            this._channels.set(channel, set);
        }
        set.add(handler);
        // Return unsubscribe function
        return () => {
            const current = this._channels.get(channel);
            if (!current) return;
            current.delete(handler);
            if (current.size === 0) {
                this._channels.delete(channel);
            }
        };
    }

    /**
     * Publish a value to a channel.
     * @param {string} channel - One of ChannelEnum values.
     * @param {any} value - Payload to deliver to subscribers.
     */
    Publish2Channel(channel, value) {
        const set = this._channels.get(channel);
        if (!set || set.size === 0) return;
        // Copy to array to avoid mutation issues if handlers unsubscribe during publish
        [...set].forEach((handler) => {
            try {
                handler(value);
            } catch (err) {
                console.error('CommendDispatcher handler error on channel', channel, err);
            }
        });
    }
}

// Export a singleton instance for convenience across the app
const instance = new CommendDispatcher();
export default instance;