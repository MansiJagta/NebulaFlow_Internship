import { useAuth } from '@/contexts/AuthContext';
import ManageMembers from '@/components/common/ManageMembers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Page: Manage Workspace Members
 * 
 * Displays the workspace members management interface.
 * This page allows:
 * - Viewing all workspace members
 * - Changing member roles (PM only)
 * - Viewing member details and join dates
 */
const ManageMembersPage = () => {
  const { token, user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/workspace/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setWorkspace(response.data);
      } catch (err) {
        console.error('[ManageMembersPage] Failed to fetch workspace:', err);
        setError(err.response?.data?.error || 'Failed to load workspace');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400">
            No workspace found. Please create or join a workspace first.
          </p>
        </div>
      </div>
    );
  }

  const userRole = workspace.members.find(m => m._id === user?.id)?.role;
  const isPM = userRole === 'pm';

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Manage Members
          </h1>
          <p className="text-muted-foreground">
            {workspace.name}
            {isPM && (
              <span className="ml-2 inline-block px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded text-xs font-medium">
                You are a PM
              </span>
            )}
          </p>
        </div>

        {/* Workspace Info */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Workspace ID
              </p>
              <p className="text-sm font-mono text-foreground">
                {workspace._id}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Members
              </p>
              <p className="text-sm font-semibold text-foreground">
                {workspace.members?.length || 0}
              </p>
            </div>
            {workspace.githubConfig?.repoName && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground font-medium">
                  GitHub Repository
                </p>
                <p className="text-sm font-mono text-foreground">
                  {workspace.githubConfig.repoOwner}/
                  {workspace.githubConfig.repoName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Manage Members Component */}
        <div className="bg-card rounded-lg border border-border/30 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Members
          </h2>
          <ManageMembers
            workspaceId={workspace._id}
            onMembersUpdate={() => {
              console.log('Members updated');
            }}
          />
        </div>

        {/* Help Section */}
        {isPM && (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              PM Capabilities
            </h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>✓ Change member roles between Collaborator and PM</li>
              <li>✓ View all workspace members and their details</li>
              <li>✓ Manage workspace permissions and access</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMembersPage;
