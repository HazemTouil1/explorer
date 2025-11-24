import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Copy, ExternalLink, Box, Clock, Zap, Hash, User, ArrowLeft, RefreshCw } from 'lucide-react'
import veroService from '../../services/veroService'

const BlockTransactions = () => {
  const { blockNumber } = useParams()
  const [searchParams] = useSearchParams()
  const [copied, setCopied] = useState('')
  const [block, setBlock] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const fetchBlockTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let blockData
      // تحقق إذا كان blockNumber هو hash أم رقم
      if (blockNumber.startsWith('0x')) {
        // Block Hash
        blockData = await veroService.getBlockByHash(blockNumber, true)
      } else {
        // Block Number
        blockData = await veroService.getBlock(parseInt(blockNumber), true)
      }
      
      if (!blockData) {
        throw new Error('Block not found')
      }
      
      setBlock(blockData)
      
      // Fetch all transactions
      if (blockData.transactions && blockData.transactions.length > 0) {
        setLoadingTransactions(true)
        const txPromises = blockData.transactions.map((txEntry) => {
          if (typeof txEntry === 'string') {
            return veroService.getTransaction(txEntry)
          }
          if (txEntry && txEntry.hash) {
            return Promise.resolve({
              hash: txEntry.hash,
              blockNumber: parseInt(txEntry.blockNumber, 16),
              blockHash: txEntry.blockHash,
              from: txEntry.from,
              to: txEntry.to,
              value: txEntry.value,
              gas: parseInt(txEntry.gas, 16),
              gasPrice: txEntry.gasPrice,
              nonce: parseInt(txEntry.nonce, 16),
              input: txEntry.input,
              transactionIndex: parseInt(txEntry.transactionIndex, 16),
            })
          }
          return Promise.resolve(null)
        })
        const txData = await Promise.all(txPromises)
        setTransactions(txData.filter(tx => tx !== null))
        setLoadingTransactions(false)
      }
    } catch (err) {
      console.error('Failed to fetch block transactions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchBlockTransactions()
  }

  useEffect(() => {
    if (blockNumber) {
      fetchBlockTransactions()
    }
  }, [blockNumber])

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <Box className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Block</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
      {/* Page Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/block/${blockNumber}`}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Block
              </Link>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Block #{block?.number} Transactions
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loadingTransactions}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTransactions ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Block Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Block Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Block Number</p>
              <p className="font-mono text-gray-900 dark:text-gray-100">#{block?.number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Block Hash</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">
                  {veroService.formatHash(block?.hash)}
                </p>
                <button
                  onClick={() => copyToClipboard(block?.hash, 'hash')}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Copy block hash"
                >
                  <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                {copied === 'hash' && (
                  <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{block?.transactionCount}</p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Transactions ({transactions.length})
            </h2>
          </div>

          {loadingTransactions ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((tx, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/tx/${tx.hash}`}
                            className="font-mono text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            {veroService.formatHash(tx.hash)}
                          </Link>
                          <button
                            onClick={() => copyToClipboard(tx.hash, `tx-${index}`)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy transaction hash"
                          >
                            <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </button>
                          {copied === `tx-${index}` && (
                            <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>From: {veroService.formatAddress(tx.from)}</span>
                          <span>To: {veroService.formatAddress(tx.to)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {veroService.formatWeiToEther(tx.value)} VERO
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Gas: {(tx.gasUsed ?? tx.gas)?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Box className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No transactions found in this block</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlockTransactions
