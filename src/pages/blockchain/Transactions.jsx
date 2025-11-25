import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, ChevronLeft, ChevronRight, Eye, Copy, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import veroService from '../../services/veroService'

const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentBlock, setCurrentBlock] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const itemsPerPage = 25
  const [notice, setNotice] = useState('')

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const latestBlock = await veroService.getCurrentBlockNumber()
      setCurrentBlock(latestBlock)

      const totalTxCount = await veroService.getTotalTransactionsCount()
      setTotalTransactions(totalTxCount)
      const totalPagesCount = Math.max(1, Math.ceil(totalTxCount / itemsPerPage))
      setTotalPages(totalPagesCount)
      
      // Fetch latest transactions
      const latestTransactions = await veroService.getLatestTransactions(itemsPerPage)
      setTransactions(latestTransactions)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleRefresh = () => {
    fetchTransactions(currentPage)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  const downloadPageData = () => {
    if (!transactions || transactions.length === 0) {
      showNotice('No data to download in this section')
      return
    }
    const payload = {
      tab: 'transactions',
      page: currentPage,
      itemsPerPage,
      currentBlock,
      count: transactions.length,
      data: transactions.map((tx) => ({
        hash: tx.hash,
        block: tx.blockNumber,
        age: veroService.formatTime(tx.timestamp),
        from: tx.from,
        to: tx.to || null,
        valueVERO: veroService.formatWeiToEther(tx.value),
        gas: tx.gas
      }))
    }
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-page-${currentPage}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mock data for fallback (will be removed once we have real data)


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
      {/* <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Latest transactions on the Vero Network blockchain
            </p>
          </div>
        </div>
     

      </div> */}

      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
              <div className="container max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                 <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Latest transactions on the Vero Network blockchain
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
       
        

        {/* Transactions Table */}
        <div className="card overflow-hidden w-full">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                  {loading ? 'Loading transactions...' : 
                   error ? 'Failed to load transactions' : 
                   `Total ${totalTransactions.toLocaleString()} transactions`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Please wait...' : 
                   error ? error : 
                   `(Showing ${transactions.length} transactions on page ${currentPage})`}
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
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(1)}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="btn-secondary text-xs sm:text-sm flex items-center gap-2">
                    Page {currentPage} of {totalPages.toLocaleString()} (Total {totalTransactions.toLocaleString()})
                  </span>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => handlePageChange(totalPages)}
                    className="btn-secondary text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
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
                    <Eye className="w-4 h-4" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Transaction Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Block
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    From
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Gas Used
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
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
                        <p className="font-medium">Failed to load transactions</p>
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
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <p className="font-medium">No transactions found</p>
                        <p className="text-sm mt-1">The network might be starting up</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                        <Link
                          to={`/tx/${tx.hash}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tx/${tx.hash}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono text-sm truncate max-w-[120px]"
                          >
                            {veroService.formatHash(tx.hash, 8)}
                        </Link>
                        <button
                          onClick={() => copyToClipboard(tx.hash)}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                          to={`/block/${tx.blockNumber}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                      >
                          {tx.blockNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {veroService.formatTime(tx.timestamp)}
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
                    <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-full">
                        <ArrowRight className="w-3.5 h-3.5" />
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
                    <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {tx.gas.toLocaleString()}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-center gap-1">
              <button
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white">
                Page {currentPage} of {totalPages.toLocaleString()}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300"
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

export default Transactions

