import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import PublicNavigationMenu from './pages/PublicNav';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div >
        <PublicNavigationMenu/>
      </div>
      <div className='app-main'>
        <App />
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
