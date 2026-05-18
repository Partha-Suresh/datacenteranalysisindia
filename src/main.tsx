import * as React from 'react';
import { createRoot } from 'react-dom/client';
import DataCenterDashboard from './viz';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DataCenterDashboard />
  </React.StrictMode>
);
