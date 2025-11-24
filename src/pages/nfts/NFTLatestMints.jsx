import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy, Eye, Download, RefreshCw, Image, AlertCircle } from 'lucide-react'
import veroService from '../../services/veroService'

const NFTLatestMints = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [nftMints, setNftMints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [notice, setNotice] = useState('')

  const fetchNFTMints = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const mints = await veroService.getNFTMints(rowsPerPage)
      setNftMints(mints)
      setTotalPages(Math.ceil(mints.length / rowsPerPage))
    } catch (err) {
      console.error('Failed to fetch NFT mints:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNFTMints()
  }, [rowsPerPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleRefresh = () => {
    fetchNFTMints()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  const downloadPageData = () => {
    if (!nftMints || nftMints.length === 0) {
      showNotice('No data to download in this section')
      return
    }
    const payload = {
      tab: 'nft-latest-mints',
      page: currentPage,
      rowsPerPage,
      count: nftMints.length,
      data: nftMints.map((mint) => ({
        txHash: mint.txHash,
        block: mint.block,
        age: mint.age,
        maker: mint.maker,
        type: mint.type,
        quantity: mint.quantity,
        nftName: mint.nftName,
        tokenAddress: mint.tokenAddress,
        tokenId: mint.tokenId
      }))
    }
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nft-mints-page-${currentPage}.json`
    a.click()
    URL.revokeObjectURL(url)
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NFT Latest Mints</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {loading ? 'Loading NFT mints...' : 
                 error ? 'Failed to load NFT mints' : 
                 nftMints.length === 0 ? 'No NFT mints found' :
                 `${nftMints.length} NFT mints found`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500 dark:bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              i
            </div>
            <div className="text-sm text-purple-900 dark:text-purple-200">
              <p className="font-medium mb-1">About NFT Mints</p>
              <p className="text-purple-700 dark:text-purple-300">
                This page shows the latest NFT minting activities on the Vero Network. NFTs are unique digital assets created on smart contracts.
              </p>
            </div>
          </div>
        </div>

        {/* NFT Mints Table */}
        <div className="card overflow-hidden w-full">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {loading ? 'Loading...' : 
                   error ? 'Failed to load' : 
                   `${nftMints.length} NFT mints found`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Please wait...' : 
                   error ? error : 
                   `Showing page ${currentPage} of ${totalPages}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Download Button */}
                <button onClick={downloadPageData} className="btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-400" />
                  Download Page Data
                </button>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    className="btn-secondary text-sm flex items-center gap-2"
                    onClick={() => handlePageChange(1)}
                  >
                    First
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-12">
                    <i className="text-gray-400" title="See preview of the transaction details">?</i>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Transaction Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Block
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Maker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    NFT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Token ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="text-red-600 dark:text-red-400">
                        <p className="font-medium">Failed to load NFT mints</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button 
                          onClick={handleRefresh}
                          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : nftMints.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <Image className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium">No NFT mints found</p>
                        <p className="text-sm mt-1">No NFT minting activities found in recent transactions</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  nftMints.map((mint, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/tx/${mint.txHash}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tx/${mint.txHash}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-mono text-sm truncate max-w-[120px]"
                          >
                            {veroService.formatHash(mint.txHash, 8)}
                          </Link>
                          <button
                            onClick={() => copyToClipboard(mint.txHash)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/block/${mint.block}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                        >
                          {mint.block}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-100 text-gray-600">
                        {mint.age}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/address/${mint.maker}`}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm truncate max-w-[120px]"
                          >
                            {mint.makerLabel || veroService.formatAddress(mint.maker)}
                          </Link>
                          <button
                            onClick={() => copyToClipboard(mint.maker)}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
                          mint.type === 'ERC-721' 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                        }`}>
                          {mint.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {mint.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                            <Image className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                              {mint.nftName}
                            </div>
                            <Link
                              to={`/address/${mint.tokenAddress}`}
                              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 truncate max-w-[120px] block"
                            >
                              {veroService.formatAddress(mint.tokenAddress)}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {mint.tokenId}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFTLatestMints