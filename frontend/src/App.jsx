import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import TenantsPage from "./pages/TenantsPage";
import UsersPage from "./pages/UsersPage";

function App() {
    return (
        <BrowserRouter>
            <Header />

            <main>
                <Routes>
                    <Route path="/" element={<TenantsPage />} />
                    <Route path="/tenants" element={<TenantsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;