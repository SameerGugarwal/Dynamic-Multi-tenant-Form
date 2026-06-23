export const otpEvents = new EventTarget();
export const dispatchOtpEvent = (eventName, detail) => { otpEvents.dispatchEvent(new CustomEvent(eventName, { detail })); };
