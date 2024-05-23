import { MMKVLoader } from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();
/**
 * A Web Storage API implementation used for polyfilling
 * {@code window.localStorage} and/or {@code window.sessionStorage}.
 * <p>
 * The Web Storage API is synchronous whereas React Native's builtin generic
 * storage API {@code AsyncStorage} is asynchronous so the implementation with
 * persistence is optimistic: it will first store the value locally in memory so
 * that results can be served synchronously and then persist the value
 * asynchronously. If an asynchronous operation produces an error, it's ignored.
 */
export default class Storage {
    /**
     * Initializes a new {@code Storage} instance. Loads all previously
     * persisted data items from MMKV Storage if necessary.
     *
     * @param {string|undefined} keyPrefix - The prefix of the
     * MMKV Storage keys to be persisted by this storage.
     */
    constructor(keyPrefix) {
        /**
         * The prefix of the {@code MMKV Storage} keys persisted by this
         * storage. If {@code undefined}, then the data items stored in this
         * storage will not be persisted.
         *
         * @private
         * @type {string}
         */
        this._keyPrefix = keyPrefix;

        // Perform optional asynchronous initialization.
        const initializing = this._initializeAsync();

        if (initializing) {
            // Indicate that asynchronous initialization is under way.
            this._initializing = initializing;

            // When the asynchronous initialization completes, indicate its
            // completion.
            initializing.finally(() => {
                if (this._initializing === initializing) {
                    this._initializing = undefined;
                }
            });
        }
    }

    /**
     * Removes all keys from this storage.
     *
     * @returns {void}
     */
    clear() {
        for (const key of Object.keys(this)) {
            this.removeItem(key);
        }
    }

    /**
     * Returns the value associated with a specific key in this storage.
     *
     * @param {string} key - The name of the key to retrieve the value of.
     * @returns {string|null} The value associated with {@code key} or
     * {@code null}.
     */
    getItem(key) {
        return this.hasOwnProperty(key) ? this[key] : null;
    }

    /**
     * Returns the value associated with a specific key in this {@code Storage}
     * in an async manner. The method is required for the cases where we need
     * the stored data but we're not sure yet whether this {@code Storage} is
     * already initialized (e.g. On app start).
     *
     * @param {string} key - The name of the key to retrieve the value of.
     * @returns {Promise}
     */
    async _getItemAsync(key) {
        await (this._initializing || Promise.resolve()).catch(() => { /* _getItemAsync should always resolve! */ });
        return this.getItem(key);
    }

    /**
     * Performs asynchronous initialization of this {@code Storage} instance
     * such as loading all keys from MMKV Storage.
     *
     * @private
     * @returns {Promise}
     */
    async _initializeAsync() {
        if (typeof this._keyPrefix !== 'undefined') {
            // Load all previously persisted data items from MMKV Storage.
            const indexer = await MMKV.indexer.getKeys();
            const keys = indexer.filter(key => key.startsWith(this._keyPrefix));

            const keyPrefixLength = this._keyPrefix && this._keyPrefix.length;

            for (const key of keys) {
                const value = MMKV.getString(key);
                const strippedKey = key.substring(keyPrefixLength);
                if (!this.hasOwnProperty(strippedKey)) {
                    this[strippedKey] = value;
                }
            }
        }
    }

    /**
     * Returns the name of the nth key in this storage.
     *
     * @param {number} n - The zero-based integer index of the key to get the
     * name of.
     * @returns {string} The name of the nth key in this storage.
     */
    key(n) {
        const keys = Object.keys(this);
        return n < keys.length ? keys[n] : null;
    }

    /**
     * Returns an integer representing the number of data items stored in this
     * storage.
     *
     * @returns {number}
     */
    get length() {
        return Object.keys(this).length;
    }

    /**
     * Removes a specific key from this storage.
     *
     * @param {string} key - The name of the key to remove.
     * @returns {void}
     */
    removeItem(key) {
        delete this[key];
        if (typeof this._keyPrefix !== 'undefined') {
            MMKV.removeItem(`${String(this._keyPrefix)}${key}`);
        }
    }

    /**
     * Adds a specific key to this storage and associates it with a specific
     * value. If the key exists already, updates its value.
     *
     * @param {string} key - The name of the key to add/update.
     * @param {string} value - The value to associate with {@code key}.
     * @returns {void}
     */
    setItem(key, value) {
        value = String(value); // eslint-disable-line no-param-reassign
        this[key] = value;
        if (typeof this._keyPrefix !== 'undefined') {
            MMKV.setString(`${String(this._keyPrefix)}${key}`, value);
        }
    }
}
