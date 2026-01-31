import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import { AlertProvider } from "./context/AlertContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CreateFund from "./pages/CreateFund";
import MyFunds from "./pages/MyFunds";
import FundDetails from "./pages/FundDetails";

export default function App() {
  return (
    <Web3Provider>
      <AlertProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateFund />} />
              <Route path="/my-funds" element={<MyFunds />} />
              <Route path="/fund/:address" element={<FundDetails />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AlertProvider>
    </Web3Provider>
  );
}
