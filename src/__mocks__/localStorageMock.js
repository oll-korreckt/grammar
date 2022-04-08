const localStorageMock = (() => {
    let store = {};

    function getItem(key) {
        return key in store ? store[key] : null;
    }

    function setItem(key, value) {
        if (typeof value !== "string") {
            throw "cannot save non-string values to localStorage";
        }
        store[key] = value;
    }

    function removeItem(key) {
        delete store[key];
    }

    function clear() {
        store = {};
    }

    return { getItem, setItem, removeItem, clear };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });