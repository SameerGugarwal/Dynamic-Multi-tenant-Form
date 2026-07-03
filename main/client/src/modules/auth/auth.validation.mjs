export const AuthValidation = {
    isValidEmail(email){
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        return re.test(email);
    },

    isValidPassword(password){
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;  
        return re.test(password);
    },

    validateLogin(email, password){
        if( !email || !password) return 'Please fill in all fields';
        if(!this.isValidEmail(email)) return 'Invalid email format.';
        return null;
    },

    validateRegistration(name, email, password, confirmPassword){
        if(!name || !email || !password || !confirmPassword) return 'Please fill in all the fields';
        if(name.length < 3) return 'Name must be at least 3 characters.';
        if(!this.isValidEmail(email)) return 'Invalid email format.';
        if(!this.isValidPassword(password)) return 'Password must be at least 8 characters and contain 1 uppercase letter, 1 number, and 1 special character.';
        if(password !== confirmPassword) return 'Passwords do not match.';
        return null;
    }
};