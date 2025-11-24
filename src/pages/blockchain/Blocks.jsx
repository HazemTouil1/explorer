import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, ChevronLeft, ChevronRight, Copy, Box, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import veroService from '../../services/veroService'

const Blocks = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentBlock, setCurrentBlock] = useState(0)
  const itemsPerPage = 25
  const [notice, setNotice] = useState('')

  const fetchBlocks = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Get current block number
      const latestBlock = await veroService.getCurrentBlockNumber()
      setCurrentBlock(latestBlock)
      
      // Calculate total pages
      const totalPagesCount = Math.ceil(latestBlock / itemsPerPage)
      setTotalPages(totalPagesCount)
      
      // Calculate block range for current page
      const startBlock = latestBlock - ((page - 1) * itemsPerPage)
      const endBlock = Math.max(0, startBlock - itemsPerPage + 1)
      
      // Fetch blocks
      const blocksData = []
      for (let blockNum = startBlock; blockNum >= endBlock; blockNum--) {
        const block = await veroService.getBlock(blockNum, false)
        if (block) {
          blocksData.push(block)
        }
      }
      
      setBlocks(blocksData)
    } catch (err) {
      console.error('Failed to fetch blocks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocks(currentPage)
  }, [currentPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleRefresh = () => {
    fetchBlocks(currentPage)
  }

  // Mock data for fallback (will be removed once we have real data)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  const downloadPageData = () => {
    if (!blocks || blocks.length === 0) {
      showNotice('No data to download in this section')
      return
    }
    const payload = {
      tab: 'blocks',
      page: currentPage,
      itemsPerPage,
      currentBlock,
      count: blocks.length,
      data: blocks.map((block) => ({
        number: block.number,
        hash: block.hash,
        age: veroService.formatTime(block.timestamp),
        transactionCount: block.transactionCount,
        miner: block.miner,
        gasUsed: block.gasUsed,
        gasLimit: block.gasLimit,
        size: block.size
      }))
    }
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blocks-page-${currentPage}.json`
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Blocks</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Latest blocks on the Vero Network blockchain
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
        {/* Stats Cards */}
       

        {/* Blocks Table */}
        <div className="card overflow-hidden w-full">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {loading ? 'Loading blocks...' : 
                   error ? 'Failed to load blocks' : 
                   `More than ${currentBlock.toLocaleString()} blocks found`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Please wait...' : 
                   error ? error : 
                   `(Showing ${blocks.length} blocks on page ${currentPage})`}
                </p>
              </div>

              <div className="flex items-center gap-2">
               

                <button onClick={downloadPageData} className="btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Page Data
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(1)}
                    className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="btn-secondary text-sm flex items-center gap-2">
                    Page {currentPage} of {totalPages.toLocaleString()}
                  </span>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => handlePageChange(totalPages)}
                    className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
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
                    Block
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Txn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Miner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Gas Used
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Gas Limit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Size
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="text-red-600 dark:text-red-400">
                        <p className="font-medium">Failed to load blocks</p>
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
                ) : blocks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <p className="font-medium">No blocks found</p>
                        <p className="text-sm mt-1">The network might be starting up</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  blocks.map((block, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/block/${block.number}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          {block.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-100 font-mono">
                            {veroService.formatHash(block.hash, 8)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(block.hash)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {veroService.formatTime(block.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/txs?block=${block.number}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                        >
                          {block.transactionCount}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/address/${block.miner}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm truncate max-w-[120px]"
                          >
                            {veroService.formatAddress(block.miner)}
                          </Link>
                          <button
                            onClick={() => copyToClipboard(block.miner)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-gray-100">
                            {block.gasUsed.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {((block.gasUsed / block.gasLimit) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {block.gasLimit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {block.size.toLocaleString()} bytes
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
                Page {currentPage} of {totalPages.toLocaleString()}
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

        {/* Additional Info */}
        <div className="mt-6 card p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-2xl">💡</div>
            <div className="text-sm text-gray-600 dark:text-gray-100">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Block Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Block:</strong> A collection of transactions grouped together and added to the blockchain</li>
                <li><strong>Slot:</strong> The position in the Beacon Chain (12 seconds per slot)</li>
                <li><strong>Epoch:</strong> A group of 32 slots (approximately 6.4 minutes)</li>
                <li><strong>Blobs:</strong> Number of data blobs in the block (EIP-4844)</li>
                <li><strong>Fee Recipient:</strong> The address that receives block rewards and transaction fees</li>
                <li><strong>Base Fee:</strong> The minimum fee required per unit of gas (EIP-1559)</li>
                <li><strong>Burnt Fees:</strong> ETH permanently removed from circulation (EIP-1559)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blocks

