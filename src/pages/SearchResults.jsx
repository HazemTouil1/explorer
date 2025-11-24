import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Hash, User, FileText, Coins, AlertCircle } from 'lucide-react'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchTerm(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (term) => {
    setLoading(true)
    setNoResults(false)
    
    // محاكاة البحث
    setTimeout(() => {
      const mockResults = [
        {
          type: 'address',
          title: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          subtitle: 'Binance 14 - Exchange',
          description: 'Contract address with 1,234.56 ETH balance',
          link: `/address/${term}`
        },
        {
          type: 'transaction',
          title: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
          subtitle: 'Transaction',
          description: 'Transfer 1.5 ETH from 0x742d... to 0x9522...',
          link: `/tx/${term}`
        },
        {
          type: 'block',
          title: 'Block #23576832',
          subtitle: 'Block',
          description: 'Mined by Titan Builder, 92 transactions, 0.0085 ETH reward',
          link: `/block/${term}`
        },
        {
          type: 'token',
          title: 'USD Coin (USDC)',
          subtitle: 'ERC-20 Token',
          description: 'Stablecoin pegged to USD, $1.00 price',
          link: `/token/${term}`
        }
      ]
      
      setResults(mockResults)
      setLoading(false)
      
      if (mockResults.length === 0) {
        setNoResults(true)
      }
    }, 1000)
  }

  const getIcon = (type) => {
    switch (type) {
      case 'address':
        return <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      case 'transaction':
        return <Hash className="w-5 h-5 text-green-600 dark:text-green-400" />
      case 'block':
        return <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      case 'token':
        return <Coins className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      default:
        return <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'address':
        return 'Address'
      case 'transaction':
        return 'Transaction'
      case 'block':
        return 'Block'
      case 'token':
        return 'Token'
      default:
        return 'Result'
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen w-full transition-colors">
      {/* Page Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Search className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Search Results</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-100 mt-1">
            Results for: "{searchTerm}"
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-100">Searching...</p>
            </div>
          </div>
        ) : noResults ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600 dark:text-gray-100 mb-4">
                We couldn't find any results for "{searchTerm}"
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Try searching for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Transaction hash (0x...)</li>
                  <li>Address (0x...)</li>
                  <li>Block number</li>
                  <li>Token name or symbol</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-100">
                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchTerm}"
              </p>
            </div>

            {results.map((result, index) => (
              <div key={index} className="card p-6 hover:shadow-md transition-shadow dark:bg-black dark:border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getIcon(result.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-100 mb-2">
                      {result.subtitle}
                    </p>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {result.description}
                    </p>
                    
                    <Link 
                      to={result.link}
                      className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Tips */}
        <div className="mt-12 card p-6 dark:bg-black dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Search Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Transaction Hash</h4>
              <p className="text-sm text-gray-600 dark:text-gray-100">
                Enter a 66-character transaction hash starting with 0x
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Address</h4>
              <p className="text-sm text-gray-600 dark:text-gray-100">
                Enter a 42-character address starting with 0x
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Block Number</h4>
              <p className="text-sm text-gray-600 dark:text-gray-100">
                Enter a block number to view block details
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Token</h4>
              <p className="text-sm text-gray-600 dark:text-gray-100">
                Search by token name, symbol, or contract address
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchResults
