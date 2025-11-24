import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, Clock, Zap, Hash, User, Shield, FileText, ArrowRight, ArrowLeft } from 'lucide-react'

const PendingTransactionDetail = () => {
  const { hash } = useParams()
  const [copied, setCopied] = useState('')

  // بيانات وهمية للمعاملة المعلقة
  const transaction = {
    hash: hash || '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    status: 'Pending',
    from: {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      label: 'Binance 14'
    },
    to: {
      address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
      label: 'Uniswap V3: Router'
    },
    value: '1.23456',
    valueUSD: '$5,123.45',
    gasPrice: '20.5',
    gasLimit: '21000',
    gasUsed: '21000',
    gasUsedPercent: '100%',
    baseFeePerGas: '15.000000000',
    maxFeePerGas: '25.5',
    maxPriorityFeePerGas: '2.0',
    transactionFee: '0.0004305',
    transactionFeeUSD: '$1.78',
    nonce: '12345',
    method: 'Transfer',
    type: 'Legacy',
    timestamp: '2025-01-15 12:39:35',
    age: '2 mins 15 secs ago',
    previousHash: '0x0a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789',
    nextHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab'
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
      {/* Page Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pending Transaction Details</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
              Pending
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-100 mt-1">
            Transaction Hash: {transaction.hash}
          </p>
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
            <code className="text-sm bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded font-mono text-gray-900 dark:text-gray-100">
              {transaction.hash}
            </code>
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

        {/* Transaction Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* From Address */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">From</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-100">Address:</span>
                <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-gray-100">
                  {transaction.from.address}
                </code>
                <button
                  onClick={() => copyToClipboard(transaction.from.address, 'from')}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-100">Label:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {transaction.from.label}
                </span>
              </div>
            </div>
          </div>

          {/* To Address */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <ArrowDownLeft className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">To</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-100">Address:</span>
                <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-gray-100">
                  {transaction.to.address}
                </code>
                <button
                  onClick={() => copyToClipboard(transaction.to.address, 'to')}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-100">Label:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {transaction.to.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Value & Fee Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Value */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Value</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-100">Amount:</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {transaction.value} ETH
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-100">
                    {transaction.valueUSD}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Fee */}
          <div className="card p-6 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transaction Fee</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-100">Fee:</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {transaction.transactionFee} ETH
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-100">
                    {transaction.transactionFeeUSD}
                  </div>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {transaction.gasPrice}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-100">Gas Price (Gwei)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {transaction.gasLimit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-100">Gas Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {transaction.maxFeePerGas}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-100">Max Fee (Gwei)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {transaction.maxPriorityFeePerGas}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-100">Max Priority Fee (Gwei)</div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card p-6 dark:bg-black dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Additional Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-100">Status:</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                {transaction.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-100">Timestamp:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {transaction.timestamp}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-100">Age:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {transaction.age}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-100">Nonce:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {transaction.nonce}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-100">Method:</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                {transaction.method}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-100">Type:</span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                {transaction.type}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Status Warning */}
        <div className="card p-6 mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Transaction Pending</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This transaction is currently pending and has not been included in a block yet. 
                It may take a few minutes to be confirmed depending on network congestion.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Link 
            to={`/tx/${transaction.previousHash}`}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Transaction
          </Link>
          <Link 
            to={`/tx/${transaction.nextHash}`}
            className="btn-secondary flex items-center gap-2"
          >
            Next Transaction
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PendingTransactionDetail
