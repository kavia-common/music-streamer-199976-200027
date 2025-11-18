//
// PUBLIC_INTERFACE
// storage.js: Safe wrappers for localStorage and sessionStorage with JSON helpers.
//

const isBrowser = typeof window !== 'undefined';

function safeGet(store, key) {
  try {
    if (!isBrowser) return null;
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store, key, value) {
  try {
    if (!isBrowser) return;
    store.setItem(key, value);
  } catch {
    // ignore quota or privacy errors
  }
}

function safeRemove(store, key) {
  try {
    if (!isBrowser) return;
    store.removeItem(key);
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export const storage = {
  /** Get raw string from localStorage. */
  get(key) {
    return safeGet(window.localStorage, key);
  },
  /** Set raw string to localStorage. */
  set(key, value) {
    safeSet(window.localStorage, key, value);
  },
  /** Remove from localStorage. */
  remove(key) {
    safeRemove(window.localStorage, key);
  },
  /** JSON get from localStorage. */
  getJson(key, fallback = null) {
    const v = safeGet(window.localStorage, key);
    if (!v) return fallback;
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  /** JSON set to localStorage. */
  setJson(key, obj) {
    try {
      safeSet(window.localStorage, key, JSON.stringify(obj));
    } catch {
      // ignore
    }
  },
};

// PUBLIC_INTERFACE
export const session = {
  /** Get raw string from sessionStorage. */
  get(key) {
    return safeGet(window.sessionStorage, key);
  },
  /** Set raw string to sessionStorage. */
  set(key, value) {
    safeSet(window.sessionStorage, key, value);
  },
  /** Remove from sessionStorage. */
  remove(key) {
    safeRemove(window.sessionStorage, key);
  },
  /** JSON get from sessionStorage. */
  getJson(key, fallback = null) {
    const v = safeGet(window.sessionStorage, key);
    if (!v) return fallback;
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  /** JSON set to sessionStorage. */
  setJson(key, obj) {
    try {
      safeSet(window.sessionStorage, key, JSON.stringify(obj));
    } catch {
      // ignore
    }
  },
};
