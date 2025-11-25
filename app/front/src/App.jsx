import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import CardDetails from "./pages/CardDetails/CardDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/card/:id" element={<CardDetails />} />
    </Routes>
  );
}
