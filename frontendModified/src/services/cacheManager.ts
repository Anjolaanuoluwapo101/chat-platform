interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number; // in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  
  // Generate cache key from full URI
  generateKey(method: string, url: string, params?: any): string {
    // Create full URL with parameters
    let fullUrl = url;
    if (params) {
      const searchParams = new URLSearchParams(params);
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return `${method.toUpperCase()}:${fullUrl}`;
  }
  
  // Check if entry exists and is still valid
  isValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.expiry;
  }
  
  // Get cached data
  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp >= entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
  
  // Set cached data with expiry
  set(key: string, data: any, expiry: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }
  
  // Delete a cache entry
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  // Clear all cache entries
  clear(): void {
    this.cache.clear();
  }
  
  // Update cache entries based on mutation responses
  updateRelated(method: string, url: string, responseData: any): void {
    // For message-related mutations
    if (url.includes('/messages') && !url.includes('/groups')) {
      this.updateMessagesCache(method, url, responseData);
    }
    
    // For group-related mutations
    if (url.includes('/groups')) {
      this.updateGroupsCache(method, url, responseData);
    }
  }
  
  // Update messages cache based on mutations
  private updateMessagesCache(method: string, url: string, responseData: any): void {
    // For individual messages endpoint
    if (url.match(/^\/messages\/?(\?.*)?$/) && method === 'post' && responseData.success) {
      // Update messages cache by adding the new message
      const messagesCacheKey = this.generateKey('GET', '/messages', { username: responseData.message?.username });
      const cachedEntry = this.cache.get(messagesCacheKey);
      
      if (cachedEntry && cachedEntry.data && cachedEntry.data.messages) {
        // Add new message to the beginning of the array (newest first)
        const updatedMessages = [responseData.message, ...cachedEntry.data.messages];
        this.set(messagesCacheKey, { 
          ...cachedEntry.data, 
          messages: updatedMessages 
        }, cachedEntry.expiry);
      }
    }
  }
  
  // Update groups cache based on mutations
  private updateGroupsCache(method: string, url: string, responseData: any): void {
    // Update user groups list when groups are created
    if (url === '/groups' && method === 'post' && responseData.success && responseData.group) {
      const userGroupsCacheKey = this.generateKey('GET', '/groups');
      const cachedEntry = this.cache.get(userGroupsCacheKey);
      
      if (cachedEntry && cachedEntry.data && cachedEntry.data.groups) {
        // Add new group to user's groups list
        const updatedGroups = [...cachedEntry.data.groups, responseData.group];
        this.set(userGroupsCacheKey, { 
          ...cachedEntry.data, 
          groups: updatedGroups 
        }, cachedEntry.expiry);
      }
    }
    
    // Update user groups list when joining a group
    if (url.match(/\/groups\/\d+\/join/) && method === 'post' && responseData.success && responseData.group) {
      const userGroupsCacheKey = this.generateKey('GET', '/groups');
      const cachedEntry = this.cache.get(userGroupsCacheKey);
      
      if (cachedEntry && cachedEntry.data && cachedEntry.data.groups) {
        // Add joined group to user's groups list
        const updatedGroups = [...cachedEntry.data.groups, responseData.group];
        this.set(userGroupsCacheKey, { 
          ...cachedEntry.data, 
          groups: updatedGroups 
        }, cachedEntry.expiry);
      }
    }
    
    // Handle group member updates
    const membersMatch = url.match(/\/groups\/(\d+)\/members/);
    if (membersMatch && method === 'post') {
      // For member additions, invalidate the members cache
      const groupId = membersMatch[1];
      const membersCacheKey = this.generateKey('GET', `/groups/${groupId}/members`);
      this.delete(membersCacheKey);
    }
    
    // Handle member removals
    const removeMemberMatch = url.match(/\/groups\/(\d+)\/members\/remove/);
    if (removeMemberMatch && method === 'post') {
      // For member removals, invalidate the members cache
      const groupId = removeMemberMatch[1];
      const membersCacheKey = this.generateKey('GET', `/groups/${groupId}/members`);
      this.delete(membersCacheKey);
    }
    
    // Handle leaving a group
    const leaveGroupMatch = url.match(/\/groups\/(\d+)\/leave/);
    if (leaveGroupMatch && method === 'post') {
      // Invalidate user groups cache when leaving a group
      const userGroupsCacheKey = this.generateKey('GET', '/groups');
      this.delete(userGroupsCacheKey);
    }
    
    // Handle group deletion
    const deleteGroupMatch = url.match(/\/groups\/(\d+)\/delete/);
    if (deleteGroupMatch && method === 'post') {
      // Invalidate user groups cache when deleting a group
      const userGroupsCacheKey = this.generateKey('GET', '/groups');
      this.delete(userGroupsCacheKey);
    }
  }
}

export default new CacheManager();