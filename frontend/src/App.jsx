import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import TenantsPage from "./pages/TenantsPage";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";
import { isLoggedIn } from "./services/authService";

function RequireAuth({ children }) {
    return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Header />

            <main>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<RequireAuth><TenantsPage /></RequireAuth>} />
                    <Route path="/tenants" element={<RequireAuth><TenantsPage /></RequireAuth>} />
                    <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;