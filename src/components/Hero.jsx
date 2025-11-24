import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('all')
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    const term = searchTerm.trim()
    
    // تحديد نوع البحث بناءً على النمط
    let detectedType = searchType
    
    if (searchType === 'all') {
      // كشف تلقائي لنوع البحث
      if (term.startsWith('0x') && term.length === 66) {
        // يمكن أن يكون Transaction Hash أو Block Hash
        // سنحاول أولاً كـ Block Hash، وإذا فشل فسنحاول كـ Transaction
        try {
          // جرب كـ Block Hash أولاً
          const response = await fetch('http://localhost:8545', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBlockByHash',
              params: [term, false],
              id: 1
            })
          })
          const result = await response.json()
          if (result.result) {
            detectedType = 'blockhash'
          } else {
            detectedType = 'txn'
          }
        } catch (error) {
          // في حالة الخطأ، جرب كـ Transaction
          detectedType = 'txn'
        }
      } else if (term.startsWith('0x') && term.length === 42) {
        // Address
        detectedType = 'address'
      } else if (/^\d+$/.test(term)) {
        // Block Number
        detectedType = 'block'
      } else {
        // Token Name or Symbol
        detectedType = 'token'
      }
    }

            // التنقل إلى الصفحة المناسبة
            switch (detectedType) {
              case 'txn':
                navigate(`/tx/${term}`)
                break
              case 'address':
                navigate(`/address/${term}`)
                break
              case 'contract':
                navigate(`/contract/${term}`)
                break
              case 'block':
                navigate(`/block/${term}`)
                break
              case 'blockhash':
                navigate(`/block/${term}`)
                break
              case 'token':
                navigate(`/token/${term}`)
                break
              default:
                // البحث العام
                navigate(`/search?q=${encodeURIComponent(term)}`)
            }

            // حذف محتوى البحث بعد التنقل
            setSearchTerm('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getPlaceholder = () => {
    switch (searchType) {
      case 'address':
        return 'Enter wallet address (0x...)'
      case 'contract':
        return 'Enter contract address (0x...)'
      case 'txn':
        return 'Enter transaction hash (0x...)'
      case 'block':
        return 'Enter block number'
      case 'blockhash':
        return 'Enter block hash (0x...)'
      case 'token':
        return 'Enter token name or symbol'
      default:
        return 'Search by Address / Contract / Txn Hash / Block / Token'
    }
  }

  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-black dark:to-black py-16 w-full overflow-hidden transition-colors">
      <div className="container max-w-7xl mx-auto px-4 w-full">
        <div className="max-w-3xl">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            The Vero Blockchain Testnet Explorer
          </h1>
          
          {/* Search Box */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-1 sm:p-2 flex items-center gap-1 sm:gap-2 transition-colors">
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="text-sm sm:text-base px-2 py-1 sm:px-4 sm:py-2 border-r border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none bg-transparent"
            >
              <option value="all" className="bg-white dark:bg-gray-900">All Filters</option>
              <option value="address" className="bg-white dark:bg-gray-900">Addresses</option>
              <option value="contract" className="bg-white dark:bg-gray-900">Contracts</option>
              <option value="txn" className="bg-white dark:bg-gray-900">Txn Hash</option>
              <option value="block" className="bg-white dark:bg-gray-900">Block Number</option>
              <option value="blockhash" className="bg-white dark:bg-gray-900">Block Hash</option>
              <option value="token" className="bg-white dark:bg-gray-900">Token</option>
            </select>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              className="flex-1 px-2 sm:px-4 py-2 focus:outline-none text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            
            <button 
              onClick={handleSearch}
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-3 sm:px-6 py-1 sm:py-2 rounded-md transition-colors text-sm sm:text-base"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-4">
            Sponsored: Build on Vero Blockchain Testnet with industry-leading tools
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero

