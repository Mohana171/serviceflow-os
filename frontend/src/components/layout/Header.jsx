import { Link } from "react-router-dom";

function Header() {
    return (
        <header>
            <h1>ServiceFlow</h1>

            <nav>
                <Link to="/tenants">Tenants</Link>
                {" | "}
                <Link to="/users">Users</Link>
            </nav>
        </header>
    );
}

export default Header;