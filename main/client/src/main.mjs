// src/main.mjs
// Vite will automatically inject this into the DOM
import './styles/globals.css';


import { App } from './app.mjs';

// 3. Boot the Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Booting application...');
    const app = new App();
    app.init();
});
