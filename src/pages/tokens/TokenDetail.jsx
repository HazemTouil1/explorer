import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, ExternalLink, Star, MoreHorizontal, Filter, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react'
import veroService from '../../services/veroService'

const TokenDetail = () => {
  const { token } = useParams()
  const [copied, setCopied] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // البحث عن توكنات ERC-20 في شبكة Vero
  const searchTokens = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // جلب جميع المعاملات للبحث عن توكنات ERC-20
      const transactions = await veroService.getLatestTransactions(100)
      const tokenTransfers = await veroService.getTokenTransfers(100)
      
      // استخراج العناوين الفريدة للتوكنات
      const tokenAddresses = new Set()
      tokenTransfers.forEach(transfer => {
        if (transfer.tokenAddress) {
          tokenAddresses.add(transfer.tokenAddress)
        }
      })
      
      // جلب تفاصيل كل توكن
      const tokenDetails = []
      for (const address of tokenAddresses) {
        try {
          const name = await veroService.getTokenName(address)
          const symbol = await veroService.getTokenSymbol(address)
          const decimals = await veroService.getTokenDecimals(address)
          
          // البحث عن التوكنات التي تطابق اسم البحث
          if (name && symbol && (
            name.toLowerCase().includes(token?.toLowerCase() || '') ||
            symbol.toLowerCase().includes(token?.toLowerCase() || '')
          )) {
            tokenDetails.push({
              address: address,
              name: name,
              symbol: symbol,
              decimals: decimals,
              type: 'ERC-20',
              verified: true, // في شبكة محلية، نعتبر جميع التوكنات موثقة
              price: 'N/A', // لا يوجد سعر في الشبكة المحلية
              logo: '🪙',
              website: null
            })
          }
        } catch (err) {
          console.warn(`Failed to get token details for ${address}:`, err)
        }
      }
      
      setTokens(tokenDetails)
    } catch (err) {
      console.error('Failed to search tokens:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      searchTokens()
    }
  }, [token])

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleRefresh = () => {
    searchTokens()
  }

  const filteredTokens = tokens.filter(tokenItem => {
    if (filterBy === 'all') return true
    if (filterBy === 'token') return tokenItem.type === 'ERC-20'
    if (filterBy === 'address') return tokenItem.address.toLowerCase().includes(token?.toLowerCase() || '')
    return true
  })

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
      {/* Page Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Token Search Results</h1>
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
        {/* Search Results Header */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div>
            <p className="text-gray-900 dark:text-gray-100 mb-1">
              Search results for: <span className="font-medium text-break">{token}</span>
            </p>
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-0">
                Searching for ERC-20 tokens...
              </p>
            ) : error ? (
              <p className="text-sm text-red-500 dark:text-red-400 mb-0">
                Error: {error}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-0">
                {filteredTokens.length} ERC-20 token(s) found
              </p>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Failed to search tokens
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredTokens.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center mb-6">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No ERC-20 tokens found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No ERC-20 tokens found matching "{token}" in the Vero Network.
            </p>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              <p>Try searching for:</p>
              <ul className="mt-2 space-y-1">
                <li>• Token name (e.g., "USDT", "DAI")</li>
                <li>• Token symbol (e.g., "USDT", "DAI")</li>
                <li>• Contract address (e.g., "0x...")</li>
              </ul>
            </div>
          </div>
        )}

        {/* Token Results */}
        {!loading && !error && filteredTokens.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {filteredTokens.map((tokenItem, index) => (
              <Link
                key={`${tokenItem.address}-${index}`}
                to={`/contract/${tokenItem.address}`}
                className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all p-3"
              >
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                      {tokenItem.logo}
                    </div>
                    {tokenItem.verified && (
                      <div className="absolute -top-1 -right-2 w-4 h-4 bg-green-500 border border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {tokenItem.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      ({tokenItem.symbol})
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded">
                      {tokenItem.price}
                    </span>
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400 text-sm font-mono break-all mb-1">
                    {tokenItem.address}
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    Decimals: {tokenItem.decimals}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full px-2 py-1">
                      {tokenItem.type}
                    </span>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full px-2 py-1">
                      Vero Network
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      copyToClipboard(tokenItem.address, `token-${index}`)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copied === `token-${index}` && (
                    <span className="text-xs text-green-500">Copied!</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredTokens.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              Showing {filteredTokens.length} ERC-20 token(s) from Vero Network
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TokenDetail