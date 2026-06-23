export const organizationsEvents = new EventTarget();
export const dispatchOrganizationsEvent = (eventName, detail) => { organizationsEvents.dispatchEvent(new CustomEvent(eventName, { detail })); };
