import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    LinearProgress,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Menu,
    MenuItem,
    Tooltip,
    Divider,
    Drawer,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import CommentIcon from '@mui/icons-material/Comment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import CircleIcon from '@mui/icons-material/Circle';
import AddIcon from '@mui/icons-material/Add';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalProcurements: 0,
        totalSubmittals: 0,
        delayedItems: 0,
    });
    const [delayedItems, setDelayedItems] = useState([]);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [selectedItemForAction, setSelectedItemForAction] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');

    useEffect(() => {
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        setProjects(savedProjects);
        const activeProject = JSON.parse(localStorage.getItem('activeProject') || 'null');
        if (activeProject && savedProjects.some(p => p.name === activeProject)) {
            setSelectedProject(activeProject);
        } else if (savedProjects.length > 0) {
            setSelectedProject(savedProjects[0].name);
        }
    }, []);

    useEffect(() => {
        if (selectedProject) {
            localStorage.setItem('activeProject', JSON.stringify(selectedProject));
        }
    }, [selectedProject]);

    const loadData = () => {
        // Load projects from localStorage
        const projectsData = JSON.parse(localStorage.getItem('projects') || '[]');
        setProjects(projectsData);

        const procurements = JSON.parse(localStorage.getItem('procurementItems') || '[]');
        const submittals = JSON.parse(localStorage.getItem('submittalsItems') || '[]');

        // Only use selectedProject for filtering
        console.log('Dashboard - selectedProject:', selectedProject);
        const selectedProcurements = procurements.filter(item =>
            item.projectName === selectedProject
        );
        console.log('Dashboard - selectedProcurements:', selectedProcurements);

        const delayed = selectedProcurements.filter(item => {
            if (!item.requiredOnsiteDate || !item.orderDate) return false;
            const requiredDate = new Date(item.requiredOnsiteDate);
            const orderDate = new Date(item.orderDate);
            const daysUntilRequired = Math.ceil((requiredDate - orderDate) / (1000 * 60 * 60 * 24));
            return daysUntilRequired < 30;
        });
        console.log('Dashboard - delayed:', delayed);

        setStats({
            totalProjects: projectsData.length,
            totalProcurements: procurements.length,
            totalSubmittals: submittals.length,
            delayedItems: delayed.length,
        });

        setDelayedItems(delayed);
    };

    useEffect(() => {
        loadData();
    }, [selectedProject]);

    const getProjectStatus = (project) => {
        return project.status || 'Not Started';
    };

    const getProjectStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'In Progress': return 'primary';
            case 'On Hold': return 'warning';
            case 'Delayed': return 'error';
            default: return 'default';
        }
    };

    const handleProjectToggle = (projectName) => {
        const newSelectedProjects = selectedProjects.includes(projectName)
            ? selectedProjects.filter(p => p !== projectName)
            : [...selectedProjects, projectName];

        setSelectedProjects(newSelectedProjects);
        localStorage.setItem('selectedProjects', JSON.stringify(newSelectedProjects));

        // Update delayed items based on selected projects
        const procurements = JSON.parse(localStorage.getItem('procurements') || '[]');
        const selectedProcurements = procurements.filter(item =>
            newSelectedProjects.includes(item.projectName)
        );

        const delayed = selectedProcurements.filter(item => {
            if (!item.requiredOnsiteDate || !item.orderDate) return false;
            const requiredDate = new Date(item.requiredOnsiteDate);
            const orderDate = new Date(item.orderDate);
            const daysUntilRequired = Math.ceil((requiredDate - orderDate) / (1000 * 60 * 60 * 24));
            return daysUntilRequired < 30;
        });

        setDelayedItems(delayed);
    };

    const groupItemsByProject = (items) => {
        return items.reduce((groups, item) => {
            const project = item.projectName;
            if (!groups[project]) {
                groups[project] = [];
            }
            groups[project].push(item);
            return groups;
        }, {});
    };

    const getRiskLevel = (item) => {
        if (!item.requiredOnsiteDate || !item.orderDate) return 'unknown';
        const requiredDate = new Date(item.requiredOnsiteDate);
        const orderDate = new Date(item.orderDate);
        const daysUntilRequired = Math.ceil((requiredDate - orderDate) / (1000 * 60 * 60 * 24));

        if (daysUntilRequired > 30) return 'low';
        if (daysUntilRequired === 30) return 'medium';
        return 'high';
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'error';
            default: return 'default';
        }
    };

    const handleCommentSubmit = () => {
        if (!selectedItem || !newComment) return;

        const updatedItems = delayedItems.map(item => {
            if (item.id === selectedItem.id) {
                return {
                    ...item,
                    comments: [
                        ...(item.comments || []),
                        {
                            text: newComment,
                            timestamp: new Date().toISOString(),
                            user: 'Current User' // Replace with actual user
                        }
                    ]
                };
            }
            return item;
        });

        setDelayedItems(updatedItems);
        localStorage.setItem('procurements', JSON.stringify(updatedItems));
        setCommentDialogOpen(false);
        setNewComment('');
    };

    const handleActionClick = (event, item) => {
        setActionMenuAnchor(event.currentTarget);
        setSelectedItemForAction(item);
    };

    const handleActionClose = () => {
        setActionMenuAnchor(null);
        setSelectedItemForAction(null);
    };

    const handleActionSelect = (action) => {
        // Implement action handlers here
        console.log(`Action ${action} selected for item:`, selectedItemForAction);
        handleActionClose();
    };

    const handleAddProject = (projectName) => {
        if (!selectedProjects.includes(projectName)) {
            const newSelectedProjects = [...selectedProjects, projectName];
            setSelectedProjects(newSelectedProjects);
            localStorage.setItem('selectedProjects', JSON.stringify(newSelectedProjects));

            // Load procurements for the newly added project
            const procurements = JSON.parse(localStorage.getItem('procurements') || '[]');
            const projectProcurements = procurements.filter(item => item.projectName === projectName);

            // Update delayed items
            const delayed = projectProcurements.filter(item => {
                if (!item.requiredOnsiteDate || !item.orderDate) return false;
                const requiredDate = new Date(item.requiredOnsiteDate);
                const orderDate = new Date(item.orderDate);
                const daysUntilRequired = Math.ceil((requiredDate - orderDate) / (1000 * 60 * 60 * 24));
                return daysUntilRequired < 30;
            });

            setDelayedItems(prev => [...prev, ...delayed]);
        }
        setAddProjectDialogOpen(false);
    };

    const handleRemoveProject = (projectName) => {
        const newSelectedProjects = selectedProjects.filter(p => p !== projectName);
        setSelectedProjects(newSelectedProjects);
        localStorage.setItem('selectedProjects', JSON.stringify(newSelectedProjects));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {selectedProject && (
                    <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        {selectedProject}
                    </Typography>
                )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Dashboard
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Tooltip title="Project Filter">
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton onClick={loadData}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                        <Typography color="textSecondary" gutterBottom>
                            Total Projects
                        </Typography>
                        <Typography variant="h4">
                            {stats.totalProjects}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                        <Typography color="textSecondary" gutterBottom>
                            Total Procurements
                        </Typography>
                        <Typography variant="h4">
                            {stats.totalProcurements}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                        <Typography color="textSecondary" gutterBottom>
                            Total Submittals
                        </Typography>
                        <Typography variant="h4">
                            {stats.totalSubmittals}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                        <Typography color="error.contrastText" gutterBottom>
                            Delayed Items
                        </Typography>
                        <Typography variant="h4" color="error.contrastText">
                            {stats.delayedItems}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Risk Alerts
                    </Typography>
                    <Tooltip title="Add Project">
                        <IconButton onClick={() => setAddProjectDialogOpen(true)}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {Object.entries(groupItemsByProject(delayedItems.filter(item =>
                    selectedProjects.includes(item.projectName)
                ))).map(([projectName, items]) => (
                    <Box key={projectName} sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                {projectName}
                            </Typography>
                            <Tooltip title="Remove Project">
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveProject(projectName)}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <List>
                            {items.map((item, index) => {
                                const riskLevel = getRiskLevel(item);
                                return (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            bgcolor: riskLevel === 'high' ? 'error.light' : 'background.paper',
                                            mb: 1,
                                            borderRadius: 1,
                                        }}
                                        secondaryAction={
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Add Comment">
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setCommentDialogOpen(true);
                                                        }}
                                                    >
                                                        <CommentIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton
                                                    edge="end"
                                                    onClick={(e) => handleActionClick(e, item)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Stack>
                                        }
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1">
                                                        {item.titleProduct}
                                                    </Typography>
                                                    <Chip
                                                        label={riskLevel.toUpperCase()}
                                                        color={getRiskColor(riskLevel)}
                                                        size="small"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2">
                                                        Required On-site: {item.requiredOnsiteDate}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Vendor: {item.vendorPartner}
                                                    </Typography>
                                                    {item.comments && item.comments.length > 0 && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Latest Comment: {item.comments[item.comments.length - 1].text}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                ))}
            </Paper>

            {/* Project Filter Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: 300, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Project Filter
                    </Typography>
                    <List>
                        {projects.map((project) => {
                            const status = getProjectStatus(project);
                            const isSelected = selectedProjects.includes(project.name);
                            return (
                                <ListItem key={project.name} disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={isSelected}
                                                onChange={() => handleProjectToggle(project.name)}
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={project.name} />
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                icon={<CircleIcon />}
                                                label={status}
                                                color={getProjectStatusColor(status)}
                                                size="small"
                                            />
                                        </Stack>
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            </Drawer>

            {/* Add Project Dialog */}
            <Dialog
                open={addProjectDialogOpen}
                onClose={() => setAddProjectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Project to Dashboard</DialogTitle>
                <DialogContent>
                    <List>
                        {projects
                            .filter(project => !selectedProjects.includes(project.name))
                            .map((project) => {
                                console.log('Available project for dialog:', project);
                                const status = getProjectStatus(project);
                                return (
                                    <ListItem
                                        key={project.name}
                                        secondaryAction={
                                            <Tooltip title="Add Project">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleAddProject(project.name)}
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    >
                                        <ListItemText
                                            primary={project.name}
                                            secondary={
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip
                                                        icon={<CircleIcon />}
                                                        label={status}
                                                        color={getProjectStatusColor(status)}
                                                        size="small"
                                                    />
                                                    {project.progress !== undefined && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Progress: {project.progress}%
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddProjectDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Comment Dialog */}
            <Dialog
                open={commentDialogOpen}
                onClose={() => setCommentDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Add Comment - {selectedItem?.titleProduct}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCommentSubmit} variant="contained">
                        Add Comment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleActionClose}
            >
                <MenuItem onClick={() => handleActionSelect('email_vendor')}>
                    <EmailIcon sx={{ mr: 1 }} /> Email Vendor
                </MenuItem>
                <MenuItem onClick={() => handleActionSelect('email_team')}>
                    <EmailIcon sx={{ mr: 1 }} /> Email Team
                </MenuItem>
                <MenuItem onClick={() => handleActionSelect('text_team')}>
                    <SmsIcon sx={{ mr: 1 }} /> Text Team
                </MenuItem>
                <MenuItem onClick={() => handleActionSelect('text_vendor')}>
                    <SmsIcon sx={{ mr: 1 }} /> Text Vendor
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleActionSelect('mark_resolved')}>
                    <NotificationsIcon sx={{ mr: 1 }} /> Mark as Resolved
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default Dashboard; 