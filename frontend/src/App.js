// src/App.jsx
import React from "react";

// Survey Component
import Survey from "./components/Survey";

// Styles
import "./styles/survey.css";

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">College Survey</h1>
      <Survey />
    </div>
  );
}

export default App;