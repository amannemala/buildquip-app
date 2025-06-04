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

        // If you want to show delayed items for all projects:
        // const delayed = procurements.filter(item => item.status === 'Delayed');
        // If you want to show delayed items for the selected project only:
        const projectProcurements = procurements.filter(item => item.projectName === selectedProject);
        const delayed = projectProcurements.filter(item => item.status === 'Delayed');

        const projectSubmittals = submittals.filter(item => item.projectName === selectedProject);

        setStats({
            totalProjects: 1,
            totalProcurements: projectProcurements.length,
            totalSubmittals: projectSubmittals.length,
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

        // Update the comment for the specific item in procurementItems
        const allItems = JSON.parse(localStorage.getItem('procurementItems') || '[]');
        const updatedItems = allItems.map(item => {
            // Use a unique identifier; fallback to matching by projectName, specifications, and titleProduct
            if (
                item.projectName === selectedItem.projectName &&
                item.specifications === selectedItem.specifications &&
                item.titleProduct === selectedItem.titleProduct
            ) {
                return {
                    ...item,
                    comments: [
                        ...(item.comments || []),
                        {
                            text: newComment,
                            timestamp: new Date().toISOString(),
                            user: 'Current User' // Replace with actual user if available
                        }
                    ]
                };
            }
            return item;
        });
        localStorage.setItem('procurementItems', JSON.stringify(updatedItems));
        setCommentDialogOpen(false);
        setNewComment('');
        loadData(); // Refresh dashboard data
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Risk Alerts
                    </Typography>
                </Box>
                {delayedItems.length === 0 ? (
                    <Typography color="textSecondary">No delayed items for this project.</Typography>
                ) : (
                    <List>
                        {delayedItems.map((item, index) => {
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
                                                {item.specifications && (
                                                    <Typography variant="body2" sx={{ ml: 2 }} color="text.secondary">
                                                        Spec ID: {item.specifications}
                                                    </Typography>
                                                )}
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
                )}
            </Paper>

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