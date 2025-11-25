
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, Clock, Zap, Hash, User, Shield, FileText, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import veroService from '../../services/veroService'

const TransactionDetail = () => {
  const { txHash } = useParams()
  const [copied, setCopied] = useState('')
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previousTx, setPreviousTx] = useState(null)
  const [nextTx, setNextTx] = useState(null)
  const [loadingNav, setLoadingNav] = useState(false)

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching transaction:', txHash)
      const txData = await veroService.getTransaction(txHash)
      console.log('Transaction data:', txData)
      
      if (!txData) {
        throw new Error('Transaction not found. It may still be pending or not yet mined.')
      }
      const receipt = await veroService.getTransactionReceipt(txHash)
      const blockInfo = await veroService.getBlock(txData.blockNumber, false)
      const gasUsed = receipt ? receipt.gasUsed : txData.gas
      const gasPriceHex = txData.gasPrice || '0x0'
      const feeWei = BigInt(gasUsed) * BigInt(parseInt(gasPriceHex, 16))
      const feeHex = '0x' + feeWei.toString(16)
      setTransaction({
        ...txData,
        gasUsed,
        timestamp: blockInfo ? blockInfo.timestamp : undefined,
        feeHex,
      })

      // جلب Previous و Next Transaction
      fetchNavigationTransactions(txData.blockNumber, txData.transactionIndex)
    } catch (err) {
      console.error('Failed to fetch transaction:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchNavigationTransactions = async (blockNumber, txIndex) => {
    try {
      setLoadingNav(true)
      
      // جلب البلوك الحالي مع جميع المعاملات
      const currentBlock = await veroService.getBlock(blockNumber, true)
      
      if (currentBlock && currentBlock.transactions) {
        // Previous Transaction (في نفس البلوك)
        if (txIndex > 0) {
          const prevTxData = currentBlock.transactions[txIndex - 1]
          if (prevTxData) {
            const prevHash = typeof prevTxData === 'string' ? prevTxData : prevTxData.hash
            setPreviousTx(prevHash)
          }
        } else {
          // إذا كانت أول معاملة في البلوك، جلب آخر معاملة من البلوك السابق
          if (blockNumber > 0) {
            const prevBlock = await veroService.getBlock(blockNumber - 1, true)
            if (prevBlock && prevBlock.transactions && prevBlock.transactions.length > 0) {
              const lastTx = prevBlock.transactions[prevBlock.transactions.length - 1]
              const lastHash = typeof lastTx === 'string' ? lastTx : lastTx.hash
              setPreviousTx(lastHash)
            }
          }
        }

        // Next Transaction (في نفس البلوك)
        if (txIndex < currentBlock.transactions.length - 1) {
          const nextTxData = currentBlock.transactions[txIndex + 1]
          if (nextTxData) {
            const nextHash = typeof nextTxData === 'string' ? nextTxData : nextTxData.hash
            setNextTx(nextHash)
          }
        } else {
          // إذا كانت آخر معاملة في البلوك، جلب أول معاملة من البلوك التالي
          try {
            const nextBlock = await veroService.getBlock(blockNumber + 1, true)
            if (nextBlock && nextBlock.transactions && nextBlock.transactions.length > 0) {
              const firstTx = nextBlock.transactions[0]
              const firstHash = typeof firstTx === 'string' ? firstTx : firstTx.hash
              setNextTx(firstHash)
            }
          } catch (err) {
            // البلوك التالي غير موجود بعد
            console.log('Next block not found yet')
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch navigation transactions:', err)
    } finally {
      setLoadingNav(false)
    }
  }

  const intervalRef = useRef(null)

  useEffect(() => {
    if (txHash) {
      fetchTransaction()
      intervalRef.current = setInterval(() => {
        fetchTransaction()
      }, 10000) // كل 10 ثواني
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }, [txHash])

  useEffect(() => {
    if ((transaction || error) && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [transaction, error])

  const handleRefresh = () => {
    fetchTransaction()
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors p-6">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="card p-6 mb-6 dark:bg-black dark:border-gray-800 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6 dark:bg-black dark:border-gray-800 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="card p-6 dark:bg-black dark:border-gray-800 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors p-6">
        <div className="container max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-red-600 dark:text-red-400 text-xl font-medium">Error: {error}</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Failed to load transaction details.</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="inline w-4 h-4 mr-2" /> Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors p-6">
        <div className="container max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-xl font-medium">Transaction not found.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The transaction hash you entered does not exist.</p>
          <Link 
            to="/txs"
            className="mt-4 inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Transactions
          </Link>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transaction Details</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2 min-w-0">
                {/* <span className="flex-shrink-0">Transaction hash:</span> */}
                {/* <div className="flex-1 min-w-0">
                  <code
                    className="block bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-gray-100 truncate"
                    title={transaction.hash}
                  >
                    {transaction.hash}
                  </code>
                </div> */}
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Transaction Hash */}
        <div className="card p-6 mb-6 dark:bg-black dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transaction Hash</h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <code className="block text-sm bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded font-mono text-gray-900 dark:text-gray-100 truncate" title={transaction.hash}>
                {transaction.hash}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(transaction.hash, 'hash')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy transaction hash"
            >
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {copied === 'hash' && (
              <span className="text-sm text-green-600 dark:text-green-400">Copied!</span>
            )}
          </div>
        </div>

        {/* Transaction Status */}
        <div className="card p-6 mb-6 dark:bg-black dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transaction Status</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Success
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Confirmed in Block #{transaction.blockNumber}
            </span>
          </div>
        </div>

        {/* Transaction Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* From */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">From</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/address/${transaction.from}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono"
                  >
                    {veroService.formatAddress(transaction.from)}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(transaction.from, 'from')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  Account
                </span>
              </div>
            </div>
          </div>

          {/* To */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <ArrowDownLeft className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">To</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                {transaction.to ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/address/${transaction.to}`}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono"
                    >
                      {veroService.formatAddress(transaction.to)}
                    </Link>
                    <button
                      onClick={() => copyToClipboard(transaction.to, 'to')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Contract Creation</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  {transaction.to ? 'Account' : 'Contract'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Value & Fee */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Value & Fee</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Value:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {veroService.formatWeiToEther(transaction.value)} VERO
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Fee:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {veroService.formatWeiToEther(transaction.feeHex)} VERO
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gas Information */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Gas Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gas Price:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {((parseInt(transaction.gasPrice || '0x0', 16) / 1e9).toFixed(2))} Gwei
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gas Limit:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {transaction.gas.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gas Used:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {transaction.gasUsed ? transaction.gasUsed.toLocaleString() : transaction.gas.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Nonce:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {transaction.nonce}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card p-6 dark:bg-black dark:border-gray-800 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Additional Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Block:</span>
              <Link 
                to={`/block/${transaction.blockNumber}`}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                #{transaction.blockNumber}
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Timestamp:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(transaction.timestamp * 1000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Age:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {veroService.formatTime(transaction.timestamp)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Position:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {transaction.transactionIndex}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Method:</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                Transfer
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                Legacy
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          {previousTx ? (
            <Link 
              to={`/tx/${previousTx}`}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Transaction
            </Link>
          ) : (
            <button 
              disabled
              className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
              title="No previous transaction"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Transaction
            </button>
          )}

          <Link 
            to="/txs"
            className="btn-secondary flex items-center gap-2"
          >
            All Transactions
          </Link>

          {nextTx ? (
            <Link 
              to={`/tx/${nextTx}`}
              className="btn-secondary flex items-center gap-2"
            >
              Next Transaction
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button 
              disabled
              className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
              title="No next transaction (latest transaction)"
            >
              Next Transaction
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionDetail
