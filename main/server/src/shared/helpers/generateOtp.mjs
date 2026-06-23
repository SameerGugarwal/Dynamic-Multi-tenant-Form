import crypto from 'crypto';


const generateOtp = () => {
  // Generates a random integer strictly between 100000 (inclusive) and 1000000 (exclusive)
  const secureNumber = crypto.randomInt(100000, 1000000);
  
  return String(secureNumber);
};

export default generateOtp;