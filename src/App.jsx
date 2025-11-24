import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import TopBar from './components/TopBar'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Transactions from './pages/blockchain/Transactions'
import PendingTransactions from './pages/blockchain/PendingTransactions'
import Blocks from './pages/blockchain/Blocks'
import TopAccounts from './pages/blockchain/TopAccounts'
import TokenTransfers from './pages/tokens/TokenTransfers'
import NFTTransfers from './pages/nfts/NFTTransfers'
import NFTLatestMints from './pages/nfts/NFTLatestMints'
import TransactionDetail from './pages/blockchain/TransactionDetail'
import PendingTransactionDetail from './pages/blockchain/PendingTransactionDetail'
import BlockDetail from './pages/blockchain/BlockDetail'
import BlockTransactions from './pages/blockchain/BlockTransactions'
import AddressDetail from './pages/blockchain/AddressDetail'
import ContractDetails from './pages/blockchain/ContractDetails'
import TokenDetail from './pages/tokens/TokenDetail'
import SearchResults from './pages/SearchResults'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-gray-50 dark:bg-black transition-colors">
        <TopBar />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/txs" element={<Transactions />} />
          <Route path="/txsPending" element={<PendingTransactions />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/accounts" element={<TopAccounts />} />
          <Route path="/tokentxns" element={<TokenTransfers />} />
          <Route path="/nft-transfers" element={<NFTTransfers />} />
          <Route path="/nft-latest-mints" element={<NFTLatestMints />} />
          <Route path="/tx/:txHash" element={<TransactionDetail />} />
          <Route path="/pending-tx/:txHash" element={<PendingTransactionDetail />} />
          <Route path="/block/:blockNumber" element={<BlockDetail />} />
          <Route path="/block/:blockNumber/transactions" element={<BlockTransactions />} />
                  <Route path="/address/:address" element={<AddressDetail />} />
                  <Route path="/contract/:address" element={<ContractDetails />} />
                  <Route path="/token/:token" element={<TokenDetail />} />
                  <Route path="/search" element={<SearchResults />} />
        </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
