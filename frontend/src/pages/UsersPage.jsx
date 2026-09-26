import { useState, useEffect, Fragment } from "react";
import { getUsers, createUser, updateUser, deactivateUser, reactivateUser } from "../services/userService";
import { getCurrentUser } from "../services/authService";
import { getSkills } from "../services/skillService";
import { getUserSkills, assignSkill } from "../services/userSkillService";
import { getTerritories } from "../services/territoryService";
import { getUserTerritories, assignTerritory } from "../services/userTerritoryService";
import { getUserSchedule, createSchedule } from "../services/scheduleService";

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

// Who may create/edit/deactivate which roles (the backend enforces this too).
// Admin accounts are created only by the platform owner.
const MANAGEABLE_ROLES = {
  ADMIN: ["DISPATCHER", "TECHNICIAN"],
  DISPATCHER: ["TECHNICIAN"],
};

const EMPTY_USER_FORM = { fullName: "", email: "", password: "", role: "TECHNICIAN" };
const EMPTY_SCHEDULE_FORM = { day: "", startTime: "", endTime: "", type: "REGULAR" };

const canManageUser = (targetRole) =>
  (MANAGEABLE_ROLES[getCurrentUser()?.role] || []).includes(targetRole);

const canAssignSkillOrTerritory = () => {
  const role = getCurrentUser()?.role;
  return role === "ADMIN" || role === "DISPATCHER";
};
const canManageSchedule = () => {
  const role = getCurrentUser()?.role;
  return role === "ADMIN" || role === "DISPATCHER";
};

