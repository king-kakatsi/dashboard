import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Dashboard from "./pages/dashboard";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";

function App() {
  return (
    <BrowserRouter>
      <main style={{ minHeight: "80vh", padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      {/* <Navbar />
      <Footer /> */}
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
