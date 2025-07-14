import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Download, Upload, Globe } from 'lucide-react';
import BlockedSiteItem from './BlockedSiteItem';
import StatsCard from './StatsCard';
import EmptyState from './EmptyState';

export default function BlockedSitesTab({ 
  blockedSites, 
  onBlockSite, 
  onUnblockSite, 
  onExport, 
  onImport 
}) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onBlockSite(inputValue.trim());
      setInputValue('');
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        onImport(file);
      }
    };
    input.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Add Blocked Site Form */}
      <motion.form
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter website URL to block (e.g., facebook.com, youtube.com)"
            className="input-field flex-1"
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>Block Site</span>
          </motion.button>
        </div>
      </motion.form>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Blocked Sites"
          value={blockedSites.length}
          icon={Shield}
          color="accent"
        />
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-motivate-500 to-motivate-600 bg-opacity-10 mb-4">
            <Globe className="w-6 h-6 text-motivate-600" />
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-2">
            Stay Focused
          </div>
          <div className="text-gray-600 text-sm">
            Block distracting websites to maintain productivity
          </div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExport}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-motivate-500 to-motivate-600 hover:from-motivate-600 hover:to-motivate-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportClick}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-focus-500 to-focus-600 hover:from-focus-600 hover:to-focus-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Blocked Sites List */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-accent-600" />
          Blocked Websites
        </h3>
        
        <AnimatePresence mode="popLayout">
          {blockedSites.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No blocked sites yet!"
              description="Add websites above to block them and stay focused on your important tasks."
            />
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {blockedSites.map((site) => (
                <BlockedSiteItem
                  key={site}
                  site={site}
                  onUnblock={onUnblockSite}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}