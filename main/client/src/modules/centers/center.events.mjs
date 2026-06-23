export const centersEvents = new EventTarget();
export const dispatchCentersEvent = (eventName, detail) => { centersEvents.dispatchEvent(new CustomEvent(eventName, { detail })); };
