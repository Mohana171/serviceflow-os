import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
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
import PlatformLayout from "../../components/platform/PlatformLayout";
import {
    createTenant, createTenantAdmin, deactivateTenant, getTenants, updateTenant,
} from "../../services/tenantService";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

function PlatformTenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const [tenantDialog, setTenantDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tenantForm, setTenantForm] = useState({ name: "", timezone: null });

    const [adminDialogTenant, setAdminDialogTenant] = useState(null);
    const [adminForm, setAdminForm] = useState({ fullName: "", email: "", password: "" });

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            setTenants(await getTenants());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function openAdd() {
        setEditingId(null);
        setTenantForm({ name: "", timezone: null });
        setTenantDialog(true);
        setError(""); setMessage("");
    }

    function openEdit(tenant) {
        setEditingId(tenant.id);
        setTenantForm({ name: tenant.name, timezone: tenant.timezone });
        setTenantDialog(true);
        setError(""); setMessage("");
    }

    async function saveTenant(e) {
        e.preventDefault();
        if (!tenantForm.timezone) { setError("Pick a timezone."); return; }
        const payload = { name: tenantForm.name.trim(), timezone: tenantForm.timezone };
        try {
            setSaving(true); setError("");
            if (editingId !== null) {
                await updateTenant(editingId, payload);
                setMessage("Tenant updated.");
            } else {
                await createTenant(payload);
                setMessage("Tenant created. Now add its first admin.");
            }
            setTenantDialog(false);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate(tenant) {
        if (!window.confirm(`Deactivate "${tenant.name}"?`)) return;
        try {
            setError(""); setMessage("");
            await deactivateTenant(tenant.id);
            setMessage("Tenant deactivated.");
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    function openAdmin(tenant) {
        setAdminDialogTenant(tenant);
        setAdminForm({ fullName: "", email: "", password: "" });
        setError(""); setMessage("");
    }

    async function saveAdmin(e) {
        e.preventDefault();
        try {
            setSaving(true); setError("");
            await createTenantAdmin(adminDialogTenant.id, {
                fullName: adminForm.fullName.trim(),
                email: adminForm.email.trim(),
                password: adminForm.password,
            });
            setMessage(
                `Admin created. They log in with Tenant ID ${adminDialogTenant.id} and ${adminForm.email.trim()}.`
            );
            setAdminDialogTenant(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <PlatformLayout showLogout>
            <Box sx={{ maxWidth: 1000, margin: "0 auto", padding: 4 }}>
                <Stack direction="row" alignItems="center" sx={{ marginBottom: 3 }}>
                    <Box>
                        <Typography variant="h4">Companies</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {tenants.length} active tenant{tenants.length === 1 ? "" : "s"}
                        </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant="contained" onClick={openAdd}>Add company</Button>
                </Stack>

                {message && <Alert severity="success" sx={{ marginBottom: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

                {loading ? (
                    <CircularProgress />
                ) : tenants.length === 0 ? (
                    <Typography>No active companies yet.</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Company</TableCell>
                                    <TableCell>Timezone</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tenants.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell>{t.timezone}</TableCell>
                                        <TableCell>
                                            <Chip size="small" label={t.active ? "Active" : "Inactive"}
                                                  color={t.active ? "success" : "default"} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button size="small" variant="outlined"
                                                        onClick={() => openAdmin(t)}>Add admin</Button>
                                                <Button size="small" variant="outlined"
                                                        onClick={() => openEdit(t)}>Edit</Button>
                                                <Button size="small" variant="outlined" color="error"
                                                        onClick={() => handleDeactivate(t)}>Deactivate</Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <Dialog open={tenantDialog} onClose={() => setTenantDialog(false)} fullWidth maxWidth="xs">
                <form onSubmit={saveTenant}>
                    <DialogTitle>{editingId !== null ? "Edit company" : "Add company"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ marginTop: 1 }}>
                            <TextField label="Company name" value={tenantForm.name} required fullWidth
                                       disabled={saving}
                                       onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} />
                            <Autocomplete
                                options={TIMEZONES}
                                value={tenantForm.timezone}
                                onChange={(_, value) => setTenantForm({ ...tenantForm, timezone: value })}
                                renderInput={(params) => <TextField {...params} label="Timezone" required />}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTenantDialog(false)} disabled={saving}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={adminDialogTenant !== null} onClose={() => setAdminDialogTenant(null)}
                    fullWidth maxWidth="xs">
                <form onSubmit={saveAdmin}>
                    <DialogTitle>Add admin to {adminDialogTenant?.name}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ marginTop: 1 }}>
                            <TextField label="Full name" value={adminForm.fullName} required fullWidth
                                       onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })} />
                            <TextField label="Email" type="email" value={adminForm.email} required fullWidth
                                       onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
                            <TextField label="Password (min 8 characters)" type="password"
                                       value={adminForm.password} required fullWidth
                                       onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAdminDialogTenant(null)} disabled={saving}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? "Creating..." : "Create admin"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </PlatformLayout>
    );
}

export default PlatformTenantsPage;