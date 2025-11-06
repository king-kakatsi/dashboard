import React from "react";
import ReactDOM from "react-dom/client";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";

// function App() {
//   return (
//     <BrowserRouter>
//       <main style={{ minHeight: "80vh", padding: "1rem" }}>
        
//       </main>
//       {/* <Navbar />
//       <Footer /> */}
//     </BrowserRouter>
//   );
// }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
