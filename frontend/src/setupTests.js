// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom implements neither matchMedia nor ResizeObserver, and antd relies on both
// (the responsive observer of the grid, the layout sider breakpoints, and the pickers).
if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}

if (!window.ResizeObserver) {
    window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

