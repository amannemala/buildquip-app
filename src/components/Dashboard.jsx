import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Menu,
    MenuItem,
    TextField,
    IconButton,
    Tooltip,
    Select,
    FormControl,
    InputLabel,
    Stack,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalProcurements: 0,
        totalSubmittals: 0,
        delayedItems: 0,
    });
    const [delayedItems, setDelayedItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        project: '',
        vendor: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    const calculateDaysUntilRequired = (requiredDate) => {
        const today = new Date();
        const required = new Date(requiredDate);
        const diffTime = required - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const loadData = () => {
        // Load data from localStorage
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const procurements = JSON.parse(localStorage.getItem('procurementItems') || '[]');
        const submittals = JSON.parse(localStorage.getItem('submittalsItems') || '[]');

        // Calculate delayed items and sort by required on-site date
        const delayed = procurements
            .filter(item => item.status === 'Delayed')
            .sort((a, b) => new Date(a.requiredOnsiteDate) - new Date(b.requiredOnsiteDate));

        setStats({
            totalProjects: projects.length,
            totalProcurements: procurements.length,
            totalSubmittals: submittals.length,
            delayedItems: delayed.length,
        });

        setDelayedItems(delayed);
        setFilteredItems(delayed);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Apply filters and search
        let filtered = [...delayedItems];

        // Apply search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.projectName.toLowerCase().includes(searchLower) ||
                item.specifications.toLowerCase().includes(searchLower) ||
                item.titleProduct.toLowerCase().includes(searchLower) ||
                item.materialId.toLowerCase().includes(searchLower) ||
                item.vendorPartner.toLowerCase().includes(searchLower)
            );
        }

        // Apply filters
        if (filters.project) {
            filtered = filtered.filter(item => item.projectName === filters.project);
        }
        if (filters.vendor) {
            filtered = filtered.filter(item => item.vendorPartner === filters.vendor);
        }

        setFilteredItems(filtered);
    }, [searchTerm, filters, delayedItems]);

    const handleActionClick = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleActionClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleAction = (action) => {
        if (action === 'markResolved') {
            // Update the item's status in localStorage
            const procurements = JSON.parse(localStorage.getItem('procurementItems') || '[]');
            const updatedProcurements = procurements.map(item =>
                item === selectedItem ? { ...item, status: 'Resolved' } : item
            );
            localStorage.setItem('procurementItems', JSON.stringify(updatedProcurements));
            loadData(); // Reload data to reflect changes
        } else {
            // This will be implemented later
            console.log(`Action ${action} for item:`, selectedItem);
        }
        handleActionClose();
    };

    const getUniqueValues = (field) => {
        return [...new Set(delayedItems.map(item => item[field]))].filter(Boolean);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Dashboard
                </Typography>
                <Tooltip title="Refresh Data">
                    <IconButton onClick={loadData} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Projects</Typography>
                        <Typography variant="h4">{stats.totalProjects}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Procurements</Typography>
                        <Typography variant="h4">{stats.totalProcurements}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Submittals</Typography>
                        <Typography variant="h4">{stats.totalSubmittals}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                        <Typography variant="h6">Delayed Items</Typography>
                        <Typography variant="h4">{stats.delayedItems}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'error.main' }}>
                    Alerts
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                        placeholder="Search alerts..."
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
                            <InputLabel>Project</InputLabel>
                            <Select
                                value={filters.project}
                                label="Project"
                                onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                            >
                                <MenuItem value="">All Projects</MenuItem>
                                {getUniqueValues('projectName').map(project => (
                                    <MenuItem key={project} value={project}>{project}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Vendor</InputLabel>
                            <Select
                                value={filters.vendor}
                                label="Vendor"
                                onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                            >
                                <MenuItem value="">All Vendors</MenuItem>
                                {getUniqueValues('vendorPartner').map(vendor => (
                                    <MenuItem key={vendor} value={vendor}>{vendor}</MenuItem>
                                ))}
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
                            <TableCell>Specifications</TableCell>
                            <TableCell>Title/Product</TableCell>
                            <TableCell>Material ID</TableCell>
                            <TableCell>Vendor/Partner</TableCell>
                            <TableCell>Required On-site Date</TableCell>
                            <TableCell>Days Until Required</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems.map((item, index) => {
                            const daysUntilRequired = calculateDaysUntilRequired(item.requiredOnsiteDate);
                            return (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'grey.100',
                                        }
                                    }}
                                >
                                    <TableCell sx={{ color: 'error.main' }}>{item.projectName}</TableCell>
                                    <TableCell sx={{ color: 'error.main' }}>{item.specifications}</TableCell>
                                    <TableCell sx={{ color: 'error.main' }}>{item.titleProduct}</TableCell>
                                    <TableCell sx={{ color: 'error.main' }}>{item.materialId}</TableCell>
                                    <TableCell sx={{ color: 'error.main' }}>{item.vendorPartner}</TableCell>
                                    <TableCell sx={{ color: 'error.main' }}>{item.requiredOnsiteDate}</TableCell>
                                    <TableCell sx={{
                                        color: daysUntilRequired <= 7 ? 'error.main' :
                                            daysUntilRequired <= 14 ? 'warning.main' :
                                                'error.main',
                                        fontWeight: 'bold'
                                    }}>
                                        {daysUntilRequired} days
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={(e) => handleActionClick(e, item)}
                                            endIcon={<MoreVertIcon />}
                                        >
                                            Take Action
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleActionClose}
            >
                <MenuItem onClick={() => handleAction('emailVendor')}>
                    Email Vendor
                </MenuItem>
                <MenuItem onClick={() => handleAction('emailTeam')}>
                    Send Email to Team
                </MenuItem>
                <MenuItem onClick={() => handleAction('textTeam')}>
                    Send Text Alert to Team
                </MenuItem>
                <MenuItem onClick={() => handleAction('textVendor')}>
                    Send Text to Vendor
                </MenuItem>
                <MenuItem onClick={() => handleAction('markResolved')}>
                    Mark as Resolved
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default Dashboard; 