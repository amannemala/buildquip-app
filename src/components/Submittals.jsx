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
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const SUBMITTAL_STATUSES = [
    'EAN',
    'NEN',
    'R&R',
    'Closeout',
    'For Record',
    'Pending',
];

function Submittals() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [formRows, setFormRows] = useState([{
        projectName: '',
        specifications: '',
        titleProduct: '',
        materialId: '',
        vendorPartner: '',
        submittalManager: '',
        submittalStatus: '',
        dateReceived: '',
        dateSentDesign: '',
        dueDate: '',
        dateReviewReceived: '',
        dateIssuedSub: '',
        comments: '',
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
        const savedItems = JSON.parse(localStorage.getItem('submittalsItems') || '[]');
        const filteredItems = selectedProject ? savedItems.filter(item => item.projectName === selectedProject) : [];
        setTableRows(filteredItems);
        // Always show just one empty row for new entry
        setFormRows([{
            projectName: selectedProject,
            specifications: '',
            titleProduct: '',
            materialId: '',
            vendorPartner: '',
            submittalManager: '',
            submittalStatus: '',
            dateReceived: '',
            dateSentDesign: '',
            dueDate: '',
            dateReviewReceived: '',
            dateIssuedSub: '',
            comments: '',
        }]);
    }, [selectedProject]);

    const validateSpecifications = (value) => {
        return value.replace(/\D/g, '').slice(0, 8);
    };

    const addNewRow = () => {
        setFormRows([...formRows, {
            projectName: selectedProject,
            specifications: '',
            titleProduct: '',
            materialId: '',
            vendorPartner: '',
            submittalManager: '',
            submittalStatus: '',
            dateReceived: '',
            dateSentDesign: '',
            dueDate: '',
            dateReviewReceived: '',
            dateIssuedSub: '',
            comments: '',
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
                submittalManager: '',
                submittalStatus: '',
                dateReceived: '',
                dateSentDesign: '',
                dueDate: '',
                dateReviewReceived: '',
                dateIssuedSub: '',
                comments: '',
            },
        ]);
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
        // Save all submittals items for all projects
        const allItems = JSON.parse(localStorage.getItem('submittalsItems') || '[]');
        const otherItems = allItems.filter(item => item.projectName !== selectedProject);
        localStorage.setItem('submittalsItems', JSON.stringify([...otherItems, ...newTableRows]));
    };

    const submitAllItems = () => {
        const validRows = formRows.filter(row =>
            row.specifications &&
            row.titleProduct &&
            row.submittalManager &&
            row.submittalStatus &&
            row.dateReceived &&
            row.dueDate
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
        // Save all submittals items for all projects
        const allItems = JSON.parse(localStorage.getItem('submittalsItems') || '[]');
        const otherItems = allItems.filter(item => item.projectName !== selectedProject);
        localStorage.setItem('submittalsItems', JSON.stringify([...otherItems, ...newTableRows]));
        // Reset to a single empty row
        setFormRows([{
            projectName: selectedProject,
            specifications: '',
            titleProduct: '',
            materialId: '',
            vendorPartner: '',
            submittalManager: '',
            submittalStatus: '',
            dateReceived: '',
            dateSentDesign: '',
            dueDate: '',
            dateReviewReceived: '',
            dateIssuedSub: '',
            comments: '',
        }]);
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
                        Submittals
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
                            <TableCell>Submittal Manager</TableCell>
                            <TableCell>Submittal Status</TableCell>
                            <TableCell>Date Received</TableCell>
                            <TableCell>Date Sent to Design</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Date Review Received</TableCell>
                            <TableCell>Date Issued to Sub</TableCell>
                            <TableCell>Comments</TableCell>
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
                                        value={row.submittalManager}
                                        onChange={(e) => handleFormChange(index, 'submittalManager', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        select
                                        value={row.submittalStatus}
                                        onChange={(e) => handleFormChange(index, 'submittalStatus', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                    >
                                        <MenuItem value="">Select Status</MenuItem>
                                        {SUBMITTAL_STATUSES.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.dateReceived}
                                        onChange={(e) => handleFormChange(index, 'dateReceived', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.dateSentDesign}
                                        onChange={(e) => handleFormChange(index, 'dateSentDesign', e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.dueDate}
                                        onChange={(e) => handleFormChange(index, 'dueDate', e.target.value)}
                                        fullWidth
                                        size="small"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.dateReviewReceived}
                                        onChange={(e) => handleFormChange(index, 'dateReviewReceived', e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={row.dateIssuedSub}
                                        onChange={(e) => handleFormChange(index, 'dateIssuedSub', e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.comments}
                                        onChange={(e) => handleFormChange(index, 'comments', e.target.value)}
                                        fullWidth
                                        size="small"
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
                                    submittalManager: '',
                                    submittalStatus: '',
                                    dateReceived: '',
                                    dateSentDesign: '',
                                    dueDate: '',
                                    dateReviewReceived: '',
                                    dateIssuedSub: '',
                                    comments: '',
                                }
                            }]);
                        }}
                        sx={{ ml: 1 }}
                    >
                        Cancel Edit
                    </Button>
                )}
            </Box>

            <Typography variant="h5" gutterBottom>
                Submittals Log
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Specifications</TableCell>
                            <TableCell>Title/Product</TableCell>
                            <TableCell>Material ID</TableCell>
                            <TableCell>Vendor/Partner</TableCell>
                            <TableCell>Submittal Manager</TableCell>
                            <TableCell>Submittal Status</TableCell>
                            <TableCell>Date Received</TableCell>
                            <TableCell>Date Sent to Design</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Date Review Received</TableCell>
                            <TableCell>Date Issued to Sub</TableCell>
                            <TableCell>Comments</TableCell>
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
                                <TableCell>{row.submittalManager}</TableCell>
                                <TableCell>{row.submittalStatus}</TableCell>
                                <TableCell>{row.dateReceived}</TableCell>
                                <TableCell>{row.dateSentDesign}</TableCell>
                                <TableCell>{row.dueDate}</TableCell>
                                <TableCell>{row.dateReviewReceived}</TableCell>
                                <TableCell>{row.dateIssuedSub}</TableCell>
                                <TableCell>{row.comments}</TableCell>
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

export default Submittals; 