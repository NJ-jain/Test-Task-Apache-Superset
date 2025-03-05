import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Pages/Login";
import BrushableStackedBarChart from "./Pages/Chart";

const App = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (token) {
      navigate("/chart");
    } else {
      navigate("/");
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/chart" element={<BrushableStackedBarChart />} />
    </Routes>
  );
};

export default App;
