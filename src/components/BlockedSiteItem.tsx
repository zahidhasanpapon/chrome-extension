import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Trash2, ExternalLink, Shield } from 'lucide-react';
import { BlockedSite } from '@/shared/types';

interface BlockedSiteItemProps {
  site: BlockedSite;
  onRemove: (url: string) => void;
  theme: 'light' | 'dark';
}

const BlockedSiteItem: React.FC<BlockedSiteItemProps> = ({ site, onRemove, theme }) => {
  const getFaviconUrl = (url: string) => {
    return `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
  };

  const getDisplayUrl = (url: string) => {
    return url.length > 40 ? `${url.substring(0, 40)}...` : url;
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to unblock ${site.url}?`)) {
      onRemove(site.url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-lg transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
          : 'bg-white hover:bg-gray-50 shadow-sm border border-gray-200'
      } hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src={getFaviconUrl(site.url)}
              alt={`${site.url} favicon`}
              className="w-8 h-8 rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-8 h-8 rounded bg-red-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-red-500" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className={`text-sm font-medium truncate ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {getDisplayUrl(site.url)}
              </h3>
              <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
            </div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Blocked on {new Date(site.addedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(`https://${site.url}`, '_blank')}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Visit site (will be blocked)"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRemove}
            className={`p-2 rounded-lg transition-colors hover:bg-red-100 ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900/20'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Unblock this site"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BlockedSiteItem;
