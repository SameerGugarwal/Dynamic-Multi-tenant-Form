import './styles/globals.css';

import { App } from './app.mjs';

//3. boot the application 
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Booting application...')
    const app  = new App();
    app.init();
});
