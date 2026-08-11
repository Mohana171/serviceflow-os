import { Link, useNavigate } from "react-router-dom";
import { logout, isLoggedIn, getCurrentUser } from "../../services/authService";

function Header() {
    const navigate = useNavigate();
    const loggedIn = isLoggedIn();
    const user = getCurrentUser();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header>
            <h1>ServiceFlow</h1>

            {loggedIn && (
                <nav>
                    <Link to="/tenants">Tenants</Link>
                    {" | "}
                    <Link to="/users">Users</Link>
                    {" | "}
                    <Link to="/customers">Customers</Link>
                    {" | "}
                    <span>{user?.fullName}</span>{" "}
                    <button onClick={handleLogout}>Log out</button>
                </nav>
            )}
        </header>
    );
}

export default Header;