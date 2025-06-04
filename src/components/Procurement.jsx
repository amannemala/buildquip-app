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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function Procurement() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [formRows, setFormRows] = useState([{
        projectName: '',
        specifications: '',
        titleProduct: '',
        materialId: '',
        vendorPartner: '',
        requiredOnsiteDate: '',
        leadTime: '',
        dropDeadDate: '',
        orderDate: '',
        status: '',
    }]);
    const [tableRows, setTableRows] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        // Load projects
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

    useEffect(() => {
        // Load saved items from localStorage for selected project
        const savedItems = JSON.parse(localStorage.getItem('procurementItems') || '[]');
        const filteredItems = selectedProject ? savedItems.filter(item => item.projectName === selectedProject) : [];
        setTableRows(filteredItems);
        // Always show just one empty row for new entry
        setFormRows([{
            projectName: selectedProject,
            specifications: '',
            titleProduct: '',
            materialId: '',
            vendorPartner: '',
            requiredOnsiteDate: '',
            leadTime: '',
            dropDeadDate: '',
            orderDate: '',
            status: '',
        }]);
    }, [selectedProject]);

    const validateSpecifications = (value) => {
        return value.replace(/\D/g, '').slice(0, 8);
    };

    const calculateDropDeadDate = (requiredDate, leadTime) => {
        if (!requiredDate || !leadTime) return '';
        const date = new Date(requiredDate);
        date.setDate(date.getDate() - (leadTime * 7));
        return date.toISOString().split('T')[0];
    };

    const updateStatus = (orderDate, dropDeadDate) => {
        if (!orderDate || !dropDeadDate) return '';
        const order = new Date(orderDate);
        const dead = new Date(dropDeadDate);
        const diffDays = Math.ceil((order - dead) / (1000 * 60 * 60 * 24));

        if (diffDays > 0) return 'Delayed';
        if (diffDays === 0) return 'On Time';
        return 'Early';
    };

    const addNewRow = () => {
        setFormRows([...formRows, {
            projectName: selectedProject,
            specifications: '',
            titleProduct: '',
            materialId: '',
            vendorPartner: '',
            requiredOnsiteDate: '',
            leadTime: '',
            dropDeadDate: '',
            orderDate: '',
            status: '',
        }]);
    };

    const removeRow = (index) => {
        setFormRows(formRows.filter((_, i) => i !== index));
    };

    const handleFormChange = (index, field, value) => {
        const newRows = [...formRows];
        newRows[index] = {
            ...newRows[index],
            [field]: value,
            projectName: selectedProject,
        };

        if (field === 'requiredOnsiteDate' || field === 'leadTime') {
            newRows[index].dropDeadDate = calculateDropDeadDate(
                newRows[index].requiredOnsiteDate,
                newRows[index].leadTime
            );
            // Update status when drop dead date changes
            if (newRows[index].orderDate) {
                newRows[index].status = updateStatus(
                    newRows[index].orderDate,
                    newRows[index].dropDeadDate
                );
            }
        }

        if (field === 'orderDate') {
            newRows[index].status = updateStatus(
                newRows[index].orderDate,
                newRows[index].dropDeadDate
            );
        }

        setFormRows(newRows);
    };

    const handleEdit = (index) => {
        const itemToEdit = tableRows[index];
        setFormRows([{ ...itemToEdit, projectName: selectedProject }]);
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        const newTableRows = tableRows.filter((_, i) => i !== index);
        setTableRows(newTableRows);
        localStorage.setItem('procurementItems', JSON.stringify(newTableRows));
    };

    const submitAllItems = () => {
        const validRows = formRows.filter(row =>
            row.specifications &&
            row.titleProduct &&
            row.requiredOnsiteDate &&
            row.leadTime &&
            row.orderDate
        );
        if (validRows.length === 0) return;
        let newTableRows;
        if (editingIndex !== null) {
            newTableRows = [...tableRows];
            newTableRows[editingIndex] = validRows[0];
            setEditingIndex(null);
        } else {
            newTableRows = [...tableRows, ...validRows];
        }
        setTableRows(newTableRows);
        // Save all procurement items for all projects
        const allItems = JSON.parse(localStorage.getItem('procurementItems') || '[]');
        const otherItems = allItems.filter(item => item.projectName !== selectedProject);
        localStorage.setItem('procurementItems', JSON.stringify([...otherItems, ...newTableRows]));
        // Reset to a single empty row
        setFormRows([{
            projectName: selectedProject,
            specifications: '',
            titleProduct: '',
            materialId: '',
            vendorPartner: '',
            requiredOnsiteDate: '',
            leadTime: '',
            dropDeadDate: '',
            orderDate: '',
            status: '',
        }]);
    };

    const addEmptyRow = () => {
        setFormRows([
            ...formRows,
            {
                projectName: selectedProject,
                specifications: '',
                titleProduct: '',
                materialId: '',
                vendorPartner: '',
                requiredOnsiteDate: '',
                leadTime: '',
                dropDeadDate: '',
                orderDate: '',
                status: '',
            },
        ]);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ minWidth: 240, mr: 2 }}>
                    <InputLabel>Select Project</InputLabel>
                    <Select
                        value={selectedProject}
                        label="Select Project"
                        onChange={e => setSelectedProject(e.target.value)}
                    >
                        {projects.map(project => (
                            <MenuItem key={project.name} value={project.name}>{project.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        Procurement
                    </Typography>
                </Box>
            </Box>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Specifications</TableCell>
                            <TableCell>Title/Product</TableCell>
                            <TableCell>Material ID</TableCell>
                            <TableCell>Vendor/Partner</TableCell>
                            <TableCell>Required On-site Date</TableCell>
                            <TableCell>Lead Time (weeks)</TableCell>
                            <TableCell>Drop Dead Date</TableCell>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formRows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        value={row.specifications}
                                        onChange={(e) => handleFormChange(index, 'specifications', validateSpecifications(e.target.value))}
                                        fullWidth
                                        size="small"
                                        inputProps={{ maxLength: 8 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.titleProduct}
                                        onChange={(e) => handleFormChange(index, 'titleProduct', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.materialId}
                                        onChange={(e) => handleFormChange(index, 'materialId', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.vendorPartner}
                                        onChange={(e) => handleFormChange(index, 'vendorPartner', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.requiredOnsiteDate}
                                        onChange={(e) => handleFormChange(index, 'requiredOnsiteDate', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={row.leadTime}
                                        onChange={(e) => handleFormChange(index, 'leadTime', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                        inputProps={{ min: 0, step: 1 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.dropDeadDate}
                                        fullWidth
                                        size="small"
                                        disabled
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.orderDate}
                                        onChange={(e) => handleFormChange(index, 'orderDate', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.status}
                                        fullWidth
                                        size="small"
                                        disabled
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                color: row.status === 'Delayed' ? 'error.main' :
                                                    row.status === 'On Time' ? 'success.main' :
                                                        row.status === 'Early' ? 'info.main' : 'inherit'
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => removeRow(index)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={addNewRow}
                    sx={{ mr: 1 }}
                >
                    Add Row
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={submitAllItems}
                >
                    {editingIndex !== null ? 'Update Item' : 'Submit All'}
                </Button>
                {editingIndex !== null && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setEditingIndex(null);
                            setFormRows([{
                                ...formRows[0], ...{
                                    specifications: '',
                                    titleProduct: '',
                                    materialId: '',
                                    vendorPartner: '',
                                    requiredOnsiteDate: '',
                                    leadTime: '',
                                    dropDeadDate: '',
                                    orderDate: '',
                                    status: '',
                                }
                            }]);
                        }}
                        sx={{ ml: 1 }}
                    >
                        Cancel Edit
                    </Button>
                )}
            </Box>
            <Button variant="outlined" onClick={addEmptyRow} sx={{ mb: 2 }}>
                Add Row
            </Button>
            <Typography variant="h5" gutterBottom>
                Procurement Log
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Specifications</TableCell>
                            <TableCell>Title/Product</TableCell>
                            <TableCell>Material ID</TableCell>
                            <TableCell>Vendor/Partner</TableCell>
                            <TableCell>Required On-site Date</TableCell>
                            <TableCell>Lead Time</TableCell>
                            <TableCell>Drop Dead Date</TableCell>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableRows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.specifications}</TableCell>
                                <TableCell>{row.titleProduct}</TableCell>
                                <TableCell>{row.materialId}</TableCell>
                                <TableCell>{row.vendorPartner}</TableCell>
                                <TableCell>{row.requiredOnsiteDate}</TableCell>
                                <TableCell>{row.leadTime}</TableCell>
                                <TableCell>{row.dropDeadDate}</TableCell>
                                <TableCell>{row.orderDate}</TableCell>
                                <TableCell
                                    sx={{
                                        color: row.status === 'Delayed' ? 'error.main' :
                                            row.status === 'On Time' ? 'success.main' :
                                                row.status === 'Early' ? 'info.main' : 'inherit'
                                    }}
                                >
                                    {row.status}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(index)} color="primary" sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(index)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default Procurement; 