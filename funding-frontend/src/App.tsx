import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateFund from "./pages/CreateFund";
import MyFunds from "./pages/MyFunds";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateFund />} />
        <Route path="/my-funds" element={<MyFunds />} />
      </Routes>
    </BrowserRouter>
  );
}
