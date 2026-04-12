import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, MoreVertical } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * ManageMembers Component
 *
 * Displays a list of workspace members with role management capabilities.
 * - PMs can switch collaborator roles using a dropdown
 * - Non-PMs see read-only role badges
 *
 * Props:
 * - workspaceId: MongoDB workspace ID (required)
 * - onMembersUpdate: Callback function when members are updated (optional)
 */
const ManageMembers = ({ workspaceId, onMembersUpdate }) => {
  const { token, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get memoized auth headers
  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Determine if current user is a PM
  const currentUserRole = useMemo(() => {
    if (!members || !user) return null;
    const currentMember = members.find(m => m._id === user.id);
    return currentMember?.role || null;
  }, [members, user]);

  const isCurrentUserPM = useMemo(() => {
    return currentUserRole === 'pm';
  }, [currentUserRole]);

  // Fetch workspace members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspaceId) {
        setError('Workspace ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE_URL}/workspace/me`, {
          headers: authHeaders,
          withCredentials: true,
        });

        if (response.data?.members) {
          setMembers(response.data.members);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error('[ManageMembers] Failed to fetch members:', err);
        setError(err.response?.data?.error || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId, authHeaders]);

  // Handle role change
  const handleRoleChange = async (memberId, newRole) => {
    try {
      setUpdatingMemberId(memberId);
      setError(null);

      const response = await axios.patch(
        `${API_BASE_URL}/workspace/${workspaceId}/members/${memberId}/role`,
        { role: newRole },
        {
          headers: authHeaders,
          withCredentials: true,
        }
      );

      // Update local state
      setMembers(prevMembers =>
        prevMembers.map(m =>
          m._id === memberId ? { ...m, role: newRole } : m
        )
      );

      // Show success message
      setSuccessMessage(`Successfully updated member role to ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Call callback if provided
      if (onMembersUpdate) {
        onMembersUpdate();
      }

      console.log('[ManageMembers] Role updated successfully:', response.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || 'Failed to update member role';
      console.error('[ManageMembers] Role update failed:', errorMsg);
      setError(errorMsg);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!members || members.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No members found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Members List */}
      <div className="rounded-lg border border-border/30 bg-card/50 overflow-hidden">
        <div className="divide-y divide-border/20">
          {/* Header */}
          <div className="px-4 py-3 bg-muted/20 border-b border-border/20">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-muted-foreground">
                Member
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                Role
              </div>
            </div>
          </div>

          {/* Member Rows */}
          {members.map(member => (
            <div
              key={member._id}
              className="px-4 py-4 flex items-center justify-between gap-4 hover:bg-muted/5 transition-colors"
            >
              {/* Member Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 border border-border/30">
                  <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {(member.fullName || member.email)
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {member.fullName || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.email}
                  </p>
                </div>
                {member._id === user?.id && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-xs shrink-0"
                  >
                    You
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                {/* Non-PM or current user sees read-only badge */}
                {(member.role === 'pm' || member.role === 'collaborator') && (
                  <Badge
                    variant={
                      member.role === 'pm' ? 'default' : 'secondary'
                    }
                    className={`text-xs ${
                      member.role === 'pm'
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {member.role === 'pm'
                      ? 'Project Manager (PM)'
                      : 'Collaborator'}
                  </Badge>
                )}

                {isCurrentUserPM && (
                  // PM can edit other members' roles via DropdownMenu (three dots)
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity"
                        disabled={updatingMemberId === member._id}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === 'pm' ? (
                        <DropdownMenuItem onClick={() => handleRoleChange(member._id, 'collaborator')}>
                          Demote to Collaborator
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRoleChange(member._id, 'pm')}>
                          Promote to PM
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Loading Indicator */}
                {updatingMemberId === member._id && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Count */}
      <div className="text-xs text-muted-foreground pt-2">
        {members.length} {members.length === 1 ? 'member' : 'members'} in
        workspace
      </div>

      {/* Permission Info */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/20">
        <p className="text-xs text-muted-foreground">
          {isCurrentUserPM ? (
            <>
              <span className="font-medium text-foreground">
                As a PM, you can:
              </span>
              <br />• Switch members between Collaborator and PM roles
              <br />• Manage workspace permissions
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">
                You are a Collaborator.
              </span>
              <br />
              Only PMs can manage member roles.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ManageMembers;
