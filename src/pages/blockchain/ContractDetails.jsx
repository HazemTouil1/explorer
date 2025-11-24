import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, Clock, Zap, Hash, User, Shield, FileText, ArrowRight, ArrowLeft, DollarSign, TrendingUp, Star, MoreHorizontal, Plus, Coins, Download, Users, Activity, RefreshCw, AlertCircle } from 'lucide-react'
import veroService from '../../services/veroService'

const ContractDetails = () => {
  const { address } = useParams()
  const [copied, setCopied] = useState('')
  const [showTokenDropdown, setShowTokenDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')
  const dropdownRef = useRef(null)
  
  // State for real data
  const [contractData, setContractData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [tokenTransfers, setTokenTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch contract data from Vero network
  const fetchContractData = async () => {
    if (!address) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Check if address is a contract
      const isContract = await veroService.isContract(address)
      
      if (!isContract) {
        throw new Error('Address is not a smart contract')
      }
      
      // Get contract balance
      const balance = await veroService.getBalance(address)
      
      // Get transaction count
      const transactionCount = await veroService.getTransactionCount(address)
      
      // Get address transactions
      const addressTransactions = await veroService.getAddressTransactions(address, 50)
      
      // Try to get token information (if it's an ERC-20 token)
      let tokenInfo = null
      try {
        const name = await veroService.getTokenName(address)
        const symbol = await veroService.getTokenSymbol(address)
        const decimals = await veroService.getTokenDecimals(address)
        
        if (name && symbol) {
          tokenInfo = { name, symbol, decimals }
        }
      } catch (err) {
        // Not a token contract, that's okay
      }
      
      // Get token transfers for this contract
      const allTokenTransfers = await veroService.getTokenTransfers(100)
      const contractTokenTransfers = allTokenTransfers.filter(transfer => 
        transfer.tokenAddress?.toLowerCase() === address.toLowerCase()
      )
      
      setContractData({
        address: address,
        balance: balance,
        transactionCount: transactionCount,
        isContract: true,
        verified: true, // In local network, consider all contracts verified
        tokenInfo: tokenInfo,
        firstSeen: addressTransactions.length > 0 ? 
          veroService.formatTime(addressTransactions[addressTransactions.length - 1].timestamp) : 'Unknown',
        lastSeen: addressTransactions.length > 0 ? 
          veroService.formatTime(addressTransactions[0].timestamp) : 'Unknown'
      })
      
      setTransactions(addressTransactions)
      setTokenTransfers(contractTokenTransfers)
      
    } catch (err) {
      console.error('Failed to fetch contract data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      fetchContractData()
    }
  }, [address])

  const handleRefresh = () => {
    fetchContractData()
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTokenDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Contract Details</h1>
            </div>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Contract Details</h1>
            </div>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Failed to load contract
                </h3>
                <p className="text-red-600 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No contract data
  if (!contractData) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Contract Details</h1>
            </div>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No contract data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Unable to load contract information for this address.
            </p>
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
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Contract Details</h1>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Contract Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {contractData.tokenInfo ? contractData.tokenInfo.name : 'Smart Contract'}
                </h2>
                {contractData.tokenInfo && (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500 dark:text-gray-400">
                      {contractData.tokenInfo.symbol} • ERC-20 Token
                    </p>
                    <Link
                      to={`/token/${contractData.tokenInfo.symbol}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm underline"
                    >
                      View Token Details
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {contractData.address}
                  </span>
                  <button
                    onClick={() => copyToClipboard(contractData.address, 'address')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copied === 'address' && (
                    <span className="text-xs text-green-500">Copied!</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contractData.verified && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full">
                  ✓ Verified
                </span>
              )}
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                Contract
              </span>
            </div>
          </div>
        </div>

        {/* Contract Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {veroService.formatWeiToEther(contractData.balance)} VERO
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {contractData.transactionCount}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">First Seen</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {contractData.firstSeen}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Seen</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {contractData.lastSeen}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Transactions ({transactions.length})
              </button>
              {contractData.tokenInfo && (
                <button
                  onClick={() => setActiveTab('transfers')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'transfers'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Token Transfers ({tokenTransfers.length})
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                  </div>
                ) : (
                  transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <Link
                            to={`/tx/${tx.hash}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm"
                          >
                            {veroService.formatHash(tx.hash)}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Block {tx.blockNumber} • {veroService.formatTime(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {veroService.formatWeiToEther(tx.value)} VERO
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          From {veroService.formatAddress(tx.from)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'transfers' && contractData.tokenInfo && (
              <div className="space-y-4">
                {tokenTransfers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No token transfers found</p>
                  </div>
                ) : (
                  tokenTransfers.map((transfer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <Link
                            to={`/tx/${transfer.txHash}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm"
                          >
                            {veroService.formatHash(transfer.txHash)}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Block {transfer.blockNumber} • {veroService.formatTime(transfer.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {transfer.amount} {contractData.tokenInfo.symbol}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          From {veroService.formatAddress(transfer.from)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractDetails