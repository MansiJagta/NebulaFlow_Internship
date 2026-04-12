/**
 * GitHub Repository Synchronization Utilities
 * 
 * This module provides helper functions for syncing GitHub repositories
 * and handling role-based access control during workspace setup.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Syncs a GitHub repository to a workspace.
 * 
 * This function:
 * 1. Verifies the user is authenticated with GitHub
 * 2. Fetches repository info from GitHub
 * 3. Compares user's GitHub ID with repository owner's ID
 * 4. Assigns 'PM' role if user owns the repo, 'Collaborator' otherwise
 * 5. Creates or updates the workspace with GitHub config
 *
 * @param {string} repoOwner - GitHub repo owner username (e.g., 'facebook')
 * @param {string} repoName - GitHub repo name (e.g., 'react')
 * @param {string} workspaceId - (optional) MongoDB workspace ID for updating existing workspace
 * @param {string} token - (optional) Bearer token for API authentication
 * 
 * @returns {Promise<Object>} Response object containing:
 *   {
 *     success: boolean,
 *     workspace: { _id, name, members, githubConfig },
 *     userRole: 'pm' | 'collaborator',
 *     isRepoOwner: boolean,
 *     message: string,
 *     error?: string
 *   }
 * 
 * @throws {Error} If repo sync fails due to:
 *   - GitHub not connected
 *   - Repository not found
 *   - API errors
 */
export async function syncGitHubRepository(repoOwner, repoName, workspaceId = null, token = null) {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const payload = {
      repoOwner,
      repoName,
    };

    if (workspaceId) {
      payload.workspaceId = workspaceId;
    }

    const response = await axios.post(
      `${API_BASE_URL}/github/sync-repo`,
      payload,
      {
        headers,
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.response?.data?.message || error.message;
    console.error('[syncGitHubRepository] Failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Validates GitHub repository ownership (frontend check before sync)
 * 
 * This performs a quick validation check by verifying:
 * 1. Repo owner and name are not empty
 * 2. Format is valid (no special characters except -)
 *
 * @param {string} repoOwner - GitHub repo owner username
 * @param {string} repoName - GitHub repo name
 * 
 * @returns {Object} Validation result:
 *   {
 *     valid: boolean,
 *     error?: string
 *   }
 */
export function validateGitHubRepoDependencies(repoOwner, repoName) {
  if (!repoOwner || !repoName) {
    return {
      valid: false,
      error: 'Repository owner and name are required',
    };
  }

  // GitHub username/org can contain alphanumeric chars and hyphens
  const ownerRegex = /^[a-zA-Z0-9-]+$/;
  const repoRegex = /^[a-zA-Z0-9._-]+$/;

  if (!ownerRegex.test(repoOwner)) {
    return {
      valid: false,
      error: 'Repository owner contains invalid characters',
    };
  }

  if (!repoRegex.test(repoName)) {
    return {
      valid: false,
      error: 'Repository name contains invalid characters',
    };
  }

  return { valid: true };
}

/**
 * Gets human-readable role label
 * 
 * @param {string} role - Role identifier ('pm' or 'collaborator')
 * @returns {string} Human-readable role label
 */
export function getRoleLabel(role) {
  const labelMap = {
    pm: 'Project Manager (PM)',
    collaborator: 'Collaborator',
  };
  return labelMap[role] || role;
}

/**
 * Gets role-specific icon/badge color
 * 
 * @param {string} role - Role identifier
 * @returns {string} Tailwind color class
 */
export function getRoleColor(role) {
  const colorMap = {
    pm: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    collaborator: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  };
  return colorMap[role] || 'bg-gray-500/20 text-gray-600';
}

export default {
  syncGitHubRepository,
  validateGitHubRepoDependencies,
  getRoleLabel,
  getRoleColor,
};
