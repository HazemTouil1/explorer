import React, { useState } from 'react'
import { Sun, Moon, Zap, Search } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLocation, useNavigate } from 'react-router-dom'

const TopBar = () => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('all')

  const isHomePage = location.pathname === '/'

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
    <div className="hidden lg:block bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-2 w-full transition-colors">
      <div className="container max-w-7xl mx-auto px-4 w-full">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded px-3 py-1">
              <span> Vero Testnet</span>
            </div>
           
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Box - يظهر فقط في الصفحات غير الرئيسية */}
            {!isHomePage && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex items-center gap-1">
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-2 py-1 border-r border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none bg-transparent text-xs"
                >
                  <option value="all" className="bg-white dark:bg-gray-900">All</option>
                  <option value="address" className="bg-white dark:bg-gray-900">Address</option>
                  <option value="contract" className="bg-white dark:bg-gray-900">Contract</option>
                  <option value="txn" className="bg-white dark:bg-gray-900">Txn</option>
                  <option value="block" className="bg-white dark:bg-gray-900">Block</option>
                  <option value="blockhash" className="bg-white dark:bg-gray-900">Block Hash</option>
                  <option value="token" className="bg-white dark:bg-gray-900">Token</option>
                </select>
                
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getPlaceholder()}
                  className="w-64 px-2 py-1 focus:outline-none text-gray-700 dark:text-gray-300 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-xs"
                />
                
                <button 
                  onClick={handleSearch}
                  className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-2 py-1 rounded transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar

