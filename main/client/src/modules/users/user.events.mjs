export const usersEvents = new EventTarget();
export const dispatchUsersEvent = (eventName, detail) => { usersEvents.dispatchEvent(new CustomEvent(eventName, { detail })); };
