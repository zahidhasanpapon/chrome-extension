import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shield, AlertTriangle, Search, X } from 'lucide-react';
import { BlockedSite } from '@/shared/types';
import { StorageManager } from '@/shared/utils';
import BlockedSiteItem from './BlockedSiteItem';
import EmptyState from './EmptyState';

interface BlockedSitesTabProps {
  blockedSites: BlockedSite[];
  setBlockedSites: (sites: BlockedSite[]) => void;
  theme: 'light' | 'dark';
  onStatsUpdate: (sites: BlockedSite[]) => void;
}

const BlockedSitesTab: React.FC<BlockedSitesTabProps> = ({
  blockedSites,
  setBlockedSites,
  theme,
  onStatsUpdate
}) => {
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const cleanUrl = (url: string): string => {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  };

  const validateUrl = (url: string): boolean => {
    const cleanedUrl = cleanUrl(url);
    return cleanedUrl.length > 0 && cleanedUrl.includes('.');
  };

  const addBlockedSite = async () => {
    if (!newSiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    if (!validateUrl(newSiteUrl)) {
      setError('Please enter a valid website URL');
      return;
    }

    const cleanedUrl = cleanUrl(newSiteUrl);
    
    // Check if site is already blocked
    if (blockedSites.some(site => site.url === cleanedUrl)) {
      setError('This site is already blocked');
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      const newSite: BlockedSite = {
        url: cleanedUrl,
        addedAt: Date.now()
      };

      const updatedSites = [...blockedSites, newSite];
      setBlockedSites(updatedSites);
      await StorageManager.saveBlockedSites(updatedSites.map(site => site.url));
      onStatsUpdate(updatedSites);

      // Notify content scripts about the update
      chrome.runtime.sendMessage({
        action: 'UPDATE_BLOCKED_SITES',
        blockedSites: updatedSites.map(site => site.url)
      });

      setNewSiteUrl('');
    } catch (error) {
      console.error('Error adding blocked site:', error);
      setError('Failed to add blocked site');
    } finally {
      setIsAdding(false);
    }
  };

  const removeBlockedSite = async (urlToRemove: string) => {
    try {
      const updatedSites = blockedSites.filter(site => site.url !== urlToRemove);
      setBlockedSites(updatedSites);
      await StorageManager.saveBlockedSites(updatedSites.map(site => site.url));
      onStatsUpdate(updatedSites);

      // Notify content scripts about the update
      chrome.runtime.sendMessage({
        action: 'UPDATE_BLOCKED_SITES',
        blockedSites: updatedSites.map(site => site.url)
      });
    } catch (error) {
      console.error('Error removing blocked site:', error);
    }
  };

  const filteredSites = blockedSites.filter(site =>
    site.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add Site Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-red-500" />
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Block New Website
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newSiteUrl}
              onChange={(e) => {
                setNewSiteUrl(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && addBlockedSite()}
              placeholder="Enter website URL (e.g., facebook.com, youtube.com)"
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
            />
            <button
              onClick={addBlockedSite}
              disabled={!newSiteUrl.trim() || isAdding}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                !newSiteUrl.trim() || isAdding
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>{isAdding ? 'Adding...' : 'Block'}</span>
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-500 text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="mb-1">Tips:</p>
            <ul className="space-y-1 ml-4">
              <li>• Enter just the domain name (e.g., "facebook.com" not "https://www.facebook.com")</li>
              <li>• Subdomains will also be blocked (e.g., blocking "youtube.com" blocks "m.youtube.com")</li>
              <li>• Use the most specific domain to avoid blocking unintended sites</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      {blockedSites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
          }`}
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blocked sites..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Blocked Sites List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredSites.length === 0 ? (
            <EmptyState
              title={searchTerm ? 'No matching sites' : blockedSites.length === 0 ? 'No blocked sites' : 'No sites found'}
              description={
                searchTerm 
                  ? 'Try adjusting your search term'
                  : blockedSites.length === 0
                  ? 'Add websites you want to block to stay focused'
                  : 'No sites match your search'
              }
              icon={<Shield className="w-12 h-12" />}
              theme={theme}
            />
          ) : (
            filteredSites.map((site) => (
              <BlockedSiteItem
                key={site.url}
                site={site}
                onRemove={removeBlockedSite}
                theme={theme}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats */}
      {blockedSites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {blockedSites.length} site{blockedSites.length !== 1 ? 's' : ''} blocked
              </span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Stay focused and productive! 🎯
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BlockedSitesTab;
