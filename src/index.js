import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import routes from './routes';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root'));

document.addEventListener('ionBackButton', (ev) => {
  ev.detail.register(10, () => {
    window.history.back();
  });
});

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);