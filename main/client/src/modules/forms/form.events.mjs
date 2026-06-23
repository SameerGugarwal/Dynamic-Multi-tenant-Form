export const formsEvents = new EventTarget();
export const dispatchFormsEvent = (eventName, detail) => { formsEvents.dispatchEvent(new CustomEvent(eventName, { detail })); };
