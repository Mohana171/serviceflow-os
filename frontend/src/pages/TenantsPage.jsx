import { useEffect, useState } from "react";

import {
    createTenant,
    deactivateTenant,
    getTenantById,
    getTenants,
    updateTenant
} from "../services/tenantService";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
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

function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [searchId, setSearchId] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        timezone: ""
    });

    useEffect(() => {
        loadAllTenants();
    }, []);

    async function loadAllTenants(showSuccessMessage = false) {
        try {
            setError("");

            const data = await getTenants();
            setTenants(data);

            if (showSuccessMessage) {
                setMessage("All active tenants loaded successfully.");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGetAll() {
        setMessage("");
        setLoading(true);

        await loadAllTenants(true);
    }

    async function handleGetById() {
        if (!searchId.trim()) {
            setError("Enter a tenant ID.");
            setMessage("");
            return;
        }

        try {
            setError("");
            setMessage("");

            const tenant = await getTenantById(searchId);

            setTenants([tenant]);
            setMessage(
                `Tenant ${searchId} loaded successfully.`
            );
        } catch (error) {
            setError(error.message);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value
        }));
    }

    function handleAddClick() {
        setEditingId(null);

        setFormData({
            name: "",
            timezone: ""
        });

        setShowForm(true);
        setError("");
        setMessage("");
    }

    function handleEditClick(tenant) {
        setEditingId(tenant.id);

        setFormData({
            name: tenant.name,
            timezone: tenant.timezone
        });

        setShowForm(true);
        setError("");
        setMessage("");
    }

    function handleCancel() {
        setShowForm(false);
        setEditingId(null);

        setFormData({
            name: "",
            timezone: ""
        });

        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const cleanedTenantData = {
            name: formData.name.trim(),
            timezone: formData.timezone.trim()
        };

        if (
            !cleanedTenantData.name ||
            !cleanedTenantData.timezone
        ) {
            setError(
                "Tenant name and timezone are required."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            if (editingId !== null) {
                await updateTenant(
                    editingId,
                    cleanedTenantData
                );

                await loadAllTenants();

                setMessage(
                    "Tenant updated successfully."
                );
            } else {
                await createTenant(cleanedTenantData);

                await loadAllTenants();

                setMessage(
                    "Tenant created successfully."
                );
            }

            setShowForm(false);
            setEditingId(null);

            setFormData({
                name: "",
                timezone: ""
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate(tenant) {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${tenant.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await deactivateTenant(tenant.id);

            await loadAllTenants();

            setMessage(
                "Tenant deactivated successfully."
            );
        } catch (error) {
            setError(error.message);
        }
    }

    if (loading) {
        return (
            <Box sx={{ padding: 4 }}>
                <Typography variant="h4" gutterBottom>Tenants</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <CircularProgress size={24} />
                    <Typography>Loading tenants...</Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>Tenants</Typography>

            <Typography variant="body1" color="text.secondary" gutterBottom>
                Manage companies using ServiceFlow.
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ marginY: 3 }}>
                <Button variant="outlined" onClick={handleGetAll}>
                    Get All Tenants
                </Button>

                <TextField
                    type="number"
                    value={searchId}
                    onChange={(event) => setSearchId(event.target.value)}
                    label="Tenant ID"
                    size="small"
                    inputProps={{ min: 1 }}
                />

                <Button variant="outlined" onClick={handleGetById}>
                    Get Tenant by ID
                </Button>

                <Box sx={{ flexGrow: 1 }} />

                <Button variant="contained" onClick={handleAddClick}>
                    Add Tenant
                </Button>
            </Stack>

            <Dialog open={showForm} onClose={handleCancel} fullWidth maxWidth="xs">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingId !== null ? "Update Tenant" : "Add Tenant"}
                    </DialogTitle>

                    <DialogContent>
                        <Stack spacing={2} sx={{ marginTop: 1 }}>
                            <TextField
                                label="Tenant Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={saving}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Timezone"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                placeholder="America/New_York"
                                disabled={saving}
                                required
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCancel} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? "Saving..." : editingId !== null ? "Update Tenant" : "Save Tenant"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {message && <Alert severity="success" sx={{ marginBottom: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

            {tenants.length === 0 ? (
                <Typography>No active tenants found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Timezone</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {tenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell>{tenant.id}</TableCell>
                                    <TableCell>{tenant.name}</TableCell>
                                    <TableCell>{tenant.timezone}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={tenant.active ? "Active" : "Inactive"}
                                            color={tenant.active ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleEditClick(tenant)}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDeactivate(tenant)}
                                            >
                                                Deactivate
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default TenantsPage;