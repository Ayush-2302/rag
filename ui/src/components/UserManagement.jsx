import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllUsers,
  adminCreateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from '../api/authApi';
import {
  PageContainer,
  PageHeader,
  Section,
  Card,
  CardHeader,
  Button,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalContent,
  FormField,
  Input,
  Select,
  EmptyState,
  useConfirm,
} from './ui';
import {
  UsersIcon,
  UserPlusIcon,
  ShieldIcon,
  UserIcon,
  TrashIcon,
  RefreshIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from './icons';
import { toast } from 'sonner';

export function UserManagement() {
  const { user: currentUser, isAdmin, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ConfirmComponent, confirm] = useConfirm();

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Action loading states by user ID
  const [actionLoading, setActionLoading] = useState({});

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user list');
      toast.error('Failed to load users: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id && user.is_active) {
      toast.error('You cannot deactivate your own administrative account.');
      return;
    }

    if (user.is_active) {
      const ok = await confirm({
        title: 'Deactivate User Account?',
        description: `Are you sure you want to deactivate "${user.username}"? They will be immediately blocked from logging in and accessing any documents.`,
        variant: 'warning',
        confirmText: 'Deactivate Account',
        cancelText: 'Cancel',
      });
      if (!ok) return;
    }

    const nextStatus = !user.is_active;
    setActionLoading((prev) => ({ ...prev, [user.id]: 'status' }));

    try {
      await updateUserStatus(user.id, nextStatus);
      toast.success(
        `User "${user.username}" ${nextStatus ? 'activated' : 'deactivated'} successfully.`
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: null }));
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;
    setActionLoading((prev) => ({ ...prev, [user.id]: 'role' }));

    try {
      await updateUserRole(user.id, newRole);
      toast.success(`Role for "${user.username}" changed to ${newRole.toUpperCase()}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: null }));
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      toast.error('You cannot delete your own administrative account.');
      return;
    }

    const ok = await confirm({
      title: 'Permanently Delete User?',
      description: `Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete User',
      cancelText: 'Keep User',
    });
    if (!ok) return;

    setActionLoading((prev) => ({ ...prev, [user.id]: 'delete' }));

    try {
      await deleteUser(user.id);
      toast.success(`User "${user.username}" deleted successfully.`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: null }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const newUser = await adminCreateUser({
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        password: formData.password,
        role: formData.role,
        is_active: formData.is_active,
      });

      toast.success(`User "${newUser.username}" created successfully!`);
      setCreateModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true,
      });
      loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user');
      toast.error(err.message || 'Failed to create user');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          title="User Management"
          description="Administrative control panel for system users and permissions."
        />
        <PageContainer className="py-8">
          <Alert variant="warning" title="Access Denied">
            You must be logged in as an <strong>Administrator</strong> to access user management functions.
          </Alert>
        </PageContainer>
      </div>
    );
  }

  const activeCount = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <PageHeader
        title="User Management"
        description="Provision accounts, assign roles, and activate or deactivate user access."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadUsers}
              disabled={loading}
              leftIcon={<RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormError('');
                setCreateModalOpen(true);
              }}
              leftIcon={<UserPlusIcon size={14} />}
            >
              Create User
            </Button>
          </div>
        }
      />

      <PageContainer className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Users</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-text-primary">{users.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Active Users</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-success">{activeCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Administrators</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-primary">{adminCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Standard Users</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-text-secondary">{userCount}</p>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader
            title="Registered Accounts"
            description="All user records stored in MongoDB authentication database."
          />

          {error ? (
            <div className="p-6">
              <Alert variant="danger" title="Error loading users">
                {error}
                <div className="mt-2">
                  <Button size="xs" variant="primary" onClick={loadUsers}>
                    Try Again
                  </Button>
                </div>
              </Alert>
            </div>
          ) : loading && users.length === 0 ? (
            <div className="p-12 text-center text-sm text-text-muted">
              <RefreshIcon size={24} className="mx-auto mb-2 animate-spin text-primary" />
              Loading system accounts...
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="No registered users exist in the system."
              action={
                <Button size="sm" variant="primary" onClick={() => setCreateModalOpen(true)}>
                  Create First User
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-soft">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      User
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Role
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Status
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">
                      Joined
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isBusy = actionLoading[u.id] != null;

                    return (
                      <tr key={u.id} className="transition-colors hover:bg-surface-hover/50">
                        {/* User details */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs uppercase">
                              {u.username[0] || 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-text-primary">{u.username}</span>
                                {isSelf && (
                                  <span className="rounded bg-surface-soft border border-border px-1 py-0.2 text-[10px] font-semibold text-text-muted">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-text-muted">
                                {u.email || 'No email specified'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Badge variant={u.role === 'admin' ? 'primary' : 'secondary'}>
                              {u.role}
                            </Badge>
                            {!isSelf && (
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u, e.target.value)}
                                disabled={isBusy}
                                className="rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-text-secondary focus:border-primary focus:outline-none"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <Badge variant={u.is_active ? 'success' : 'danger'}>
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </Badge>
                        </td>

                        {/* Joined */}
                        <td className="hidden px-5 py-3.5 text-xs text-text-muted sm:table-cell">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle active / deactivated */}
                            <Button
                              size="xs"
                              variant={u.is_active ? 'secondary' : 'primary'}
                              onClick={() => handleToggleStatus(u)}
                              disabled={isBusy || (isSelf && u.is_active)}
                              loading={actionLoading[u.id] === 'status'}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </Button>

                            {/* Delete button */}
                            {!isSelf && (
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleDeleteUser(u)}
                                disabled={isBusy}
                                loading={actionLoading[u.id] === 'delete'}
                                className="text-danger hover:bg-danger-soft hover:border-danger/30"
                              >
                                <TrashIcon size={13} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageContainer>

      {/* Admin Create User Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="max-w-md">
        <ModalHeader
          title="Create New User"
          description="Provision a new account with custom role and active status."
          onClose={() => setCreateModalOpen(false)}
        />
        <ModalContent className="pt-2">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formError && (
              <Alert variant="danger" onDismiss={() => setFormError('')}>
                {formError}
              </Alert>
            )}

            <FormField label="Username" required>
              <Input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. jdoe"
                autoFocus
              />
            </FormField>

            <FormField label="Email Address" hint="Optional notification contact.">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jdoe@example.com"
              />
            </FormField>

            <FormField label="Password" required hint="At least 4 characters.">
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Assigned Role" required>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User (Standard)</option>
                  <option value="admin">Admin (Manager)</option>
                </Select>
              </FormField>

              <FormField label="Initial Status" required>
                <Select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Deactivated</option>
                </Select>
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-light">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                disabled={formSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={formSubmitting}
              >
                Create Account
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog with rich variants */}
      <ConfirmComponent />
    </div>
  );
}

export default UserManagement;
