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
    Grid,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import MapIcon from '@mui/icons-material/Map';
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

// Add validation constants
const VALIDATION_RULES = {
    MIN_BUDGET: 1000,
    MAX_BUDGET: 1000000000,
    MAX_PROJECT_NAME_LENGTH: 100,
    MAX_AREA_NAME_LENGTH: 50,
    MAX_DOCUMENT_SIZE_MB: 10,
    MAX_TEAM_MEMBERS: 20,
    MAX_AREAS: 50,
};

function formatCurrency(value) {
    if (!value) return '';
    const number = Number(value.toString().replace(/[^\d]/g, ''));
    if (isNaN(number)) return '';
    return '$' + number.toLocaleString();
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
}

// Add validation functions
function validateProjectName(name, existingProjects) {
    if (!name || name.trim().length === 0) {
        return 'Project name is required';
    }
    if (name.length > VALIDATION_RULES.MAX_PROJECT_NAME_LENGTH) {
        return `Project name must be less than ${VALIDATION_RULES.MAX_PROJECT_NAME_LENGTH} characters`;
    }
    if (existingProjects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        return 'Project name already exists';
    }
    return null;
}

function validateBudget(budget) {
    const numBudget = Number(budget.toString().replace(/[^\d]/g, ''));
    if (isNaN(numBudget)) {
        return 'Budget must be a valid number';
    }
    if (numBudget < VALIDATION_RULES.MIN_BUDGET) {
        return `Budget must be at least $${VALIDATION_RULES.MIN_BUDGET.toLocaleString()}`;
    }
    if (numBudget > VALIDATION_RULES.MAX_BUDGET) {
        return `Budget cannot exceed $${VALIDATION_RULES.MAX_BUDGET.toLocaleString()}`;
    }
    return null;
}

function validateEndDate(date, isNewProject = true) {
    if (!date) {
        return 'Target end date is required';
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNewProject && selectedDate < today) {
        return 'Target end date cannot be in the past for new projects';
    }
    return null;
}

function validateProgress(progress, status) {
    const numProgress = Number(progress);
    if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
        return 'Progress must be between 0 and 100';
    }
    if (status === 'Completed' && numProgress !== 100) {
        return 'Completed projects must have 100% progress';
    }
    if (status === 'Not Started' && numProgress !== 0) {
        return 'Not started projects must have 0% progress';
    }
    return null;
}

function validateTeamMember(member, existingMembers) {
    if (!member.name || !member.role) {
        return 'Name and role are required';
    }
    if (existingMembers.some(m => m.name.toLowerCase() === member.name.toLowerCase())) {
        return 'Team member already exists';
    }
    return null;
}

function validateDocument(doc, existingDocs) {
    if (!doc.name || !doc.type) {
        return 'Document name and type are required';
    }
    if (existingDocs.some(d => d.name.toLowerCase() === doc.name.toLowerCase())) {
        return 'Document already exists';
    }
    return null;
}

function validateArea(area, existingAreas) {
    if (!area.name || area.name.trim().length === 0) {
        return 'Area name is required';
    }
    if (area.name.length > VALIDATION_RULES.MAX_AREA_NAME_LENGTH) {
        return `Area name must be less than ${VALIDATION_RULES.MAX_AREA_NAME_LENGTH} characters`;
    }
    if (existingAreas.some(a => a.name.toLowerCase() === area.name.toLowerCase())) {
        return 'Area name already exists';
    }
    return null;
}

