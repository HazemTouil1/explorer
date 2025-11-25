import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Box, ArrowRight } from 'lucide-react'
import veroService from '../services/veroService'

const LatestBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        if (!initialized) setLoading(true);
        const latestBlocks = await veroService.getLatestBlocks(6);
        setBlocks((prev) => {
          const map = new Map();
          [...latestBlocks, ...prev].forEach((b) => {
            if (b && b.number != null) map.set(b.number, b);
          });
          const merged = Array.from(map.values());
          merged.sort((a, b) => (b.number || 0) - (a.number || 0));
          const next = merged.slice(0, 6);
          const same = prev.length === next.length && prev.every((p, i) => p.number === next[i].number);
          return same ? prev : next;
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        if (!initialized) setInitialized(true);
      }
    };

    fetchBlocks();
    
    // Refresh every 3 seconds
    const interval = setInterval(fetchBlocks, 3000);
    return () => clearInterval(interval);
  }, []);


  if (error) {
    return (
      <div className="card overflow-hidden w-full dark:bg-black dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Latest Blocks</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load blocks</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden w-full dark:bg-black dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Latest Blocks</h2>
        <Link to="/blocks" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
          View all blocks
        </Link>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {blocks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {initialized ? 'No blocks found' : 'Loading latest blocks...'}
            </p>
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block.number} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Box className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">Block</span>
                        <Link to={`/block/${block.number}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                          {block.number}
                        </Link>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {veroService.formatTime(block.timestamp)}
                      </p>
                    </div>
                    
                    <div className="text-right sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                      <span className="inline-block px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-medium rounded truncate max-w-full sm:max-w-none">
                        {block.transactionCount} txns
                      </span>
                    </div>

                
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Miner</span>
                      <Link to={`/address/${block.miner}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 truncate">
                        {veroService.formatAddress(block.miner)}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-gray-500 dark:text-gray-400">
                        Gas Used: {block.gasUsed.toLocaleString()} / {block.gasLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <Link to="/blocks" className="block p-4 text-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
        View all blocks <ArrowRight className="inline w-4 h-4 ml-1" />
      </Link>
    </div>
  )
}

export default LatestBlocks

