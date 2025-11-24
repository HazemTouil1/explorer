import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'
import veroService from '../services/veroService'

const LatestTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!initialized) setLoading(true);
        const latestTransactions = await veroService.getLatestTransactions(6);
        setTransactions(latestTransactions.slice(0, 6));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        if (!initialized) setInitialized(true);
      }
    };

    fetchTransactions();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, []);


  if (error) {
    return (
      <div className="card overflow-hidden w-full dark:bg-black dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Latest Transactions</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load transactions</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden w-full dark:bg-black dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Latest Transactions</h2>
                <Link to="/txs" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  View all transactions
                </Link>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {transactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {initialized ? 'No transactions in the last 50 blocks' : 'Loading latest transactions...'}
            </p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.hash} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">TX#</span>
                                <Link to={`/tx/${tx.hash}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium truncate max-w-[150px]">
                          {veroService.formatHash(tx.hash)}
                                </Link>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {veroService.formatTime(tx.timestamp)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium rounded">
                        {veroService.formatWeiToEther(tx.value)} VERO
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">From</span>
                      <Link to={`/address/${tx.from}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 truncate">
                        {veroService.formatAddress(tx.from)}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">To</span>
                      {tx.to ? (
                        <Link to={`/address/${tx.to}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 truncate">
                          {veroService.formatAddress(tx.to)}
                        </Link>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Contract Creation</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <Link to="/txs" className="block p-4 text-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
        View all transactions <ArrowRight className="inline w-4 h-4 ml-1" />
      </Link>
    </div>
  )
}

export default LatestTransactions

