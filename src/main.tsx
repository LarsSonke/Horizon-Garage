import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CARS } from './data/cars';
import { preloadGLB } from './lib/ScrollCar';

// Start fetching GLBs immediately — before React renders anything.
// By the time the splash animation finishes, models will be cached.
CARS.forEach(c => { if (c.glbPath) preloadGLB(c.glbPath); });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
