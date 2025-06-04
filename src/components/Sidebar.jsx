import React from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Package,
    Users,
    ListChecks,
    Bell,
    UserCircle,
    LogOut,
    Settings,
    Copy
} from 'lucide-react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSection, onSectionChange }) => {
    const navigate = useNavigate();
    const menuItems = [
        { id: 'landing', label: 'Landing Page', icon: <HomeIcon />, path: '/' },
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { id: 'submittals', label: 'Submittals', icon: <AssignmentIcon />, path: '/submittals' },
        { id: 'procurement', label: 'Procurement', icon: <ShoppingCartIcon />, path: '/procurement' },
        { id: 'projects', label: 'Projects', icon: <FolderIcon />, path: '/projects' },
    ];

    return (
        <Box
            sx={{
                width: 220,
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                bgcolor: '#343a40',
                color: 'white',
                '@media (max-width: 768px)': {
                    width: '100%',
                    position: 'relative',
                    height: 'auto',
                },
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    p: 2,
                    textAlign: 'center',
                    '@media (max-width: 768px)': {
                        display: 'none',
                    },
                }}
            >
                BuildQuip Menu
            </Typography>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                onSectionChange(item.id);
                                navigate(item.path);
                            }}
                            selected={activeSection === item.id}
                            sx={{
                                color: 'white',
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                },
                                '&:hover': {
                                    bgcolor: 'primary.main',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar; 