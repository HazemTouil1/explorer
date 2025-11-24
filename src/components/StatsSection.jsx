import React, { useState, useEffect } from 'react'
import { TrendingUp, Server, Gauge, DollarSign } from 'lucide-react'
import veroService from '../services/veroService'

const StatsSection = () => {
  const [stats, setStats] = useState({
    currentBlock: 0,
    gasPrice: '0',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const networkStats = await veroService.getNetworkStats();
        setStats({
          currentBlock: networkStats.currentBlock,
          gasPrice: networkStats.gasPrice,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to fetch network stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchStats();
    
    // Refresh every 3 seconds
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  if (stats.loading) {
    return (
      <div className="card p-6 mb-6 w-full dark:bg-black dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="card p-6 mb-6 w-full dark:bg-black dark:border-gray-800">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to connect to Vero Network</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stats.error}</p>
        </div>
      </div>
    );
  }

  const gasPriceGwei = (parseInt(stats.gasPrice, 16) / 1e9).toFixed(2);

  return (
    <div className="card p-6 mb-6 w-full dark:bg-black dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {/* Current Block */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg transition-colors">
            <Server className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">CURRENT BLOCK</p>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {stats.currentBlock.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Gas Price */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg transition-colors">
            <Gauge className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">GAS PRICE</p>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {gasPriceGwei} Gwei
            </span>
          </div>
        </div>

        {/* Network Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">NETWORK</p>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Vero Chain
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsSection


