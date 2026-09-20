import { useState, useEffect } from "react";
import { getTerritories, createTerritory } from "../services/territoryService";
import { getCurrentUser } from "../services/authService";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
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

const canManage = () => getCurrentUser()?.role === "ADMIN";

const EMPTY_FORM = { name: "" };

function TerritoriesPage() {
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function loadTerritories() {
    setLoading(true);
    setError("");
    getTerritories()
      .then((data) => setTerritories(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTerritories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    createTerritory(form)
      .then(() => {
        setMessage("Territory created successfully");
        setForm(EMPTY_FORM);
        setShowForm(false);
        loadTerritories();
      })
      .catch((err) => setError(err.message));
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Territories</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        The catalog of service areas technicians can be assigned to.
      </Typography>

      {error && <Alert severity="error" sx={{ marginY: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ marginY: 2 }}>{message}</Alert>}

      {canManage() && (
        <Stack direction="row" sx={{ marginY: 2 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={() => setShowForm(true)}>
            Add Territory
          </Button>
        </Stack>
      )}

      <Dialog open={showForm} onClose={() => setShowForm(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add Territory</DialogTitle>
          <DialogContent>
            <TextField
              label="Territory name"
              name="name"
              placeholder="e.g. North Zone"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              sx={{ marginTop: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Territory</Button>
          </DialogActions>
        </form>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {territories.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.name}</TableCell>
                <TableCell>
                  <Chip label={t.active ? "Yes" : "No"} color={t.active ? "success" : "default"} size="small" />
                </TableCell>
              </TableRow>
            ))}
            {territories.length === 0 && !loading && (
              <TableRow><TableCell colSpan={3}>No territories yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TerritoriesPage;