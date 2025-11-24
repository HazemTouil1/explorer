import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy, FileText, Wallet, RefreshCw, TrendingUp } from 'lucide-react'
import veroService from '../../services/veroService'

const TopAccounts = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [topAccounts, setTopAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTopAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const accounts = await veroService.getTopAccounts(rowsPerPage)
      setTopAccounts(accounts)
      setTotalPages(Math.ceil(accounts.length / rowsPerPage))
    } catch (err) {
      console.error('Failed to fetch top accounts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopAccounts()
  }, [rowsPerPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleRefresh = () => {
    fetchTopAccounts()
  }
  
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const displayedAccounts = topAccounts.slice(startIndex, endIndex)
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }


  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
      {/* Page Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Top Accounts by VERO Balance</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {loading ? 'Loading top accounts...' : 
                 error ? 'Failed to load top accounts' : 
                 topAccounts.length === 0 ? 'No accounts found' :
                 `${topAccounts.length} accounts found`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              i
            </div>
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">About Top Accounts</p>
              <p className="text-blue-700 dark:text-blue-300">
                This page shows the top accounts by VERO balance on the Vero Network. 
                The ranking is based on the current balance of each account from recent transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Top Accounts Table */}
        <div className="card overflow-hidden w-full">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {loading ? 'Loading...' : 
                   error ? 'Failed to load' : 
                   `Top ${topAccounts.length} accounts by balance`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Please wait...' : 
                   error ? error : 
                   `Showing page ${currentPage} of ${totalPages}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
             
                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    First
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="btn-secondary text-sm flex items-center gap-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-16">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Name Tag
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Percentage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Txn Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8 mx-auto"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="text-red-600 dark:text-red-400">
                        <p className="font-medium">Failed to load top accounts</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button 
                          onClick={handleRefresh}
                          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : topAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium">No accounts found</p>
                        <p className="text-sm mt-1">No accounts with balances found in recent transactions</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedAccounts.map((account, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-center text-sm dark:text-gray-100 text-gray-500 font-medium">
                        {account.rank}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {account.isContract ? (
                            <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" title="Contract" />
                          ) : (
                            <Wallet className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" title="EOA" />
                          )}
                          <Link
                            to={`/address/${account.address}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono text-sm"
                            title={account.address}
                          >
                            {veroService.formatAddress(account.address)}
                          </Link>
                          <button
                            onClick={() => copyToClipboard(account.address)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {account.nameTag || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-gray-100 font-medium">
                            {account.balanceFormatted} VERO
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {account.percentage}
                          </span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-primary-500 h-1.5 rounded-full" 
                              style={{ width: '0%' }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {account.transactionCount || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {/* <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
           
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show rows:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

           
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-white"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-white"
                >
                  Last
                </button>
              </div>
            </div>
          </div> */}
        </div>

        {/* Additional Info */}
        <div className="mt-6 card p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-2xl">💡</div>
            <div className="text-sm text-gray-600 dark:text-gray-100">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Understanding the Rankings:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Rank:</strong> Position based on Vero balance (highest to lowest)</li>
                <li><strong>Address:</strong> Vero address - can be EOA or Contract</li>
                <li><strong>Contract Icon:</strong> 📄 indicates a smart contract address</li>
                <li><strong>Wallet Icon:</strong> 👛 indicates an externally owned account (EOA)</li>
                <li><strong>Name Tag:</strong> Public label for known addresses (exchanges, protocols, etc.)</li>
                <li><strong>Balance:</strong> Total Vero held by the address</li>
                <li><strong>Percentage:</strong> Share of total Vero supply (visual bar included)</li>
                <li><strong>Txn Count:</strong> Total number of transactions involving this address</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Note about Exchanges */}
        {/* <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-xl">⚠️</div>
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">Note about Exchange Addresses:</p>
              <p className="text-yellow-700">
                Many top addresses belong to centralized exchanges (Binance, Kraken, Coinbase, etc.) 
                holding ETH on behalf of their users. These are custodial wallets, not individual holdings.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default TopAccounts

