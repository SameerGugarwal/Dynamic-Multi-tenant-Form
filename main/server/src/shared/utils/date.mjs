
export const addMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

export const isTokenExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};