function validateFileSize(file) {
    if (!file) return null;
    const maxSize = VALIDATION_RULES.MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
    if (file.size > maxSize) {
        return `File size must be less than ${VALIDATION_RULES.MAX_DOCUMENT_SIZE_MB}MB`;
    }
    return null;
}

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
    const [projectBreakdown, setProjectBreakdown] = useState({});
    const [keyplanDialogOpen, setKeyplanDialogOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [newArea, setNewArea] = useState({ name: '', description: '' });
    const [newKeyplan, setNewKeyplan] = useState({ name: '', file: null });
    const [errors, setErrors] = useState({});
    const [validationMessages, setValidationMessages] = useState({});

    useEffect(() => {
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const savedTeamMembers = JSON.parse(localStorage.getItem('projectTeamMembers') || '{}');
        const savedDocuments = JSON.parse(localStorage.getItem('projectDocuments') || '{}');
        const savedProjectBreakdown = JSON.parse(localStorage.getItem('projectBreakdown') || '{}');
        setProjects(savedProjects);
        setTeamMembers(savedTeamMembers);
        setDocuments(savedDocuments);
        setProjectBreakdown(savedProjectBreakdown);
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
        let error = null;

        if (field === 'projectBudget') {
            const number = value.replace(/[^\d]/g, '');
            setFormData(prev => ({
                ...prev,
                [field]: number
            }));
            error = validateBudget(number);
        } else if (field === 'projectEndDate') {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            error = validateEndDate(value, editingIndex === null);
        } else if (field === 'projectProgress') {
            const progress = Math.min(100, Math.max(0, Number(value)));
            setFormData(prev => ({
                ...prev,
                [field]: progress
            }));
            error = validateProgress(progress, formData.projectStatus);
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
            if (field === 'projectName') {
                error = validateProjectName(value, projects);
            }
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
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
        const validations = {
            projectName: validateProjectName(formData.projectName, projects),
            projectBudget: validateBudget(formData.projectBudget),
            projectEndDate: validateEndDate(formData.projectEndDate, editingIndex === null),
            projectProgress: validateProgress(formData.projectProgress, formData.projectStatus)
        };

        setErrors(validations);

        if (Object.values(validations).some(error => error !== null)) {
            return;
        }

        const newProject = {
            name: formData.projectName,
            budget: formData.projectBudget,
            endDate: formData.projectEndDate,
            status: formData.projectStatus,
            progress: formData.projectProgress,
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
        setErrors({});
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
        const existingMembers = teamMembers[selectedProject.name] || [];
        if (existingMembers.length >= VALIDATION_RULES.MAX_TEAM_MEMBERS) {
            setValidationMessages(prev => ({
                ...prev,
                teamMember: `Maximum ${VALIDATION_RULES.MAX_TEAM_MEMBERS} team members allowed`
            }));
            return;
        }

        const error = validateTeamMember(newTeamMember, existingMembers);
        if (error) {
            setValidationMessages(prev => ({
                ...prev,
                teamMember: error
            }));
            return;
        }

        const updatedTeamMembers = {
            ...teamMembers,
            [selectedProject.name]: [
                ...existingMembers,
                newTeamMember
            ]
        };

        setTeamMembers(updatedTeamMembers);
        localStorage.setItem('projectTeamMembers', JSON.stringify(updatedTeamMembers));
        setNewTeamMember({ name: '', role: '' });
        setValidationMessages(prev => ({ ...prev, teamMember: null }));
    };

    const addDocument = () => {
        const existingDocs = documents[selectedProject.name] || [];
        const error = validateDocument(newDocument, existingDocs);
        if (error) {
            setValidationMessages(prev => ({
                ...prev,
                document: error
            }));
            return;
        }

        const updatedDocuments = {
            ...documents,
            [selectedProject.name]: [
                ...existingDocs,
                newDocument
            ]
        };

        setDocuments(updatedDocuments);
        localStorage.setItem('projectDocuments', JSON.stringify(updatedDocuments));
        setNewDocument({ name: '', type: '' });
        setValidationMessages(prev => ({ ...prev, document: null }));
    };

    const handleAddArea = () => {
        const existingAreas = projectBreakdown[selectedProject.name] || [];
        if (existingAreas.length >= VALIDATION_RULES.MAX_AREAS) {
            setValidationMessages(prev => ({
                ...prev,
                area: `Maximum ${VALIDATION_RULES.MAX_AREAS} areas allowed per project`
            }));
            return;
        }

        const error = validateArea(newArea, existingAreas);
        if (error) {
            setValidationMessages(prev => ({
                ...prev,
                area: error
            }));
            return;
        }

        const updatedBreakdown = {
            ...projectBreakdown,
            [selectedProject.name]: [
                ...existingAreas,
                {
                    id: Date.now(),
                    ...newArea,
                    materials: []
                }
            ]
        };

        setProjectBreakdown(updatedBreakdown);
        localStorage.setItem('projectBreakdown', JSON.stringify(updatedBreakdown));
        setNewArea({ name: '', description: '' });
        setValidationMessages(prev => ({ ...prev, area: null }));
    };

    const handleKeyplanUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const error = validateFileSize(file);
        if (error) {
            setValidationMessages(prev => ({
                ...prev,
                keyplan: error
            }));
            return;
        }

        const updatedBreakdown = {
            ...projectBreakdown,
            [selectedProject.name]: (projectBreakdown[selectedProject.name] || []).map(area =>
                area.id === selectedArea.id
                    ? { ...area, keyplan: { name: file.name, file: URL.createObjectURL(file) } }
                    : area
            )
        };

        setProjectBreakdown(updatedBreakdown);
        localStorage.setItem('projectBreakdown', JSON.stringify(updatedBreakdown));
        setValidationMessages(prev => ({ ...prev, keyplan: null }));
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
                        error={!!errors.projectName}
                        helperText={errors.projectName}
                    />
                    <TextField
                        label="Project Budget"
                        type="text"
                        value={formatCurrency(formData.projectBudget)}
                        onChange={(e) => handleInputChange('projectBudget', e.target.value)}
                        required
                        fullWidth
                        error={!!errors.projectBudget}
                        helperText={errors.projectBudget}
                    />
                    <TextField
                        label="Target End Date"
                        type="date"
                        value={formData.projectEndDate}
                        onChange={(e) => handleInputChange('projectEndDate', e.target.value)}
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.projectEndDate}
                        helperText={errors.projectEndDate}
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

            <Grid container spacing={3}>
                {filteredProjects.map((project, index) => {
                    const isPastDue = new Date(project.endDate) < new Date();
                    return (
                        <Grid item xs={12} md={6} key={index}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {project.name}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        Budget: {formatCurrency(project.budget)}
                                    </Typography>
                                    <Typography
                                        color={isPastDue ? "error" : "textSecondary"}
                                        gutterBottom
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        Target End Date: {formatDisplayDate(project.endDate)}
                                        {isPastDue && (
                                            <Chip
                                                label="Past Due"
                                                color="error"
                                                size="small"
                                            />
                                        )}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Chip
                                            label={project.status || 'Not Started'}
                                            color={PROJECT_STATUS_COLORS[project.status || 'Not Started']}
                                            size="small"
                                        />
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            Progress
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={project.progress || 0}
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="body2">
                                            {project.progress || 0}%
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Project Areas
                                    </Typography>
                                    <List dense>
                                        {(projectBreakdown[project.name] || []).map((area) => (
                                            <ListItem
                                                key={area.id}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => {
                                                            setSelectedArea(area);
                                                            setKeyplanDialogOpen(true);
                                                        }}
                                                    >
                                                        <MapIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    primary={area.name}
                                                    secondary={area.description}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => {
                                            setSelectedProject(project);
                                            setTeamDialogOpen(true);
                                        }}
                                    >
                                        Add Area
                                    </Button>
                                    <IconButton onClick={() => handleEdit(index)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(index)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Team Members Dialog */}
            <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Team Members - {selectedProject?.name}
                </DialogTitle>
                <DialogContent>
                    {validationMessages.teamMember && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {validationMessages.teamMember}
                        </Typography>
                    )}
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

            {/* Keyplan Dialog */}
            <Dialog
                open={keyplanDialogOpen}
                onClose={() => setKeyplanDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Keyplan - {selectedArea?.name}
                </DialogTitle>
                <DialogContent>
                    {selectedArea?.keyplan ? (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Current Keyplan: {selectedArea.keyplan.name}
                            </Typography>
                            <img
                                src={selectedArea.keyplan.file}
                                alt="Keyplan"
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </Box>
                    ) : (
                        <Typography>No keyplan uploaded yet</Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            type="file"
                            label="Upload Keyplan"
                            onChange={handleKeyplanUpload}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                accept: 'image/*,.pdf'
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setKeyplanDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add Area Dialog */}
            <Dialog
                open={teamDialogOpen}
                onClose={() => setTeamDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Add Project Area - {selectedProject?.name}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                            label="Area Name"
                            value={newArea.name}
                            onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={newArea.description}
                            onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddArea} variant="contained">
                        Add Area
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Projects; 