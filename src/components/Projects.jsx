import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    IconButton,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import * as XLSX from 'xlsx';

const PROJECT_STATUSES = [
    'Not Started',
    'In Progress',
    'On Hold',
    'Completed',
    'Delayed'
];

const PROJECT_STATUS_COLORS = {
    'Not Started': 'default',
    'In Progress': 'primary',
    'On Hold': 'warning',
    'Completed': 'success',
    'Delayed': 'error'
};

function Projects() {
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        projectName: '',
        projectBudget: '',
        projectEndDate: '',
        projectStatus: 'Not Started',
        projectProgress: 0,
        materialListFile: null,
        materialListSheet: '',
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [teamDialogOpen, setTeamDialogOpen] = useState(false);
    const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [teamMembers, setTeamMembers] = useState({});
    const [documents, setDocuments] = useState({});
    const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '' });
    const [newDocument, setNewDocument] = useState({ name: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        progress: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filteredProjects, setFilteredProjects] = useState([]);

    useEffect(() => {
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const savedTeamMembers = JSON.parse(localStorage.getItem('projectTeamMembers') || '{}');
        const savedDocuments = JSON.parse(localStorage.getItem('projectDocuments') || '{}');
        setProjects(savedProjects);
        setTeamMembers(savedTeamMembers);
        setDocuments(savedDocuments);
        setFilteredProjects(savedProjects);
    }, []);

    useEffect(() => {
        // Apply filters and search
        let filtered = [...projects];

        // Apply search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchLower) ||
                project.budget.toString().includes(searchLower)
            );
        }

        // Apply status filter
        if (filters.status) {
            filtered = filtered.filter(project => project.status === filters.status);
        }

        // Apply progress filter
        if (filters.progress) {
            const progressValue = parseInt(filters.progress);
            filtered = filtered.filter(project => {
                const projectProgress = project.progress || 0;
                switch (progressValue) {
                    case 1: return projectProgress < 25;
                    case 2: return projectProgress >= 25 && projectProgress < 50;
                    case 3: return projectProgress >= 50 && projectProgress < 75;
                    case 4: return projectProgress >= 75;
                    default: return true;
                }
            });
        }

        setFilteredProjects(filtered);
    }, [searchTerm, filters, projects]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const processMaterialList = (rows) => {
        if (!rows || rows.length < 2) {
            alert('No data found');
            return;
        }

        const headers = rows[0].map(h => h.toLowerCase());
        const specIdx = headers.indexOf('specifications');
        const titleIdx = headers.indexOf('title/product');
        const matIdIdx = headers.indexOf('material id');
        const vendorIdx = headers.indexOf('vendor/partner');

        if (specIdx === -1 || titleIdx === -1 || matIdIdx === -1 || vendorIdx === -1) {
            alert('Missing required columns. Please ensure the CSV has: Specifications, Title/Product, Material ID, and Vendor/Partner columns.');
            return;
        }

        // Process rows and create items for both procurement and submittals
        const items = rows.slice(1).map(row => ({
            projectName: formData.projectName,
            specifications: row[specIdx]?.toString() || '',
            titleProduct: row[titleIdx]?.toString() || '',
            materialId: row[matIdIdx]?.toString() || '',
            vendorPartner: row[vendorIdx]?.toString() || '',
        }));

        // Save to localStorage for form rows in both components
        localStorage.setItem('procurementFormRows', JSON.stringify(items.map(item => ({
            ...item,
            requiredOnsiteDate: '',
            leadTime: '',
            dropDeadDate: '',
            orderDate: '',
            status: '',
        }))));

        localStorage.setItem('submittalsFormRows', JSON.stringify(items.map(item => ({
            ...item,
            submittalManager: '',
            submittalStatus: '',
            dateReceived: '',
            dateSentDesign: '',
            dueDate: '',
            dateReviewReceived: '',
            dateIssuedSub: '',
            comments: '',
        }))));

        // Navigate to procurement page
        window.location.href = '#/procurement';
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            processMaterialList(rows);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSheetLink = async () => {
        const url = formData.materialListSheet.trim();
        if (!url) return;

        try {
            const response = await fetch(url);
            const csv = await response.text();
            const rows = XLSX.utils.sheet_to_json(XLSX.read(csv, { type: 'string' }).Sheets.Sheet1, { header: 1 });
            processMaterialList(rows);
        } catch (error) {
            alert('Failed to fetch Google Sheet. Make sure it is published as CSV.');
        }
    };

    const handleEdit = (index) => {
        const projectToEdit = projects[index];
        setFormData({
            projectName: projectToEdit.name,
            projectBudget: projectToEdit.budget,
            projectEndDate: projectToEdit.endDate,
            projectStatus: projectToEdit.status || 'Not Started',
            projectProgress: projectToEdit.progress || 0,
            materialListFile: null,
            materialListSheet: '',
        });
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        const updatedProjects = projects.filter((_, i) => i !== index);
        setProjects(updatedProjects);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
    };

    const addProject = () => {
        const { projectName, projectBudget, projectEndDate, projectStatus, projectProgress } = formData;
        if (!projectName || !projectBudget || !projectEndDate) {
            alert('Please fill all required fields');
            return;
        }

        const newProject = {
            name: projectName,
            budget: projectBudget,
            endDate: projectEndDate,
            status: projectStatus,
            progress: projectProgress,
        };

        let updatedProjects;
        if (editingIndex !== null) {
            updatedProjects = [...projects];
            updatedProjects[editingIndex] = newProject;
            setEditingIndex(null);
        } else {
            updatedProjects = [...projects, newProject];
        }

        setProjects(updatedProjects);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));

        setFormData({
            projectName: '',
            projectBudget: '',
            projectEndDate: '',
            projectStatus: 'Not Started',
            projectProgress: 0,
            materialListFile: null,
            materialListSheet: '',
        });
    };

    const handleTeamDialogOpen = (project) => {
        setSelectedProject(project);
        setTeamDialogOpen(true);
    };

    const handleDocumentsDialogOpen = (project) => {
        setSelectedProject(project);
        setDocumentsDialogOpen(true);
    };

    const addTeamMember = () => {
        if (!newTeamMember.name || !newTeamMember.role) return;

        const updatedTeamMembers = {
            ...teamMembers,
            [selectedProject.name]: [
                ...(teamMembers[selectedProject.name] || []),
                newTeamMember
            ]
        };

        setTeamMembers(updatedTeamMembers);
        localStorage.setItem('projectTeamMembers', JSON.stringify(updatedTeamMembers));
        setNewTeamMember({ name: '', role: '' });
    };

    const addDocument = () => {
        if (!newDocument.name || !newDocument.type) return;

        const updatedDocuments = {
            ...documents,
            [selectedProject.name]: [
                ...(documents[selectedProject.name] || []),
                newDocument
            ]
        };

        setDocuments(updatedDocuments);
        localStorage.setItem('projectDocuments', JSON.stringify(updatedDocuments));
        setNewDocument({ name: '', type: '' });
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Projects
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {editingIndex !== null ? 'Edit Project' : 'Add New Project'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Project Name"
                        value={formData.projectName}
                        onChange={(e) => handleInputChange('projectName', e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Project Budget"
                        type="number"
                        value={formData.projectBudget}
                        onChange={(e) => handleInputChange('projectBudget', e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Target End Date"
                        type="date"
                        value={formData.projectEndDate}
                        onChange={(e) => handleInputChange('projectEndDate', e.target.value)}
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Project Status</InputLabel>
                        <Select
                            value={formData.projectStatus}
                            label="Project Status"
                            onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                        >
                            {PROJECT_STATUSES.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box>
                        <Typography gutterBottom>Project Progress</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <LinearProgress
                                variant="determinate"
                                value={formData.projectProgress}
                                sx={{ flexGrow: 1 }}
                            />
                            <TextField
                                type="number"
                                value={formData.projectProgress}
                                onChange={(e) => handleInputChange('projectProgress', Math.min(100, Math.max(0, Number(e.target.value))))}
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ width: 80 }}
                            />
                        </Stack>
                    </Box>
                    <TextField
                        label="Upload Material List (CSV/Excel)"
                        type="file"
                        onChange={handleFileUpload}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                            accept: '.csv,.xlsx,.xls'
                        }}
                    />
                    <TextField
                        label="Paste Google Sheets CSV link"
                        value={formData.materialListSheet}
                        onChange={(e) => handleInputChange('materialListSheet', e.target.value)}
                        onBlur={handleSheetLink}
                        fullWidth
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={addProject}
                        >
                            {editingIndex !== null ? 'Update Project' : 'Add Project'}
                        </Button>
                        {editingIndex !== null && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    setEditingIndex(null);
                                    setFormData({
                                        projectName: '',
                                        projectBudget: '',
                                        projectEndDate: '',
                                        projectStatus: 'Not Started',
                                        projectProgress: 0,
                                        materialListFile: null,
                                        materialListSheet: '',
                                    });
                                }}
                            >
                                Cancel Edit
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Projects List
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                </Stack>

                {showFilters && (
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                {PROJECT_STATUSES.map(status => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Progress</InputLabel>
                            <Select
                                value={filters.progress}
                                label="Progress"
                                onChange={(e) => setFilters({ ...filters, progress: e.target.value })}
                            >
                                <MenuItem value="">All Progress</MenuItem>
                                <MenuItem value="1">Less than 25%</MenuItem>
                                <MenuItem value="2">25% - 49%</MenuItem>
                                <MenuItem value="3">50% - 74%</MenuItem>
                                <MenuItem value="4">75% or more</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Budget</TableCell>
                            <TableCell>Target End Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProjects.map((project, index) => (
                            <TableRow key={index}>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>${project.budget}</TableCell>
                                <TableCell>{project.endDate}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={project.status || 'Not Started'}
                                        color={PROJECT_STATUS_COLORS[project.status || 'Not Started']}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={project.progress || 0}
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <Typography variant="body2">
                                            {project.progress || 0}%
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton onClick={() => handleEdit(index)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleTeamDialogOpen(project)} color="primary">
                                            <PersonAddIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDocumentsDialogOpen(project)} color="primary">
                                            <AttachFileIcon />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Team Members Dialog */}
            <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Team Members - {selectedProject?.name}
                </DialogTitle>
                <DialogContent>
                    <List>
                        {(teamMembers[selectedProject?.name] || []).map((member, index) => (
                            <ListItem key={index}>
                                <ListItemAvatar>
                                    <Avatar>{member.name[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={member.name}
                                    secondary={member.role}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Name"
                            value={newTeamMember.name}
                            onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                            size="small"
                        />
                        <TextField
                            label="Role"
                            value={newTeamMember.role}
                            onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={addTeamMember}
                            startIcon={<PersonAddIcon />}
                        >
                            Add
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTeamDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Documents Dialog */}
            <Dialog open={documentsDialogOpen} onClose={() => setDocumentsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Project Documents - {selectedProject?.name}
                </DialogTitle>
                <DialogContent>
                    <List>
                        {(documents[selectedProject?.name] || []).map((doc, index) => (
                            <ListItem key={index}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <AttachFileIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={doc.name}
                                    secondary={doc.type}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Document Name"
                            value={newDocument.name}
                            onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                            size="small"
                        />
                        <TextField
                            label="Document Type"
                            value={newDocument.type}
                            onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={addDocument}
                            startIcon={<AttachFileIcon />}
                        >
                            Add
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDocumentsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Projects; 