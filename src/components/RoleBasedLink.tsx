
import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RoleBasedLinkProps extends Omit<NavLinkProps, 'to'> {
  adminPath: string;
  providerPath?: string;
  supervisorPath?: string;
  employeePath?: string;
}

const RoleBasedLink: React.FC<RoleBasedLinkProps> = ({
  adminPath,
  providerPath,
  supervisorPath,
  employeePath,
  children,
  ...props
}) => {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  
  const getPathForRole = () => {
    switch (role) {
      case 'admin':
        return adminPath;
      case 'provider':
        return providerPath || adminPath.replace('/admin', '/provider');
      case 'supervisor':
        return supervisorPath || '/supervisor';
      case 'employee':
        return employeePath || '/employee';
      default:
        return '/';
    }
  };
  
  return (
    <NavLink to={getPathForRole()} {...props}>
      {children}
    </NavLink>
  );
};

export default RoleBasedLink;
