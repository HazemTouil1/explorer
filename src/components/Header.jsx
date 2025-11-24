import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, User, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import logo from '../assets/logo.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  // إغلاق القوائم عند تغيير الصفحة
  useEffect(() => {
    setIsMenuOpen(false)
    setActiveDropdown(null)
  }, [location])

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu)
  }

  // دالة لتحديد إذا كان القسم نشط
  const isBlockchainActive = () => {
    return location.pathname.startsWith('/txs') || location.pathname.startsWith('/blocks') || location.pathname === '/uncles' || location.pathname === '/accounts'
  }

  const isTokensActive = () => {
    return location.pathname === '/tokentxns'
  }

  const isNFTsActive = () => {
    return location.pathname === '/nft-transfers' || location.pathname === '/nft-latest-mints'
  }

  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 w-full transition-colors">
      <nav className="container max-w-7xl mx-auto px-4 py-4 lg:py-3 w-full">
        <div className="flex items-center justify-between">
                  {/* Logo */}
                  <Link to="/" className="flex items-center gap-2">
                    <img 
                      src={logo} 
                      alt="Vero Blockchain Explorer" 
                      className="w-8 h-8 rounded-lg"
                    />
                    <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Vero Blockchain Testnet Explorer</span>
                  </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-1">
              {/* Home */}
              <li>
                <Link 
                  to="/" 
                  className={`px-4 py-2 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    location.pathname === '/' 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  Home
                </Link>
              </li>

              {/* Blockchain Dropdown */}
              <li className="relative group">
                <button 
                  className={`px-4 py-2 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors ${
                    isBlockchainActive() 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  Blockchain
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/txs" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Transactions</Link>
                  <Link to="/txsPending" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Pending Transactions</Link>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <Link to="/blocks" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">View Blocks</Link>
{/* 
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div> */}
                  {/* <Link to="/accounts" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Top Accounts</Link> */}

                </div>
              </li>

              {/* Tokens Dropdown */}
              <li className="relative group">
                <button 
                  className={`px-4 py-2 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors ${
                    isTokensActive() 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  Tokens
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                 
                  <Link 
                    to="/tokentxns" 
                    className={`block px-4 py-2 text-sm rounded-lg ${
                      location.pathname === '/tokentxns' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Token Transfers <span className="text-xs text-gray-500 dark:text-gray-400">(ERC-20)</span>
                  </Link>
                
                </div>
              </li>

              {/* NFTs Dropdown */}
              <li className="relative group">
                <button 
                  className={`px-4 py-2 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors ${
                    isNFTsActive() 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  NFTs
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

                  <Link 
                    to="/nft-transfers" 
                    className={`block px-4 py-2 text-sm rounded-lg ${
                      location.pathname === '/nft-transfers' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Latest Transfers
                  </Link>
                  <Link 
                    to="/nft-latest-mints" 
                    className={`block px-4 py-2 text-sm rounded-lg ${
                      location.pathname === '/nft-latest-mints' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Latest Mints
                  </Link>
                </div>
              </li>

           
            </ul>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex lg:hidden items-center gap-4">
            {/* Theme Toggle Button */}
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
            
            {/* Mobile Menu Button */}
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg font-medium ${
                  location.pathname === '/' 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Home
              </Link>
              
              {/* Blockchain Mobile */}
              <div>
                <button 
                  onClick={() => toggleDropdown('blockchain')}
                  className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-between ${
                    isBlockchainActive() 
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Blockchain
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'blockchain' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'blockchain' && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link 
                      to="/txs" 
                      className={`block px-4 py-2 text-sm rounded-lg ${
                        location.pathname === '/txs' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Transactions
                    </Link>
                    <Link 
                      to="/txsPending" 
                      className={`block px-4 py-2 text-sm rounded-lg ${
                        location.pathname === '/txsPending' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Pending Transactions
                    </Link>
                    
                       <Link 
                        to="/blocks" 
                        className={`block px-4 py-2 text-sm rounded-lg ${
                          location.pathname === '/blocks' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        View Blocks
                      </Link>
                 
                    {/* <Link 
                      to="/accounts" 
                      className={`block px-4 py-2 text-sm rounded-lg ${
                        location.pathname === '/accounts' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Top Accounts
                    </Link> */}
                  </div>
                )}
              </div>

              {/* Tokens Mobile */}
              <div>
                <button 
                  onClick={() => toggleDropdown('tokens')}
                  className={`w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium flex items-center justify-between ${
                    isTokensActive()
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  Tokens
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'tokens' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'tokens' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {/* <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Top Tokens</a> */}
                    <Link 
                      to="/tokentxns" 
                      className={`block px-4 py-2 text-sm rounded-lg ${
                        location.pathname === '/tokentxns' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Token Transfers
                    </Link>
                  </div>
                )}
              </div>

              {/* NFTs Mobile */}
              <div>
                <button 
                  onClick={() => toggleDropdown('nfts')}
                  className={`w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium flex items-center justify-between ${
                    isNFTsActive()
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  NFTs
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'nfts' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'nfts' && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link 
                      to="/nft-transfers" 
                      className={`block px-4 py-2 text-sm rounded-lg ${
                        location.pathname === '/nft-transfers' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Latest Transfers
                    </Link>
                    <Link 
                      to="/nft-latest-mints" 
                      className={`block px-4 py-2 text-sm rounded-lg ${
                        location.pathname === '/nft-latest-mints' 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Latest Mints
                    </Link>
                  </div>
                )}
              </div>

            
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
