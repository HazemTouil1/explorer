import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Twitter, Facebook, Github, Mail } from 'lucide-react'
import logo from '../assets/logo.png'

const Footer = () => {
  const location = useLocation()

  const isBlockchainActive = () => {
    return (
      location.pathname.startsWith('/txs') ||
      location.pathname.startsWith('/blocks') ||
      location.pathname === '/uncles' ||
      location.pathname === '/accounts'
    )
  }

  const isTokensActive = () => {
    return location.pathname === '/tokentxns'
  }

  const isNFTsActive = () => {
    return (
      location.pathname === '/nft-transfers' ||
      location.pathname === '/nft-latest-mints'
    )
  }

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-auto w-full transition-colors">
      <div className="container max-w-7xl mx-auto px-4 py-12 w-full">
        {/* Social Links */}
        <div className="flex items-center justify-between pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
              <Twitter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
              <Facebook className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
              <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
              <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
          </div>
          
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm">
            Back to Top ↑
          </a>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={logo} 
                alt="Vero Blockchain Explorer" 
                className="w-6 h-6 rounded"
              />
              <span className="font-bold text-gray-900 dark:text-gray-100">Vero Blockchain Testnet Explorer</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/"
                  className={`block px-3 py-2 rounded-lg font-medium ${
                    location.pathname === '/' 
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  BlockExplorer is a Block Explorer and Analytics Platform for Vero Blockchain Testnet, 
              a decentralized smart contracts platform.
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Blockchain</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/txs" className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/txs'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  Transactions
                </Link>
              </li>
              <li>
                <Link to="/txsPending" className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/txsPending'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  Pending Transactions
                </Link>
              </li>
              <li>
                <Link to="/blocks" className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/blocks'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  View Blocks
                </Link>
              </li>
              {/* <li>
                <Link to="/accounts" className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/accounts'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  Top Accounts
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Tokens</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tokentxns" className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/tokentxns'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  Token Transfers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">NFTs</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/nft-transfers" className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/nft-transfers'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  Latest Transfers
                </Link>
              </li>
              <li>
                <Link to="/nft-latest-mints" className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/nft-latest-mints'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  Latest Mints
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Vero Testnet Explorer © 2025</p>
          {/* <p>
            Donations: <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">0x71c765...d8976f</a> ❤️
          </p> */}
        </div>
      </div>
    </footer>
  )
}

export default Footer

