import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    LinearProgress,
    Stack,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const PROJECT_STATUS_COLORS = {
    'Not Started': 'default',
    'In Progress': 'primary',
    'On Hold': 'warning',
    'Completed': 'success',
    'Delayed': 'error'
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

function Landing() {
    const [projects, setProjects] = useState([]);
    const [visibleProjects, setVisibleProjects] = useState([]);
    const [addProject, setAddProject] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        setProjects(savedProjects);
        const savedLanding = JSON.parse(localStorage.getItem('landingProjects') || 'null');
        if (Array.isArray(savedLanding)) {
            setVisibleProjects(savedLanding);
        } else {
            const allNames = savedProjects.map(p => p.name);
            setVisibleProjects(allNames);
            localStorage.setItem('landingProjects', JSON.stringify(allNames));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('landingProjects', JSON.stringify(visibleProjects));
    }, [visibleProjects]);

    const handleAddProject = () => {
        if (addProject && !visibleProjects.includes(addProject)) {
            setVisibleProjects([...visibleProjects, addProject]);
            setAddProject('');
        }
    };

    const handleRemove = (name) => {
        setVisibleProjects(prev => {
            const updated = prev.filter(n => n !== name);
            // If the removed project is the activeProject, update activeProject if needed
            const activeProject = JSON.parse(localStorage.getItem('activeProject') || 'null');
            if (activeProject === name) {
                if (updated.length > 0) {
                    localStorage.setItem('activeProject', JSON.stringify(updated[0]));
                }
                // If updated is empty, keep the previous activeProject
            }
            return updated;
        });
    };

    const hiddenProjects = projects.filter(p => !visibleProjects.includes(p.name));
    const shownProjects = projects.filter(p => visibleProjects.includes(p.name));

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ minWidth: 240, mr: 2 }} size="small">
                    <InputLabel>Add Project</InputLabel>
                    <Select
                        value={addProject}
                        label="Add Project"
                        onChange={e => setAddProject(e.target.value)}
                    >
                        {hiddenProjects.map(project => (
                            <MenuItem key={project.name} value={project.name}>{project.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    size="medium"
                    onClick={handleAddProject}
                    disabled={!addProject}
                >
                    Add
                </Button>
            </Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" gutterBottom>
                    Welcome, Ram!
                </Typography>
            </Box>
            <Typography variant="h5" gutterBottom>
                Your Projects
            </Typography>
            <Grid container spacing={3}>
                {shownProjects.map((project, index) => {
                    const isPastDue = new Date(project.endDate) < new Date();
                    return (
                        <Grid item xs={12} md={6} key={index}>
                            <Card
                                sx={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    border: isPastDue ? '2px solid' : 'none',
                                    borderColor: 'error.main'
                                }}
                                onClick={() => {
                                    localStorage.setItem('activeProject', JSON.stringify(project.name));
                                    navigate('/dashboard');
                                }}
                            >
                                <IconButton
                                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                    color="error"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleRemove(project.name);
                                    }}
                                >
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
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
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
            <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    size="large"
                    onClick={() => navigate('/projects')}
                >
                    Create New Project
                </Button>
            </Stack>
        </Box>
    );
}

export default Landing; 