function UsersPage() {
  const currentUser = getCurrentUser();
  const allowedRoles = MANAGEABLE_ROLES[currentUser?.role] || [];

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(EMPTY_USER_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [allSkills, setAllSkills] = useState([]);
  const [allTerritories, setAllTerritories] = useState([]);

  const [expandedUserId, setExpandedUserId] = useState(null);
  const [skillsByUser, setSkillsByUser] = useState({});
  const [territoriesByUser, setTerritoriesByUser] = useState({});
  const [scheduleByUser, setScheduleByUser] = useState({});

  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedTerritoryId, setSelectedTerritoryId] = useState("");
  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE_FORM);

  function loadUsers() {
    setLoading(true);
    getUsers()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
    getSkills().then(setAllSkills).catch(() => {});
    getTerritories().then(setAllTerritories).catch(() => {});
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setFormData({ ...EMPTY_USER_FORM, role: allowedRoles[0] || "TECHNICIAN" });
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function openEdit(u) {
    setEditingId(u.id);
    setFormData({ fullName: u.fullName, email: u.email, password: "", role: u.role });
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_USER_FORM);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const isEdit = editingId !== null;

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
    };

    if (isEdit) {
      if (formData.password) payload.password = formData.password;
    } else {
      payload.password = formData.password;
      payload.role = formData.role;
    }

    const request = isEdit ? updateUser(editingId, payload) : createUser(payload);

    request
      .then(() => {
        setMessage(isEdit ? "User updated successfully" : "User created successfully");
        closeForm();
        loadUsers();
      })
      .catch((err) => setError(err.message));
  }

  function handleToggleActive(u) {
    if (u.active && !window.confirm(`Deactivate ${u.fullName}? They will no longer be able to log in.`)) {
      return;
    }
    setError("");
    setMessage("");

    const action = u.active ? deactivateUser(u.id) : reactivateUser(u.id);

    action
      .then(() => {
        setMessage(u.active ? "User deactivated" : "User reactivated");
        loadUsers();
      })
      .catch((err) => setError(err.message));
  }

  function loadDetailsFor(userId) {
    getUserSkills(userId).then((data) =>
      setSkillsByUser((prev) => ({ ...prev, [userId]: data }))
    );
    getUserTerritories(userId).then((data) =>
      setTerritoriesByUser((prev) => ({ ...prev, [userId]: data }))
    );
    getUserSchedule(userId).then((data) =>
      setScheduleByUser((prev) => ({ ...prev, [userId]: data }))
    );
  }

  function toggleDetails(userId) {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);
    setSelectedSkillId("");
    setSelectedTerritoryId("");
    setScheduleForm(EMPTY_SCHEDULE_FORM);
    if (!skillsByUser[userId]) loadDetailsFor(userId);
  }

  function handleAssignSkill(userId) {
    if (!selectedSkillId) return;
    setError("");
    assignSkill({ userId, skillId: Number(selectedSkillId) })
      .then(() => {
        setSelectedSkillId("");
        return getUserSkills(userId);
      })
      .then((data) => setSkillsByUser((prev) => ({ ...prev, [userId]: data })))
      .catch((err) => setError(err.message));
  }

  function handleAssignTerritory(userId) {
    if (!selectedTerritoryId) return;
    setError("");
    assignTerritory({ userId, territoryId: Number(selectedTerritoryId) })
      .then(() => {
        setSelectedTerritoryId("");
        return getUserTerritories(userId);
      })
      .then((data) => setTerritoriesByUser((prev) => ({ ...prev, [userId]: data })))
      .catch((err) => setError(err.message));
  }

  function handleScheduleChange(event) {
    const { name, value } = event.target;
    setScheduleForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddSchedule(userId) {
    setError("");
    const payload = {
      userId,
      day: scheduleForm.day,
      startTime: `${scheduleForm.startTime}:00`,
      endTime: `${scheduleForm.endTime}:00`,
      type: scheduleForm.type,
    };
    createSchedule(payload)
      .then(() => {
        setScheduleForm(EMPTY_SCHEDULE_FORM);
        return getUserSchedule(userId);
      })
      .then((data) => setScheduleByUser((prev) => ({ ...prev, [userId]: data })))
      .catch((err) => setError(err.message));
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Users</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Showing users for: <strong>{currentUser?.fullName}'s company</strong>
      </Typography>

      {error && <Alert severity="error" sx={{ marginY: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ marginY: 2 }}>{message}</Alert>}

      <Stack direction="row" sx={{ marginY: 2 }}>
        <Box sx={{ flexGrow: 1 }} />
        {allowedRoles.length > 0 && (
          <Button variant="contained" onClick={openAdd}>
            Add User
          </Button>
        )}
      </Stack>

      <Dialog open={showForm} onClose={closeForm} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId !== null ? "Edit User" : "Add User"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ marginTop: 1 }}>
              <TextField label="Full name" name="fullName" value={formData.fullName} onChange={handleChange} required fullWidth />
              <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required fullWidth />
              <TextField
                label={editingId !== null ? "New password (leave blank to keep current)" : "Password"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={editingId === null}
                fullWidth
              />
              <TextField
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={editingId !== null}
                fullWidth
              >
                {(editingId !== null ? [formData.role] : allowedRoles).map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeForm}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId !== null ? "Save Changes" : "Save User"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <Fragment key={u.id}>
                <TableRow>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.active ? "Yes" : "No"} color={u.active ? "success" : "default"} size="small" />
                  </TableCell>
                  <TableCell>
                    {u.role === "TECHNICIAN" ? (
                      <Button size="small" variant="outlined" onClick={() => toggleDetails(u.id)}>
                        {expandedUserId === u.id ? "Hide" : "View"}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.disabled">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {canManageUser(u.role) ? (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color={u.active ? "error" : "success"}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.active ? "Deactivate" : "Reactivate"}
                        </Button>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.disabled">-</Typography>
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={7} sx={{ paddingY: 0, borderBottom: expandedUserId === u.id ? undefined : "none" }}>
                    <Collapse in={expandedUserId === u.id} timeout="auto" unmountOnExit>
                      <Box sx={{ paddingY: 3 }}>
                        <Grid container spacing={3}>

                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" gutterBottom>Skills</Typography>
                            <List dense>
                              {(skillsByUser[u.id] || []).map((s) => (
                                <ListItem key={s.skillId} disableGutters>
                                  <ListItemText primary={s.skillName} />
                                </ListItem>
                              ))}
                              {(skillsByUser[u.id] || []).length === 0 && (
                                <ListItem disableGutters><ListItemText primary="No skills assigned yet." /></ListItem>
                              )}
                            </List>
                            {canAssignSkillOrTerritory() && (
                              <Stack direction="row" spacing={1}>
                                <TextField
                                  select
                                  size="small"
                                  label="Skill"
                                  value={selectedSkillId}
                                  onChange={(e) => setSelectedSkillId(e.target.value)}
                                  sx={{ minWidth: 140 }}
                                >
                                  {allSkills.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                  ))}
                                </TextField>
                                <Button size="small" variant="outlined" onClick={() => handleAssignSkill(u.id)}>
                                  Assign
                                </Button>
                              </Stack>
                            )}
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" gutterBottom>Territories</Typography>
                            <List dense>
                              {(territoriesByUser[u.id] || []).map((t) => (
                                <ListItem key={t.territoryId} disableGutters>
                                  <ListItemText primary={t.territoryName} />
                                </ListItem>
                              ))}
                              {(territoriesByUser[u.id] || []).length === 0 && (
                                <ListItem disableGutters><ListItemText primary="No territories assigned yet." /></ListItem>
                              )}
                            </List>
                            {canAssignSkillOrTerritory() && (
                              <Stack direction="row" spacing={1}>
                                <TextField
                                  select
                                  size="small"
                                  label="Territory"
                                  value={selectedTerritoryId}
                                  onChange={(e) => setSelectedTerritoryId(e.target.value)}
                                  sx={{ minWidth: 140 }}
                                >
                                  {allTerritories.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                  ))}
                                </TextField>
                                <Button size="small" variant="outlined" onClick={() => handleAssignTerritory(u.id)}>
                                  Assign
                                </Button>
                              </Stack>
                            )}
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" gutterBottom>Schedule</Typography>
                            <List dense>
                              {(scheduleByUser[u.id] || []).map((s) => (
                                <ListItem key={s.id} disableGutters>
                                  <ListItemText primary={`${s.day} — ${s.startTime} to ${s.endTime} (${s.type})`} />
                                </ListItem>
                              ))}
                              {(scheduleByUser[u.id] || []).length === 0 && (
                                <ListItem disableGutters><ListItemText primary="No shifts scheduled yet." /></ListItem>
                              )}
                            </List>
                            {canManageSchedule() && (
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1}>
                                  <TextField
                                    type="date" size="small" name="day"
                                    value={scheduleForm.day} onChange={handleScheduleChange}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  <TextField
                                    type="time" size="small" name="startTime"
                                    value={scheduleForm.startTime} onChange={handleScheduleChange}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  <TextField
                                    type="time" size="small" name="endTime"
                                    value={scheduleForm.endTime} onChange={handleScheduleChange}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  <TextField
                                    select size="small" name="type" label="Type"
                                    value={scheduleForm.type} onChange={handleScheduleChange}
                                    sx={{ minWidth: 140 }}
                                  >
                                    <MenuItem value="REGULAR">REGULAR</MenuItem>
                                    <MenuItem value="ON_CALL">ON_CALL</MenuItem>
                                    <MenuItem value="TIME_OFF">TIME_OFF</MenuItem>
                                  </TextField>
                                  <Button size="small" variant="outlined" onClick={() => handleAddSchedule(u.id)}>
                                    Add Shift
                                  </Button>
                                </Stack>
                              </Stack>
                            )}
                          </Grid>

                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
            {users.length === 0 && !loading && (
              <TableRow><TableCell colSpan={7}>No users yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UsersPage;