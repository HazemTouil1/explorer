import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, Clock, Zap, Hash, User, Shield, FileText, ArrowRight, ArrowLeft, DollarSign, TrendingUp, Star, MoreHorizontal, Plus, Coins, Download, RefreshCw, AlertCircle } from 'lucide-react'
import veroService from '../../services/veroService'

const AddressDetail = () => {
  const { address } = useParams()
  const [copied, setCopied] = useState('')
  const [showTokenDropdown, setShowTokenDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')
  const [addressData, setAddressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [notice, setNotice] = useState('')
  const dropdownRef = useRef(null)

  const fetchAddressData = async () => {
    try {
      setLoading(true)
      setError(null)
      setLoadingTransactions(true)
      
      // جلب بيانات العنوان
      const balance = await veroService.getBalance(address)
      const isContract = await veroService.isContract(address)
      
      // جلب معلومات العقد إذا كان عقد ذكي
      let contractName = ''
      if (isContract) {
        contractName = await veroService.getNFTName(address) || 'Unknown Contract'
      }
      
      setAddressData({
        address: address,
        type: isContract ? 'Contract' : 'EOA',
        balance: balance,
        balanceUSD: '$0.00', // سنحتاج لسعر VERO
        ethPrice: '$0.00',
        tokenBalance: '$0.00',
        tokenCount: 0,
        transactionCount: 0,
        firstSeen: 'Unknown',
        lastSeen: 'Unknown',
        isContract: isContract,
        contractName: contractName,
        contractDescription: '',
        verified: false,
        creator: '',
        creationTx: '',
        creationBlock: 0,
        multichainBalance: '$0.00',
        latestTx: '',
        firstTx: ''
      })
      
      setLoading(false)

      const addressTransactionsRaw = await veroService.getAddressTransactions(address, 50)
      const addressTransactions = await Promise.all(addressTransactionsRaw.map(async (tx) => {
        try {
          const receipt = await veroService.getTransactionReceipt(tx.hash)
          const gasUsed = receipt ? receipt.gasUsed : 0
          const gasPriceRaw = tx.gasPrice || '0x0'
          const gasPrice = typeof gasPriceRaw === 'string' && gasPriceRaw.startsWith('0x')
            ? parseInt(gasPriceRaw, 16)
            : parseInt(gasPriceRaw, 10)
          const feeWei = BigInt(gasUsed) * BigInt(isNaN(gasPrice) ? 0 : gasPrice)
          const feeHex = '0x' + feeWei.toString(16)
          return { ...tx, feeHex }
        } catch {
          return { ...tx, feeHex: '0x0' }
        }
      }))

      setTransactions(addressTransactions)
      setAddressData(prev => ({
        ...prev,
        transactionCount: addressTransactions.length,
        firstSeen: addressTransactions.length > 0 ? veroService.formatTime(addressTransactions[addressTransactions.length - 1].timestamp) : 'Unknown',
        lastSeen: addressTransactions.length > 0 ? veroService.formatTime(addressTransactions[0].timestamp) : 'Unknown',
        latestTx: addressTransactions.length > 0 ? addressTransactions[0].hash : '',
        firstTx: addressTransactions.length > 0 ? addressTransactions[addressTransactions.length - 1].hash : ''
      }))

    } catch (err) {
      console.error('Failed to fetch address data:', err)
      setError(err.message)
    } finally {
      setLoadingTransactions(false)
    }
  }

  // بيانات وهمية للتوكنات (فارغة لأن Vero لا يدعم ERC-20 tokens حالياً)
  const tokenHoldings = []

  // بيانات وهمية للتحليلات
  const analyticsData = {
    totalTransactions: addressData?.transactionCount || 0,
    totalTokenTransfers: 0,
    totalNftTransfers: 0,
    firstTransaction: addressData?.firstSeen || 'Unknown',
    lastTransaction: addressData?.lastSeen || 'Unknown',
    gasUsed: '0 VERO',
    uniqueAddresses: 0
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const formatBalance = (balance) => {
    return veroService.formatWeiToEther(balance)
  }

  const getAddressTypeIcon = (type) => {
    return type === 'Contract' ? <FileText className="w-4 h-4" /> : <User className="w-4 h-4" />
  }

  const getAddressTypeColor = (type) => {
    return type === 'Contract' 
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
  }

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  const downloadPageData = () => {
    if (activeTab === 'transactions' && transactions.length === 0) {
      showNotice('No data to download in this section')
      return
    }
    if (activeTab === 'token-transfers') {
      showNotice('No data to download in this section')
      return
    }
    if (activeTab === 'nft-transfers') {
      showNotice('No data to download in this section')
      return
    }
    let payload = {}
    if (activeTab === 'transactions') {
      payload = {
        address: addressData.address,
        tab: 'transactions',
        count: transactions.length,
        data: transactions.map((tx) => ({
          hash: tx.hash,
          method: 'Transfer',
          block: tx.blockNumber,
          age: veroService.formatTime(tx.timestamp),
          from: tx.from,
          to: tx.to,
          valueVERO: veroService.formatWeiToEther(tx.value),
          feeVERO: tx.feeHex ? veroService.formatWeiToEther(tx.feeHex) : '-'
        }))
      }
    } else if (activeTab === 'analytics') {
      payload = {
        address: addressData.address,
        tab: 'analytics',
        metrics: analyticsData
      }
    }
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `address-${addressData.address}-${activeTab}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (address) {
      fetchAddressData()
    }
  }, [address])

  // إغلاق القائمة المنسدلة عند النقر خارجها
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

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400">
              <p className="font-medium text-lg">Failed to load address data</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={fetchAddressData}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!addressData) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Address not found</p>
          </div>
        </div>
      </div>
    )
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Address Details</h1>
              {addressData.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  Verified
                </span>
              )}
            </div>
            <button 
              onClick={fetchAddressData}
              disabled={loading}
              className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-100 mt-1">
            Address: {veroService.formatAddress(addressData.address)}
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Address Header with Tags and Actions */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
          {/* <div className="flex flex-wrap items-center gap-1">
          
            <span className="inline-flex items-center px-2 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <Hash className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-1" />
              {addressData.label}
            </span>

     
            <div className="flex gap-1">
              {addressData.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div> */}

          {/* Action Buttons */}
          {/* <div className="flex items-center gap-1">
            <button className="btn-secondary text-sm flex items-center gap-1">
              <Star className="w-4 h-4" />
            </button>
            <button className="btn-secondary text-sm flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              API
            </button>
            <button className="btn-secondary text-sm flex items-center gap-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div> */}
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {/* Overview Card */}
          <div className="card h-full dark:bg-black dark:border-gray-800">
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="text-lg font-semibold mb-0 text-gray-900 dark:text-gray-100">Overview</h3>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">VERO Balance</h4>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatBalance(addressData.balance)} VERO
                  </span>
                </div>
              </div>

        

              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Token Holdings</h4>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                    className="btn-secondary text-sm flex items-center gap-1 w-full justify-between"
                  >
                    <span>
                      {addressData.tokenBalance}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({addressData.tokenCount} Tokens)
                      </span>
                    </span>
                    <span className={`transform transition-transform ${showTokenDropdown ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {showTokenDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                          Token Holdings
                        </div>
                        {tokenHoldings.map((token, index) => (
                          <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{token.logo}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {token.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {token.symbol}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {token.balance}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {token.value}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                          <Link 
                            to={`/tokentxns?address=${addressData.address}`}
                            className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 py-2"
                          >
                            View All Token Transfers
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

         
        </div>

        {/* Tabs Navigation */}
        <div className="card mb-3 dark:bg-black dark:border-gray-800">
          <div className="p-0">
            <ul className="flex border-b border-gray-200 dark:border-gray-700">
              <li className="flex-1">
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'transactions'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  Transactions
                </button>
              </li>
              <li className="flex-1">
                <button 
                  onClick={() => setActiveTab('token-transfers')}
                  className={`w-full px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'token-transfers'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Coins className="w-4 h-4 inline mr-1" />
                  Token Transfers
                </button>
              </li>
              <li className="flex-1">
                <button 
                  onClick={() => setActiveTab('nft-transfers')}
                  className={`w-full px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'nft-transfers'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-1" />
                  NFT Transfers
                </button>
              </li>
              <li className="flex-1">
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Analytics
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card dark:bg-black dark:border-gray-800">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-0">
                  More than {addressData.transactionCount.toLocaleString()} transactions found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-0">
                  (Showing the last 25,000 records)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={downloadPageData} className="btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Page Data
                </button>
              </div>
            </div>

  
            {/* Tab Content */}
            {activeTab === 'analytics' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Transactions</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.totalTransactions.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Token Transfers</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.totalTokenTransfers.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">NFT Transfers</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.totalNftTransfers.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">First Transaction</h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analyticsData.firstTransaction}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Last Transaction</h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analyticsData.lastTransaction}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Unique Addresses</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.uniqueAddresses.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      {activeTab === 'transactions' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Txn Hash
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Method
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
                            Txn Fee
                          </th>
                        </>
                      )}
                      {activeTab === 'token-transfers' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Token
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
                            Txn Hash
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Age
                          </th>
                        </>
                      )}
                      {activeTab === 'nft-transfers' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Token
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
                            Txn Hash
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Age
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
                    {activeTab === 'transactions' && loadingTransactions && (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Loading transactions...</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {activeTab === 'transactions' && !loadingTransactions && transactions.map((tx, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/tx/${tx.hash}`}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono text-sm truncate max-w-[120px]"
                            >
                              {veroService.formatHash(tx.hash, 8)}
                            </Link>
                            <button
                              onClick={() => copyToClipboard(tx.hash, 'tx')}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded border border-gray-200">
                            Transfer
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/block/${tx.blockNumber}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                          >
                            {tx.blockNumber.toLocaleString()}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                          {veroService.formatTime(tx.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/address/${tx.from}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-mono truncate max-w-[100px]"
                          >
                            {veroService.formatAddress(tx.from)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {tx.from === address ? (
                            <ArrowUpRight className="w-4 h-4 text-red-500 mx-auto" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-green-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/address/${tx.to}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-mono truncate max-w-[100px]"
                          >
                            {veroService.formatAddress(tx.to)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                          {veroService.formatWeiToEther(tx.value)} VERO
                        </td>
                        <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                          {tx.feeHex ? `${veroService.formatWeiToEther(tx.feeHex)} VERO` : '-'}
                        </td>
                      </tr>
                    ))}
                    
                    {activeTab === 'token-transfers' && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            <Coins className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p>No token transfers found</p>
                            <p className="text-sm mt-1">This address only holds VERO tokens</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {activeTab === 'nft-transfers' && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p>No NFT transfers found</p>
                            <p className="text-sm mt-1">This address has no NFT activity</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AddressDetail