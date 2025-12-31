interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number; // in milliseconds
}

class CacheManager {
  private cacheKey = 'app_cache'; // Key to store the entire cache in localStorage
  
  constructor() {
    // Load cache from localStorage on initialization
    this.loadCacheFromStorage();
  }
  
  // Load cache from localStorage
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clean up expired entries on load
        this.cleanupExpiredEntries(parsed);
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }
  
  // Save cache to localStorage
  private saveCacheToStorage(): void {
    try {
      const cacheObj: Record<string, CacheEntry> = {};
      // Get all valid entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry: CacheEntry = JSON.parse(item);
              // Only save non-expired entries
              if (this.isEntryValid(entry)) {
                cacheObj[key] = entry;
              } else {
                // Remove expired entry
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // If parsing fails, remove the corrupted entry
            localStorage.removeItem(key);
          }
        }
      }
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }
  
  // Check if a cache entry is valid (not expired)
  private isEntryValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.expiry;
  }
  
  // Clean up expired entries
  private cleanupExpiredEntries(cacheObj: any): void {
    const now = Date.now();
    for (const key in cacheObj) {
      const entry = cacheObj[key];
      if (now - entry.timestamp >= entry.expiry) {
        // Entry is expired, remove it
        localStorage.removeItem(key);
        delete cacheObj[key];
      } else {
        // Entry is still valid, put it back in localStorage
        localStorage.setItem(key, JSON.stringify(entry));
      }
    }
  }
  
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
    console.log('cache key has been generated for:',fullUrl)
    return `cache_${method.toUpperCase()}:${fullUrl}`;
  }
  
  // Check if entry exists and is still valid
  isValid(key: string): boolean {
    const entry = this.getEntry(key);
    if (!entry) return false;
    return this.isEntryValid(entry);
  }
  
  // Get raw cache entry (for internal use)
  private getEntry(key: string): CacheEntry | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const entry: CacheEntry = JSON.parse(item);
      console.log(`Cache entry for ${key} gotten - which is`,entry)
      return entry;
    } catch (error) {
      console.error('Error getting cache entry:', error);
      return null;
    }
  }
  
  // Set raw cache entry (for internal use)
  private setEntry(key: string, entry: CacheEntry): void {
    try {
      localStorage.setItem(key, JSON.stringify(entry));
      // Save updated cache state to main cache key
      this.saveCacheToStorage();
    } catch (error) {
      console.error('Error setting cache entry:', error);
    }
  }
  
  // Get cached data
  get(key: string): any {
    try {
      const entry = this.getEntry(key);
      if (!entry) return null;
      
      if (!this.isEntryValid(entry)) {
        this.delete(key);
        return null;
      }
      
      console.log('Cache entry found for', key);
      return entry.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }
  
  // Set cached data with expiry
  set(key: string, data: any, expiry: number = 300000): void { // Default 5 minutes
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        expiry
      };
      
      this.setEntry(key, entry);
      console.log('Cache entry set for', key, 'with expiry', expiry);
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  }
  
  // Delete a cache entry
  delete(key: string): void {
    try {
      localStorage.removeItem(key);
      console.log('Cache entry deleted for', key);
    } catch (error) {
      console.error('Error deleting cache entry:', error);
    }
  }
  
  // Clear all cache entries
  clear(): void {
    try {
      // Remove all cache entries (those starting with 'cache_')
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem(this.cacheKey); // Remove the main cache key as well
      
      console.log('All cache entries cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  // Update cache entries based on mutation responses
  updateRelated(method: string, url: string, responseData: any): void {
    // For message-related mutations
    if (url.includes('/messages') && !url.includes('/groups')) {
      this.updateMessagesCache(method, url, responseData);
      console.log('Updated messages cache for', url);
    }
    
    // For group-related mutations
    if (url.includes('/groups')) {
      this.updateGroupsCache(method, url, responseData);
      console.log('Updated groups cache for', url);
    }
  }
  
  // Update messages cache based on mutations
  private updateMessagesCache(method: string, url: string, responseData: any): void {
    // For individual messages endpoint
    if (url.match(/^\/messages\/?(\?.*)?$/) && method === 'post' && responseData.success) {
      // Update messages cache by adding the new message
      const messagesCacheKey = this.generateKey('GET', '/messages', { username: responseData.message?.username });
      const cachedEntry = this.get(messagesCacheKey);
      
      if (cachedEntry && cachedEntry.data && cachedEntry.data.messages) {
        // Add new message to the beginning of the array (newest first)
        const updatedMessages = [responseData.message, ...cachedEntry.data.messages];
        // Get the original expiry from the cached entry
        const originalEntry = this.getEntry(messagesCacheKey);
        this.set(messagesCacheKey, { 
          ...cachedEntry, 
          messages: updatedMessages 
        }, originalEntry?.expiry);
      }
    }
  }
  
  // Update groups cache based on mutations
  private updateGroupsCache(method: string, url: string, responseData: any): void {
    // Update user groups list when groups are created
    if (url === '/groups' && method === 'post' && responseData.success && responseData.group) {
      const userGroupsCacheKey = this.generateKey('GET', '/groups');
      const cachedEntry = this.get(userGroupsCacheKey);
      
      if (cachedEntry && cachedEntry.data && cachedEntry.data.groups) {
        // Add new group to user's groups list
        const updatedGroups = [...cachedEntry.data.groups, responseData.group];
        // Get the original expiry from the cached entry
        const originalEntry = this.getEntry(userGroupsCacheKey);
        this.set(userGroupsCacheKey, { 
          ...cachedEntry, 
          groups: updatedGroups 
        }, originalEntry?.expiry);
      }
    }
    
    // Update user groups list when joining a group
    if (url.match(/\/groups\/\d+\/join/) && method === 'post' && responseData.success && responseData.group) {
      const userGroupsCacheKey = this.generateKey('GET', '/groups');
      const cachedEntry = this.get(userGroupsCacheKey);
      
      if (cachedEntry && cachedEntry.data && cachedEntry.data.groups) {
        // Add joined group to user's groups list
        const updatedGroups = [...cachedEntry.data.groups, responseData.group];
        // Get the original expiry from the cached entry
        const originalEntry = this.getEntry(userGroupsCacheKey);
        this.set(userGroupsCacheKey, { 
          ...cachedEntry, 
          groups: updatedGroups 
        }, originalEntry?.expiry);
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