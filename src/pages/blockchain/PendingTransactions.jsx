import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, ChevronLeft, ChevronRight, Copy, ArrowRight, RefreshCw, Clock, Zap, AlertCircle } from 'lucide-react'
import veroService from '../../services/veroService'

const PendingTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 25
  const [notice, setNotice] = useState('')

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const poolTransactions = await veroService.getPendingTransactions(itemsPerPage)
      setPendingTransactions(poolTransactions)
      setTotalPages(1)
    } catch (err) {
      console.error('Failed to fetch pending transactions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingTransactions()
  }, [currentPage])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchPendingTransactions, 5000) // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleRefresh = () => {
    fetchPendingTransactions()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  const downloadPageData = () => {
    if (!pendingTransactions || pendingTransactions.length === 0) {
      showNotice('No data to download in this section')
      return
    }
    const payload = {
      tab: 'pending-transactions',
      page: currentPage,
      itemsPerPage,
      count: pendingTransactions.length,
      data: pendingTransactions.map((tx) => ({
        hash: tx.hash || null,
        method: tx.input && tx.input !== '0x' ? 'Contract Call' : '—',
        nonce: tx.nonce ?? null,
        lastSeen: tx.timestamp ? veroService.formatTime(tx.timestamp) : null,
        gasLimit: tx.gas ?? null,
        gasPriceGwei: tx.gasPrice ? `${veroService.formatWeiToGwei(tx.gasPrice)} Gwei` : null,
        from: tx.from,
        to: tx.to ?? null,
        valueVERO: veroService.formatWeiToEther(tx.value)
      }))
    }
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pending-transactions-page-${currentPage}.json`
    a.click()
    URL.revokeObjectURL(url)
  }


  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
      {notice && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300 shadow-lg rounded-lg px-4 py-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{notice}</span>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pending Transactions</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {loading ? 'Loading pending transactions...' : 
                 error ? 'Failed to load pending transactions' : 
                 pendingTransactions.length === 0 ? 'No pending transactions found' :
                 `${pendingTransactions.length} pending transactions found`}
              </p>
            </div>
            
            {/* Auto-refresh Toggle */}
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
              <p className="font-medium mb-1">Vero Network uses QBFT consensus, so transactions are processed immediately.</p>
              <p className="text-blue-700 dark:text-blue-300">This page lists transactions currently in the txpool (pending/queued).</p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card overflow-hidden w-full">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                  {loading ? 'Loading...' : 
                   error ? 'Failed to load' : 
                   `${pendingTransactions.length} transactions found`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Please wait...' : 
                   error ? error : 
                   `Showing page ${currentPage} of ${totalPages}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button onClick={downloadPageData} className="btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Page Data
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    disabled={currentPage === 1}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2"
                  >
                    First
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="btn-secondary text-xs sm:text-sm flex items-center gap-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Transaction Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Nonce
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Last Seen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Gas Limit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Gas Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="text-red-600 dark:text-red-400">
                        <p className="font-medium">Failed to load pending transactions</p>
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
                ) : pendingTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium">No pending transactions found</p>
                        <p className="text-sm mt-1">All transactions are processed immediately on Vero Network</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingTransactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tx.hash ? (
                          <>
                            <Link
                              to={`/tx/${tx.hash}`}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono text-sm truncate max-w-[140px]"
                            >
                              {veroService.formatHash(tx.hash, 8)}
                            </Link>
                            <button
                              onClick={() => copyToClipboard(tx.hash)}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-800">
                          {tx.input && tx.input !== '0x' ? 'Contract Call' : '—'}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {tx.nonce || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {tx.timestamp ? veroService.formatTime(tx.timestamp) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {tx.gas ? tx.gas.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                          <div className="text-gray-900 dark:text-gray-100 font-medium">
                            {tx.gasPrice ? veroService.formatWeiToGwei(tx.gasPrice) + ' Gwei' : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                          <Link
                            to={`/address/${tx.from}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm truncate max-w-[120px]"
                        >
                            {veroService.formatAddress(tx.from)}
                          </Link>
                        <button
                            onClick={() => copyToClipboard(tx.from)}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                          {tx.to ? (
                            <>
                              <Link
                                to={`/address/${tx.to}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm truncate max-w-[120px]"
                        >
                                {veroService.formatAddress(tx.to)}
                              </Link>
                        <button
                                onClick={() => copyToClipboard(tx.to)}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Contract Creation</span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                          <div className="text-gray-900 dark:text-gray-100">
                            {veroService.formatWeiToEther(tx.value)} VERO
                          </div>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
        {/* <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-1">
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
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default PendingTransactions

