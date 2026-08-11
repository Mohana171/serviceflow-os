import { useState, useEffect } from "react";
import { getCustomers, createCustomer } from "../services/customerService";
import { getLocationsForCustomer, createLocation } from "../services/locationService";
import { getCurrentUser } from "../services/authService";

const canManage = () => {
  const role = getCurrentUser()?.role;
  return role === "ADMIN" || role === "DISPATCHER";
};

const EMPTY_CUSTOMER_FORM = { name: "", primaryPhone: "", email: "" };
const EMPTY_LOCATION_FORM = { addressLine1: "", city: "", state: "", zip: "" };

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER_FORM);

  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [locationsByCustomer, setLocationsByCustomer] = useState({});
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION_FORM);

  function loadCustomers() {
    setLoading(true);
    setError("");
    getCustomers()
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleCustomerChange(event) {
    const { name, value } = event.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCustomerSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    createCustomer(customerForm)
      .then(() => {
        setMessage("Customer created successfully");
        setCustomerForm(EMPTY_CUSTOMER_FORM);
        setShowCustomerForm(false);
        loadCustomers();
      })
      .catch((err) => setError(err.message));
  }

  function toggleLocations(customerId) {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      return;
    }
    setExpandedCustomerId(customerId);
    if (!locationsByCustomer[customerId]) {
      getLocationsForCustomer(customerId)
        .then((data) =>
          setLocationsByCustomer((prev) => ({ ...prev, [customerId]: data }))
        )
        .catch((err) => setError(err.message));
    }
  }

  function handleLocationChange(event) {
    const { name, value } = event.target;
    setLocationForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleLocationSubmit(event, customerId) {
    event.preventDefault();
    setError("");

    const newLocation = { customerId, ...locationForm };

    createLocation(newLocation)
      .then(() => {
        setLocationForm(EMPTY_LOCATION_FORM);
        return getLocationsForCustomer(customerId);
      })
      .then((data) =>
        setLocationsByCustomer((prev) => ({ ...prev, [customerId]: data }))
      )
      .catch((err) => setError(err.message));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customers</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {loading && <p>Loading customers...</p>}

      {canManage() && (
        <button onClick={() => setShowCustomerForm((s) => !s)}>
          {showCustomerForm ? "Cancel" : "Add Customer"}
        </button>
      )}

      {showCustomerForm && (
        <form onSubmit={handleCustomerSubmit} style={{ marginTop: "12px" }}>
          <input
            name="name"
            placeholder="Customer name"
            value={customerForm.name}
            onChange={handleCustomerChange}
            required
          />
          <input
            name="primaryPhone"
            placeholder="Phone"
            value={customerForm.primaryPhone}
            onChange={handleCustomerChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            value={customerForm.email}
            onChange={handleCustomerChange}
          />
          <button type="submit">Save Customer</button>
        </form>
      )}

      <table border="1" cellPadding="6" style={{ marginTop: "16px" }}>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Addresses</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <>
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.primaryPhone}</td>
                <td>{c.email}</td>
                <td>
                  <button onClick={() => toggleLocations(c.id)}>
                    {expandedCustomerId === c.id ? "Hide" : "View"}
                  </button>
                </td>
              </tr>
              {expandedCustomerId === c.id && (
                <tr>
                  <td colSpan="5" style={{ background: "#f7f7f7" }}>
                    <strong>Addresses for {c.name}</strong>
                    <ul>
                      {(locationsByCustomer[c.id] || []).map((loc) => (
                        <li key={loc.id}>
                          {loc.addressLine1}, {loc.city}, {loc.state} {loc.zip}
                        </li>
                      ))}
                      {(locationsByCustomer[c.id] || []).length === 0 && (
                        <li>No addresses yet.</li>
                      )}
                    </ul>

                    {canManage() && (
                      <form
                        onSubmit={(e) => handleLocationSubmit(e, c.id)}
                        style={{ marginTop: "8px" }}
                      >
                        <input
                          name="addressLine1"
                          placeholder="Address"
                          value={locationForm.addressLine1}
                          onChange={handleLocationChange}
                          required
                        />
                        <input
                          name="city"
                          placeholder="City"
                          value={locationForm.city}
                          onChange={handleLocationChange}
                          required
                        />
                        <input
                          name="state"
                          placeholder="State"
                          value={locationForm.state}
                          onChange={handleLocationChange}
                          required
                        />
                        <input
                          name="zip"
                          placeholder="Zip"
                          value={locationForm.zip}
                          onChange={handleLocationChange}
                          required
                        />
                        <button type="submit">Add Address</button>
                      </form>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
          {customers.length === 0 && !loading && (
            <tr><td colSpan="5">No customers yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CustomersPage;