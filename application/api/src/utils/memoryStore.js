class MemoryStore {
    constructor() {
        this.store = new Map();
        this.ttlTimers = new Map();
    }

    // Set a value with optional TTL (time to live) in seconds
    set(key, value, ttl = null) {
        this.store.set(key, value);
        
        // Clear any existing TTL timer for this key
        if (this.ttlTimers.has(key)) {
            clearTimeout(this.ttlTimers.get(key));
            this.ttlTimers.delete(key);
        }

        // Set new TTL timer if specified
        if (ttl) {
            const timer = setTimeout(() => {
                this.delete(key);
            }, ttl * 1000);
            this.ttlTimers.set(key, timer);
        }

        return true;
    }

    // Get a value
    get(key) {
        return this.store.get(key);
    }

    // Delete a value
    delete(key) {
        // Clear TTL timer if exists
        if (this.ttlTimers.has(key)) {
            clearTimeout(this.ttlTimers.get(key));
            this.ttlTimers.delete(key);
        }
        return this.store.delete(key);
    }

    // Check if key exists
    has(key) {
        return this.store.has(key);
    }

    // Clear all data
    clear() {
        // Clear all TTL timers
        for (const timer of this.ttlTimers.values()) {
            clearTimeout(timer);
        }
        this.ttlTimers.clear();
        this.store.clear();
    }

    // Get all keys
    keys() {
        return Array.from(this.store.keys());
    }

    // Get size of store
    size() {
        return this.store.size;
    }
}

// Create a singleton instance
const memoryStore = new MemoryStore();

module.exports = memoryStore;
