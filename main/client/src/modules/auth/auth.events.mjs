export const authEvents = new EventTarget();
export const dispatchAuthEvent = (eventName, detail) => { authEvents.dispatchEvent(new CustomEvent(eventName, { detail })); };
