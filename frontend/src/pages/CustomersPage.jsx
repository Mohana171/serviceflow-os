import { useState, useEffect, Fragment } from "react";
import { getCustomers, createCustomer, updateCustomer } from "../services/customerService";
import { getLocationsForCustomer, createLocation, updateLocation, deactivateLocation } from "../services/locationService";
import { getTerritories } from "../services/territoryService";
import { getCurrentUser } from "../services/authService";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const canManage = () => {
  const role = getCurrentUser()?.role;
  return role === "ADMIN" || role === "DISPATCHER";
};

const EMPTY_CUSTOMER_FORM = { name: "", primaryPhone: "", email: "" };
const EMPTY_LOCATION_FORM = { addressLine1: "", city: "", state: "", zip: "", territoryId: "" };

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [territories, setTerritories] = useState([]);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER_FORM);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [locationsByCustomer, setLocationsByCustomer] = useState({});
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION_FORM);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);

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
    getTerritories().then(setTerritories).catch(() => {});
  }, []);

  function handleCustomerChange(event) {
    const { name, value } = event.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddClick() {
    setEditingCustomerId(null);
    setCustomerForm(EMPTY_CUSTOMER_FORM);
    setShowCustomerForm(true);
    setError("");
    setMessage("");
  }

  function handleEditClick(customer) {
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      primaryPhone: customer.primaryPhone || "",
      email: customer.email || "",
    });
    setShowCustomerForm(true);
    setError("");
    setMessage("");
  }

  function handleCustomerFormClose() {
    setShowCustomerForm(false);
    setEditingCustomerId(null);
    setCustomerForm(EMPTY_CUSTOMER_FORM);
  }

  function handleCustomerSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const request = editingCustomerId
      ? updateCustomer(editingCustomerId, customerForm)
      : createCustomer(customerForm);

    request
      .then(() => {
        setMessage(editingCustomerId ? "Customer updated successfully" : "Customer created successfully");
        handleCustomerFormClose();
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

  function handleAddAddressClick(customerId) {
    setEditingLocationId(null);
    setLocationForm(EMPTY_LOCATION_FORM);
    setShowLocationForm(customerId);
  }

  function handleEditAddressClick(customerId, location) {
    setEditingLocationId(location.id);
    setLocationForm({
      addressLine1: location.addressLine1,
      city: location.city,
      state: location.state,
      zip: location.zip,
      territoryId: location.territoryId || "",
    });
    setShowLocationForm(customerId);
  }

  function handleLocationFormClose() {
    setShowLocationForm(false);
    setEditingLocationId(null);
    setLocationForm(EMPTY_LOCATION_FORM);
  }

  function handleLocationSubmit(event, customerId) {
    event.preventDefault();
    setError("");

    const payload = {
      customerId,
      addressLine1: locationForm.addressLine1,
      city: locationForm.city,
      state: locationForm.state,
      zip: locationForm.zip,
      territoryId: locationForm.territoryId ? Number(locationForm.territoryId) : null,
    };

    const request = editingLocationId
      ? updateLocation(editingLocationId, payload)
      : createLocation(payload);

    request
      .then(() => {
        handleLocationFormClose();
        return getLocationsForCustomer(customerId);
      })
      .then((data) =>
        setLocationsByCustomer((prev) => ({ ...prev, [customerId]: data }))
      )
      .catch((err) => setError(err.message));
  }

  function handleDeleteLocation(customerId, locationId) {
    setError("");
    deactivateLocation(locationId)
      .then(() => getLocationsForCustomer(customerId))
      .then((data) =>
        setLocationsByCustomer((prev) => ({ ...prev, [customerId]: data }))
      )
      .catch((err) => setError(err.message));
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Customers</Typography>

      {error && <Alert severity="error" sx={{ marginY: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ marginY: 2 }}>{message}</Alert>}

      {canManage() && (
        <Stack direction="row" sx={{ marginY: 2 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={handleAddClick}>
            Add Customer
          </Button>
        </Stack>
      )}

      <Dialog open={showCustomerForm} onClose={handleCustomerFormClose} fullWidth maxWidth="xs">
        <form onSubmit={handleCustomerSubmit}>
          <DialogTitle>{editingCustomerId ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ marginTop: 1 }}>
              <TextField label="Customer name" name="name" value={customerForm.name} onChange={handleCustomerChange} required fullWidth />
              <TextField label="Phone" name="primaryPhone" value={customerForm.primaryPhone} onChange={handleCustomerChange} fullWidth />
              <TextField label="Email (optional)" name="email" type="email" value={customerForm.email} onChange={handleCustomerChange} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCustomerFormClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCustomerId ? "Update Customer" : "Save Customer"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Addresses</TableCell>
              {canManage() && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c) => (
              <Fragment key={c.id}>
                <TableRow>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.primaryPhone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => toggleLocations(c.id)}>
                      {expandedCustomerId === c.id ? "Hide" : "View"}
                    </Button>
                  </TableCell>
                  {canManage() && (
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleEditClick(c)}>
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>

                <TableRow>
                  <TableCell colSpan={canManage() ? 6 : 5} sx={{ paddingY: 0, borderBottom: expandedCustomerId === c.id ? undefined : "none" }}>
                    <Collapse in={expandedCustomerId === c.id} timeout="auto" unmountOnExit>
                      <Box sx={{ paddingY: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Addresses for {c.name}
                        </Typography>

                        <List dense>
                          {(locationsByCustomer[c.id] || []).map((loc) => (
                            <ListItem
                              key={loc.id}
                              disableGutters
                              secondaryAction={
                                canManage() && (
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleEditAddressClick(c.id, loc)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteLocation(c.id, loc.id)}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                )
                              }
                            >
                              <ListItemText
                                primary={`${loc.addressLine1}, ${loc.city}, ${loc.state} ${loc.zip}`}
                                secondary={loc.territoryName ? `Territory: ${loc.territoryName}` : "No territory assigned"}
                              />
                            </ListItem>
                          ))}
                          {(locationsByCustomer[c.id] || []).length === 0 && (
                            <ListItem disableGutters><ListItemText primary="No addresses yet." /></ListItem>
                          )}
                        </List>

                        {canManage() && (
                          <Button size="small" variant="outlined" onClick={() => handleAddAddressClick(c.id)}>
                            Add Address
                          </Button>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
            {customers.length === 0 && !loading && (
              <TableRow><TableCell colSpan={canManage() ? 6 : 5}>No customers yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!showLocationForm} onClose={handleLocationFormClose} fullWidth maxWidth="xs">
        <form onSubmit={(e) => handleLocationSubmit(e, showLocationForm)}>
          <DialogTitle>{editingLocationId ? "Edit Address" : "Add Address"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ marginTop: 1 }}>
              <TextField label="Address" name="addressLine1" value={locationForm.addressLine1} onChange={handleLocationChange} required fullWidth />
              <TextField label="City" name="city" value={locationForm.city} onChange={handleLocationChange} required fullWidth />
              <TextField label="State" name="state" value={locationForm.state} onChange={handleLocationChange} required fullWidth />
              <TextField label="Zip" name="zip" value={locationForm.zip} onChange={handleLocationChange} required fullWidth />
              <TextField select label="Territory (optional)" name="territoryId" value={locationForm.territoryId} onChange={handleLocationChange} fullWidth>
                <MenuItem value="">None</MenuItem>
                {territories.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLocationFormClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingLocationId ? "Update Address" : "Add Address"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default CustomersPage;