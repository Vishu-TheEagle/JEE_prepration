import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from './MainLayout'; // The student layout
import ParentLayout from './ParentLayout'; // The parent layout

interface RoleBasedLayoutProps {
    studentRoutes: React.ReactNode;
    parentRoutes: React.ReactNode;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ studentRoutes, parentRoutes }) => {
    const { user } = useAuth();

    if (user?.role === 'parent') {
        return (
            <ParentLayout>
                {parentRoutes}
            </ParentLayout>
        );
    }
    
    // Default to student layout
    return (
        <MainLayout>
            {studentRoutes}
        </MainLayout>
    );
};

export default RoleBasedLayout;
