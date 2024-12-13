import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css'; // Ensure the styles are imported
import ClassCapCounter from './ClassCapCounter';

// Set the tab name
document.title = "ClassCapCounter";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClassCapCounter />
  </React.StrictMode>
);
