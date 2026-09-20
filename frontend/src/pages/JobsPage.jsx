import { useState, useEffect, Fragment } from "react";
import { getJobs, createJob, updateJobStatus, getSuggestedTechnicians } from "../services/jobService";
import { getAppointmentsForJob, createAppointment } from "../services/appointmentService";
import { getNotesForJob, createNote } from "../services/noteService";
import { getCustomers } from "../services/customerService";
import { getLocationsForCustomer } from "../services/locationService";
import { getUsers } from "../services/userService";
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
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
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
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

const canManageJobs = () => {
  const role = getCurrentUser()?.role;
  return role === "ADMIN" || role === "DISPATCHER";
};

// Mirrors the backend's ALLOWED_TRANSITIONS exactly — used only to decide which
// buttons to show. The backend is still the real source of truth and re-checks this.
const NEXT_STATUSES = {
  NEW: ["BOOKED", "CANCELLED"],
  BOOKED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: ["PAID"],
  PAID: [],
  CANCELLED: [],
};

const STATUS_COLORS = {
  NEW: "default",
  BOOKED: "info",
  DISPATCHED: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  PAID: "success",
  CANCELLED: "error",
};

const EMPTY_JOB_FORM = { customerId: "", locationId: "", category: "", description: "", priority: "MEDIUM", source: "WEB" };
const EMPTY_APPOINTMENT_FORM = { technicianId: "", scheduledStart: "", scheduledEnd: "" };

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [customers, setCustomers] = useState([]);
  const [locationsForSelectedCustomer, setLocationsForSelectedCustomer] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);

  const [expandedJobId, setExpandedJobId] = useState(null);
  const [appointmentsByJob, setAppointmentsByJob] = useState({});
  const [notesByJob, setNotesByJob] = useState({});
  const [suggestionsByJob, setSuggestionsByJob] = useState({});

  const [appointmentForm, setAppointmentForm] = useState(EMPTY_APPOINTMENT_FORM);
  const [noteBody, setNoteBody] = useState("");

  function loadJobs() {
    setLoading(true);
    setError("");
    getJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadJobs();
    getCustomers().then(setCustomers).catch(() => {});
    getUsers().then((data) => setTechnicians(data.filter((u) => u.role === "TECHNICIAN"))).catch(() => {});
  }, []);

  function handleJobFormChange(event) {
    const { name, value } = event.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));

    if (name === "customerId") {
      setJobForm((prev) => ({ ...prev, locationId: "" }));
      if (value) {
        getLocationsForCustomer(value).then(setLocationsForSelectedCustomer).catch(() => {});
      } else {
        setLocationsForSelectedCustomer([]);
      }
    }
  }

  function handleJobSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    createJob({
      customerId: Number(jobForm.customerId),
      locationId: Number(jobForm.locationId),
      category: jobForm.category,
      description: jobForm.description,
      priority: jobForm.priority,
      source: jobForm.source,
    })
      .then(() => {
        setMessage("Job created successfully");
        setJobForm(EMPTY_JOB_FORM);
        setShowJobForm(false);
        loadJobs();
      })
      .catch((err) => setError(err.message));
  }

  function loadDetailsFor(jobId) {
    getAppointmentsForJob(jobId).then((data) =>
      setAppointmentsByJob((prev) => ({ ...prev, [jobId]: data }))
    );
    getNotesForJob(jobId).then((data) =>
      setNotesByJob((prev) => ({ ...prev, [jobId]: data }))
    );
    if (canManageJobs()) {
      getSuggestedTechnicians(jobId)
        .then((data) => setSuggestionsByJob((prev) => ({ ...prev, [jobId]: data })))
        .catch(() => {});
    }
  }

  function toggleDetails(jobId) {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    setAppointmentForm(EMPTY_APPOINTMENT_FORM);
    setNoteBody("");
    if (!appointmentsByJob[jobId]) loadDetailsFor(jobId);
  }

  function handleStatusChange(jobId, newStatus) {
    setError("");
    updateJobStatus(jobId, newStatus)
      .then(() => loadJobs())
      .catch((err) => setError(err.message));
  }

  function handleAppointmentFormChange(event) {
    const { name, value } = event.target;
    setAppointmentForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddAppointment(jobId) {
    setError("");
    createAppointment({
      jobId,
      technicianId: Number(appointmentForm.technicianId),
      scheduledStart: new Date(appointmentForm.scheduledStart).toISOString(),
      scheduledEnd: new Date(appointmentForm.scheduledEnd).toISOString(),
    })
      .then(() => {
        setAppointmentForm(EMPTY_APPOINTMENT_FORM);
        return getAppointmentsForJob(jobId);
      })
      .then((data) => setAppointmentsByJob((prev) => ({ ...prev, [jobId]: data })))
      .catch((err) => setError(err.message));
  }

  function handleAddNote(jobId) {
    if (!noteBody.trim()) return;
    setError("");
    createNote({ jobId, body: noteBody })
      .then(() => {
        setNoteBody("");
        return getNotesForJob(jobId);
      })
      .then((data) => setNotesByJob((prev) => ({ ...prev, [jobId]: data })))
      .catch((err) => setError(err.message));
  }

  function renderTechnicianOptions(jobId) {
    const suggestions = suggestionsByJob[jobId];

    // Fallback: no suggestions loaded yet (e.g. still fetching, or fetch failed) —
    // just show the flat technician list, same as before.
    if (!suggestions) {
      return technicians.map((t) => (
        <MenuItem key={t.id} value={t.id}>{t.fullName}</MenuItem>
      ));
    }

    const recommended = suggestions.filter((s) => s.hasMatchingSkill || s.hasMatchingTerritory);
    const others = suggestions.filter((s) => !s.hasMatchingSkill && !s.hasMatchingTerritory);

    const items = [];

    if (recommended.length > 0) {
      items.push(
        <ListSubheader key="recommended-header">Recommended</ListSubheader>
      );
      recommended.forEach((s) => {
        const tags = [];
        if (s.hasMatchingSkill) tags.push("skill match");
        if (s.hasMatchingTerritory) tags.push("territory match");
        items.push(
          <MenuItem key={s.userId} value={s.userId}>
            {s.fullName} ({tags.join(", ")})
          </MenuItem>
        );
      });
    }

    if (others.length > 0) {
      items.push(
        <ListSubheader key="others-header">Other Technicians</ListSubheader>
      );
      others.forEach((s) => {
        items.push(
          <MenuItem key={s.userId} value={s.userId}>{s.fullName}</MenuItem>
        );
      });
    }

    return items;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Jobs</Typography>

      {error && <Alert severity="error" sx={{ marginY: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ marginY: 2 }}>{message}</Alert>}

      {canManageJobs() && (
        <Stack direction="row" sx={{ marginY: 2 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={() => setShowJobForm(true)}>
            Add Job
          </Button>
        </Stack>
      )}

      <Dialog open={showJobForm} onClose={() => setShowJobForm(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleJobSubmit}>
          <DialogTitle>Add Job</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ marginTop: 1 }}>
              <TextField select label="Customer" name="customerId" value={jobForm.customerId} onChange={handleJobFormChange} required fullWidth>
                {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField select label="Location" name="locationId" value={jobForm.locationId} onChange={handleJobFormChange} required fullWidth disabled={!jobForm.customerId}>
                {locationsForSelectedCustomer.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.addressLine1}, {l.city}</MenuItem>
                ))}
              </TextField>
              <TextField label="Category" name="category" value={jobForm.category} onChange={handleJobFormChange} required fullWidth />
              <TextField label="Description" name="description" value={jobForm.description} onChange={handleJobFormChange} required fullWidth multiline rows={2} />
              <TextField select label="Priority" name="priority" value={jobForm.priority} onChange={handleJobFormChange} fullWidth>
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
              </TextField>
              <TextField select label="Source" name="source" value={jobForm.source} onChange={handleJobFormChange} fullWidth>
                <MenuItem value="WEB">WEB</MenuItem>
                <MenuItem value="PHONE">PHONE</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowJobForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Job</Button>
          </DialogActions>
        </form>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j) => (
              <Fragment key={j.id}>
                <TableRow>
                  <TableCell>{j.id}</TableCell>
                  <TableCell>{j.customerName}</TableCell>
                  <TableCell>{j.category}</TableCell>
                  <TableCell>{j.priority}</TableCell>
                  <TableCell>
                    <Chip label={j.status} color={STATUS_COLORS[j.status] || "default"} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => toggleDetails(j.id)}>
                      {expandedJobId === j.id ? "Hide" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={6} sx={{ paddingY: 0, borderBottom: expandedJobId === j.id ? undefined : "none" }}>
                    <Collapse in={expandedJobId === j.id} timeout="auto" unmountOnExit>
                      <Box sx={{ paddingY: 3 }}>

                        {canManageJobs() && (NEXT_STATUSES[j.status] || []).length > 0 && (
                          <Box sx={{ marginBottom: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Advance status:</Typography>
                            <Stack direction="row" spacing={1}>
                              {NEXT_STATUSES[j.status].map((next) => (
                                <Button
                                  key={next}
                                  size="small"
                                  variant="outlined"
                                  color={next === "CANCELLED" ? "error" : "primary"}
                                  onClick={() => handleStatusChange(j.id, next)}
                                >
                                  Mark as {next.replace("_", " ")}
                                </Button>
                              ))}
                            </Stack>
                            <Divider sx={{ marginTop: 2 }} />
                          </Box>
                        )}

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Appointments</Typography>
                            <List dense>
                              {(appointmentsByJob[j.id] || []).map((a) => (
                                <ListItem key={a.id} disableGutters>
                                  <ListItemText
                                    primary={`${a.technicianName} — ${new Date(a.scheduledStart).toLocaleString()}`}
                                    secondary={a.status}
                                  />
                                </ListItem>
                              ))}
                              {(appointmentsByJob[j.id] || []).length === 0 && (
                                <ListItem disableGutters><ListItemText primary="No appointments yet." /></ListItem>
                              )}
                            </List>
                            {canManageJobs() && (
                              <Stack spacing={1}>
                                <TextField
                                  select size="small" label="Technician" name="technicianId"
                                  value={appointmentForm.technicianId} onChange={handleAppointmentFormChange}
                                >
                                  {renderTechnicianOptions(j.id)}
                                </TextField>
                                <Stack direction="row" spacing={1}>
                                  <TextField
                                    type="datetime-local" size="small" name="scheduledStart" label="Start"
                                    value={appointmentForm.scheduledStart} onChange={handleAppointmentFormChange}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  <TextField
                                    type="datetime-local" size="small" name="scheduledEnd" label="End"
                                    value={appointmentForm.scheduledEnd} onChange={handleAppointmentFormChange}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Stack>
                                <Button size="small" variant="outlined" onClick={() => handleAddAppointment(j.id)}>
                                  Schedule Appointment
                                </Button>
                              </Stack>
                            )}
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Notes</Typography>
                            <List dense>
                              {(notesByJob[j.id] || []).map((n) => (
                                <ListItem key={n.id} disableGutters>
                                  <ListItemText primary={n.body} secondary={`${n.authorName} — ${new Date(n.createdAt).toLocaleString()}`} />
                                </ListItem>
                              ))}
                              {(notesByJob[j.id] || []).length === 0 && (
                                <ListItem disableGutters><ListItemText primary="No notes yet." /></ListItem>
                              )}
                            </List>
                            <Stack direction="row" spacing={1}>
                              <TextField
                                size="small" placeholder="Add a note..." value={noteBody}
                                onChange={(e) => setNoteBody(e.target.value)} fullWidth
                              />
                              <Button size="small" variant="outlined" onClick={() => handleAddNote(j.id)}>
                                Add
                              </Button>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
            {jobs.length === 0 && !loading && (
              <TableRow><TableCell colSpan={6}>No jobs yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default JobsPage;