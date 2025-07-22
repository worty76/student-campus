// Utility functions for navigation between pages

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Navigate to community page with a specific group selected
 * @param router - Next.js router instance
 * @param groupId - ID of the group to select
 * @param groupName - Name of the group to select
 */
export const navigateToCommunityGroup = (
  router: AppRouterInstance,
  groupId: string,
  groupName: string
) => {
  const url = `/community?groupId=${encodeURIComponent(groupId)}&groupName=${encodeURIComponent(groupName)}`;
  router.push(url);
};

/**
 * Navigate to community page
 * @param router - Next.js router instance
 */
export const navigateToCommunity = (router: AppRouterInstance) => {
  router.push('/community');
};
