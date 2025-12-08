
// ============================================================================
// CommendDispatcher - Channel-based Pub/Sub Event System
// ============================================================================
//
// Purpose: Reduce React prop drilling by allowing components to communicate
// via events without direct parent-child relationships.
//
// ============================================================================
// BASIC USAGE
// ============================================================================
//
// 1. Import the dispatcher and channel enum:
//    import CommendDispatcher, { ChannelEnum } from './CommendDispatcher';
//
// 2. Publishing an event (sender component):
//    CommendDispatcher.Publish2Channel(ChannelEnum.DISPLAY_CONTROL, {
//      action: 'scroll-to-topic',
//      topic: 'Topic Name'
//    });
//
// 3. Subscribing to events (receiver component):
//    useEffect(() => {
//      const unsubscribe = CommendDispatcher.Subscribe2Channel(
//        ChannelEnum.DISPLAY_CONTROL,
//        (payload) => {
//          console.log('Received:', payload);
//          // Handle the event
//        }
//      );
//      return unsubscribe; // Cleanup on unmount
//    }, []);
//
// ============================================================================
// AVAILABLE CHANNELS
// ============================================================================
//
// DISPLAY_CONTROL - UI display and scroll actions
//   Payloads:
//   - { action: 'scroll-to-topic', topic: 'Topic Title' }
//
// REFRESH_CONTROL - Data refresh triggers
//
// ============================================================================
// BEST PRACTICES
// ============================================================================
//
// ✅ DO:
// - Use for cross-cutting concerns (auth, notifications, global UI state)
// - Always return the unsubscribe function in useEffect cleanup
// - Define clear payload contracts for each action
// - Check payload structure before using
//
// ❌ DON'T:
// - Use for direct parent-child communication (use props instead)
// - Publish in response to the same channel (avoid circular dependencies)
// - Forget to unsubscribe (causes memory leaks)
//
// ============================================================================

export const ChannelEnum = Object.freeze({
    DISPLAY_CONTROL: 'DISPLAY_CONTROL',
    REFRESH_CONTROL: 'REFRESH_CONTROL',
    TEXT_SELECT: 'TEXT_SELECT',
    // WebSocket message channels
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    PROCESS_STATUS: 'PROCESS_STATUS',
    SMART_UPDATE: 'SMART_UPDATE',
    SOCKET_SEND: 'SOCKET_SEND',
    SOCKET_STATUS: 'SOCKET_STATUS',
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