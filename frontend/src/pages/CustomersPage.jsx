import { useState, useEffect, Fragment } from "react";
import { getCustomers, createCustomer } from "../services/customerService";
import { getLocationsForCustomer, createLocation } from "../services/locationService";
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
  const [showLocationForm, setShowLocationForm] = useState(false);

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
        setShowLocationForm(false);
        return getLocationsForCustomer(customerId);
      })
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
          <Button variant="contained" onClick={() => setShowCustomerForm(true)}>
            Add Customer
          </Button>
        </Stack>
      )}

      <Dialog open={showCustomerForm} onClose={() => setShowCustomerForm(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleCustomerSubmit}>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ marginTop: 1 }}>
              <TextField label="Customer name" name="name" value={customerForm.name} onChange={handleCustomerChange} required fullWidth />
              <TextField label="Phone" name="primaryPhone" value={customerForm.primaryPhone} onChange={handleCustomerChange} fullWidth />
              <TextField label="Email (optional)" name="email" type="email" value={customerForm.email} onChange={handleCustomerChange} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCustomerForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Customer</Button>
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
                </TableRow>

                <TableRow>
                  <TableCell colSpan={5} sx={{ paddingY: 0, borderBottom: expandedCustomerId === c.id ? undefined : "none" }}>
                    <Collapse in={expandedCustomerId === c.id} timeout="auto" unmountOnExit>
                      <Box sx={{ paddingY: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Addresses for {c.name}
                        </Typography>

                        <List dense>
                          {(locationsByCustomer[c.id] || []).map((loc) => (
                            <ListItem key={loc.id} disableGutters>
                              <ListItemText primary={`${loc.addressLine1}, ${loc.city}, ${loc.state} ${loc.zip}`} />
                            </ListItem>
                          ))}
                          {(locationsByCustomer[c.id] || []).length === 0 && (
                            <ListItem disableGutters><ListItemText primary="No addresses yet." /></ListItem>
                          )}
                        </List>

                        {canManage() && (
                          <Button size="small" variant="outlined" onClick={() => setShowLocationForm(c.id)}>
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
              <TableRow><TableCell colSpan={5}>No customers yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!showLocationForm} onClose={() => setShowLocationForm(false)} fullWidth maxWidth="xs">
        <form onSubmit={(e) => handleLocationSubmit(e, showLocationForm)}>
          <DialogTitle>Add Address</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ marginTop: 1 }}>
              <TextField label="Address" name="addressLine1" value={locationForm.addressLine1} onChange={handleLocationChange} required fullWidth />
              <TextField label="City" name="city" value={locationForm.city} onChange={handleLocationChange} required fullWidth />
              <TextField label="State" name="state" value={locationForm.state} onChange={handleLocationChange} required fullWidth />
              <TextField label="Zip" name="zip" value={locationForm.zip} onChange={handleLocationChange} required fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLocationForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Address</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default CustomersPage;