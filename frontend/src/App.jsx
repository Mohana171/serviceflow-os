import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import WelcomePage from "./pages/WelcomePage";
import UsersPage from "./pages/UsersPage";
import CustomersPage from "./pages/CustomersPage";
import SkillsPage from "./pages/SkillsPage";
import TerritoriesPage from "./pages/TerritoriesPage";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/LoginPage";
import PlatformLoginPage from "./pages/platform/PlatformLoginPage";
import PlatformTenantsPage from "./pages/platform/PlatformTenantsPage";
import { isLoggedIn } from "./services/authService";
import { isPlatformLoggedIn } from "./services/platformAuthService";

function RequireAuth({ children }) {
    return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function RequirePlatformAuth({ children }) {
    return isPlatformLoggedIn() ? children : <Navigate to="/platform/login" replace />;
}

function AppRoutes() {
    const { pathname } = useLocation();
    const isPlatform = pathname.startsWith("/platform");

    return (
        <>
            {!isPlatform && <Header />}

            <main>
                <Routes>
                    <Route path="/platform/login" element={<PlatformLoginPage />} />
                    <Route path="/platform" element={<RequirePlatformAuth><PlatformTenantsPage /></RequirePlatformAuth>} />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<RequireAuth><WelcomePage /></RequireAuth>} />
                    <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
                    <Route path="/customers" element={<RequireAuth><CustomersPage /></RequireAuth>} />
                    <Route path="/skills" element={<RequireAuth><SkillsPage /></RequireAuth>} />
                    <Route path="/territories" element={<RequireAuth><TerritoriesPage /></RequireAuth>} />
                    <Route path="/jobs" element={<RequireAuth><JobsPage /></RequireAuth>} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;