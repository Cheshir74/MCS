import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hello from "../components/Hello";
define({ 'hello-component': Hello })

export default (
  <Router>
    <Routes>
      <Route path="/" element={<Hello />} />
    </Routes>
  </Router>
);