import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Copy, ExternalLink, Box, Clock, Zap, Hash, User, Shield, FileText, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import veroService from '../../services/veroService'

const BlockDetail = () => {
  const { blockNumber } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState('')
  const [block, setBlock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const fetchBlock = async () => {
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
      
      // Fetch transactions if any
      if (blockData.transactions && blockData.transactions.length > 0) {
        setLoadingTransactions(true)
        const txPromises = blockData.transactions.slice(0, 10).map((txEntry) => {
          const hash = typeof txEntry === 'string' ? txEntry : (txEntry && txEntry.hash) ? txEntry.hash : txEntry
          return hash ? veroService.getTransaction(hash) : Promise.resolve(null)
        })
        const txData = await Promise.all(txPromises)
        setTransactions(txData.filter(tx => tx !== null))
        setLoadingTransactions(false)
      }
    } catch (err) {
      console.error('Failed to fetch block:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (blockNumber) {
      fetchBlock()
    }
  }, [blockNumber])

  const handleRefresh = () => {
    fetchBlock()
  }

  const handlePreviousBlock = () => {
    if (block && block.number > 0) {
      navigate(`/block/${block.number - 1}`)
    }
  }

  const handleNextBlock = () => {
    if (block) {
      navigate(`/block/${block.number + 1}`)
    }
  }

  // Mock data for fallback (will be removed once we have real data)

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Block Details</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Loading block #{blockNumber}...
            </p>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Block Details</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Block #{blockNumber}
            </p>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="card p-6 dark:bg-black dark:border-gray-800 text-center">
            <div className="text-red-600 dark:text-red-400">
              <p className="font-medium text-lg">Failed to load block</p>
              <p className="text-sm mt-2">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!block) {
  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Block Details</h1>
          </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Block #{blockNumber}
            </p>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="card p-6 dark:bg-black dark:border-gray-800 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="font-medium text-lg">Block not found</p>
              <p className="text-sm mt-2">The requested block does not exist</p>
            </div>
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Block Details</h1>
                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Block #{block.number}
              </p>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousBlock}
                disabled={block.number === 0}
                className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNextBlock}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Block Hash */}
        <div className="card p-6 mb-6 dark:bg-black dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Block Hash</h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="text-sm bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded font-mono text-gray-900 dark:text-gray-100">
              {block.hash}
            </code>
            <button
              onClick={() => copyToClipboard(block.hash, 'hash')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy block hash"
            >
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {copied === 'hash' && (
              <span className="text-sm text-green-600 dark:text-green-400">Copied!</span>
            )}
          </div>
        </div>

        {/* Block Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Basic Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Block Number:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  #{block.number}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Timestamp:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(block.timestamp * 1000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Age:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {veroService.formatTime(block.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Size:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {block.size.toLocaleString()} bytes
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {block.difficulty || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Parent Hash:</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/block/${block.number - 1}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono"
                  >
                    {veroService.formatHash(block.parentHash, 8)}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(block.parentHash, 'parent')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Miner Information */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Miner</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/address/${block.miner}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono"
                  >
                    {veroService.formatAddress(block.miner)}
                  </Link>
                <button
                    onClick={() => copyToClipboard(block.miner, 'miner')}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  Validator
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Network:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  Vero Network
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gas Information */}
        <div className="card p-6 mb-6 dark:bg-black dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Gas Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {block.gasUsed.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gas Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {block.gasLimit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gas Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {((block.gasUsed / block.gasLimit) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gas Used %</div>
            </div>
              </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${(block.gasUsed / block.gasLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Transactions & Network Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Transactions */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transactions</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Count:</span>
                <Link 
                  to={`/block/${block.number}/transactions`}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  {block.transactionCount} transactions
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Block Size:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {block.size.toLocaleString()} bytes
                </span>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Network Info</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Network:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  Vero Network
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Chain ID:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  808
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Consensus:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  QBFT
                </span>
                  </div>
                  </div>
                </div>
              </div>

        {/* Transactions in Block */}
        {block.transactionCount > 0 && (
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Transactions in Block
                </h2>
              </div>
              <Link
                to={`/block/${block.number}/transactions`}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all {block.transactionCount} transactions
              </Link>
            </div>
            
            {loadingTransactions ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                        <div>
                          <Link
                            to={`/tx/${tx.hash}`}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono"
                          >
                            {veroService.formatHash(tx.hash, 8)}
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            From: {veroService.formatAddress(tx.from)}
                            {tx.to && ` → To: ${veroService.formatAddress(tx.to)}`}
                  </div>
                </div>
              </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {veroService.formatWeiToEther(tx.value)} VERO
                  </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Gas: {tx.gas.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No transactions found in this block</p>
          </div>
            )}
        </div>
        )}

        {/* Additional Information */}
        <div className="card p-6 dark:bg-black dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Additional Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Parent Hash:</span>
              <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-gray-100">
                {veroService.formatHash(block.parentHash, 8)}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Nonce:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                0x0000000000000000
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Extra Data:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                0x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockDetail
