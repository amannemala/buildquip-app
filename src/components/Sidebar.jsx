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

const Sidebar = ({ activeSection, onSectionChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'submittals', label: 'Submittals', icon: Briefcase },
        { id: 'procurement', label: 'Procurement', icon: Package },
        { id: 'projects', label: 'Projects', icon: Users },
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
                            onClick={() => onSectionChange(item.id)}
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
                                {React.createElement(item.icon, { size: 20 })}
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