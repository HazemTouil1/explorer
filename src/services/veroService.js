// Vero Blockchain Service
const VERO_CONFIG = {
  RPC_URL: 'https://vero-rpc.publicnode.online',
  INDEXER_API: 'http://75.119.156.249:3000/api', // الـ Indexer API الخاص بك
  CHAIN_ID: 808,
  NETWORK_NAME: 'Vero Chain',
  COIN_SYMBOL: 'VERO',
  BLOCK_TIME: 2, // seconds
  DECIMALS: 18,
};

class VeroService {
  constructor() {
    this.rpcUrl = VERO_CONFIG.RPC_URL;
    this.indexerApi = VERO_CONFIG.INDEXER_API;
  }

  // Helper method to make RPC calls
  async rpcCall(method, params = []) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: method,
          params: params,
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('RPC call failed:', error);
      throw error;
    }
  }

  // Helper method to call Indexer API
  async indexerCall(endpoint) {
    try {
      const response = await fetch(`${this.indexerApi}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Indexer API error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Indexer API call failed:', error);
      throw error;
    }
  }

  // Get current block number
  async getCurrentBlockNumber() {
    const hexBlockNumber = await this.rpcCall('eth_blockNumber');
    return parseInt(hexBlockNumber, 16);
  }

  // Get block by number
  async getBlock(blockNumber, includeTransactions = true) {
    const hexBlockNumber = '0x' + blockNumber.toString(16);
    const block = await this.rpcCall('eth_getBlockByNumber', [hexBlockNumber, includeTransactions]);
    
    if (!block) return null;

    return {
      number: parseInt(block.number, 16),
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: parseInt(block.timestamp, 16),
      gasLimit: parseInt(block.gasLimit, 16),
      gasUsed: parseInt(block.gasUsed, 16),
      miner: block.miner,
      difficulty: block.difficulty,
      totalDifficulty: block.totalDifficulty,
      size: parseInt(block.size, 16),
      transactions: block.transactions || [],
      transactionCount: block.transactions ? block.transactions.length : 0,
    };
  }

  // Get block by hash
  async getBlockByHash(blockHash, includeTransactions = true) {
    const block = await this.rpcCall('eth_getBlockByHash', [blockHash, includeTransactions]);
    
    if (!block) return null;

    return {
      number: parseInt(block.number, 16),
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: parseInt(block.timestamp, 16),
      gasLimit: parseInt(block.gasLimit, 16),
      gasUsed: parseInt(block.gasUsed, 16),
      miner: block.miner,
      difficulty: block.difficulty,
      totalDifficulty: block.totalDifficulty,
      size: parseInt(block.size, 16),
      transactions: block.transactions || [],
      transactionCount: block.transactions ? block.transactions.length : 0,
    };
  }

  // Get latest blocks
  async getLatestBlocks(count = 10) {
    const currentBlock = await this.getCurrentBlockNumber();
    const blocks = [];

    for (let i = 0; i < count && currentBlock - i >= 0; i++) {
      const blockNumber = currentBlock - i;
      const block = await this.getBlock(blockNumber, false);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  // Get transaction by hash
  async getTransaction(txHash) {
    const tx = await this.rpcCall('eth_getTransactionByHash', [txHash]);
    
    if (!tx) return null;

    return {
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber, 16),
      blockHash: tx.blockHash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: parseInt(tx.gas, 16),
      gasPrice: tx.gasPrice,
      nonce: parseInt(tx.nonce, 16),
      input: tx.input,
      transactionIndex: parseInt(tx.transactionIndex, 16),
    };
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash) {
    const receipt = await this.rpcCall('eth_getTransactionReceipt', [txHash]);
    
    if (!receipt) return null;

    return {
      transactionHash: receipt.transactionHash,
      blockNumber: parseInt(receipt.blockNumber, 16),
      blockHash: receipt.blockHash,
      from: receipt.from,
      to: receipt.to,
      gasUsed: parseInt(receipt.gasUsed, 16),
      status: receipt.status,
      logs: receipt.logs || [],
    };
  }

  // Get latest transactions (محسّن باستخدام الـ Indexer)
  async getLatestTransactions(count = 10) {
    try {
      // استخدام الـ Indexer API للحصول على آخر المعاملات (أسرع بكثير!)
      const transactions = await this.indexerCall(`/transactions/latest?limit=${count}`);
      
      if (transactions && Array.isArray(transactions)) {
        return transactions.map(tx => ({
          hash: tx.hash,
          blockNumber: parseInt(tx.block_number),
          blockHash: null, // يمكن إضافته لاحقاً إذا احتجته
          from: tx.from_address,
          to: tx.to_address,
          value: tx.value,
          gas: parseInt(tx.gas),
          gasPrice: tx.gas_price,
          nonce: parseInt(tx.nonce),
          input: tx.input,
          transactionIndex: parseInt(tx.transaction_index),
          timestamp: parseInt(tx.timestamp),
        }));
      }
    } catch (error) {
      console.log('Indexer failed, falling back to RPC method:', error);
    }

    // إذا فشل الـ Indexer، استخدم الطريقة القديمة (RPC)
    const currentBlock = await this.getCurrentBlockNumber();
    const endBlock = Math.max(0, currentBlock - 50);
    const transactions = [];
    
    for (let i = currentBlock; i >= endBlock && transactions.length < count; i--) {
      let block;
      try {
        block = await this.getBlock(i, true);
      } catch {
        continue;
      }
      
      if (block && block.transactions && block.transactions.length > 0) {
        const remaining = count - transactions.length;
        const entries = block.transactions.slice(0, remaining);
        const objectTxs = entries.filter(e => typeof e !== 'string' && e && e.hash);
        
        for (const entry of objectTxs) {
          transactions.push({
            hash: entry.hash,
            blockNumber: parseInt(entry.blockNumber, 16),
            blockHash: entry.blockHash,
            from: entry.from,
            to: entry.to,
            value: entry.value,
            gas: parseInt(entry.gas, 16),
            gasPrice: entry.gasPrice,
            nonce: parseInt(entry.nonce, 16),
            input: entry.input,
            transactionIndex: parseInt(entry.transactionIndex, 16),
            timestamp: block.timestamp,
          });
        }
        
        if (transactions.length < count) {
          const remaining2 = count - transactions.length;
          const stringHashes = entries.filter(e => typeof e === 'string').slice(0, remaining2);
          if (stringHashes.length > 0) {
            const results = await Promise.all(stringHashes.map(h => this.getTransaction(h)));
            for (const tx of results) {
              if (tx && transactions.length < count) {
                transactions.push({ ...tx, timestamp: block.timestamp });
              }
            }
          }
        }
      }
    }
    
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    return transactions;
  }

  async getTotalTransactionsCount() {
    try {
      const res = await this.indexerCall(`/transactions/count`);
      if (typeof res === 'number') return res;
      if (res && typeof res.count === 'number') return res.count;
      if (res && typeof res.total === 'number') return res.total;
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Get address balance
  async getBalance(address) {
    const balance = await this.rpcCall('eth_getBalance', [address, 'latest']);
    return balance;
  }

  // Get address info
  async getAddress(address) {
    const balance = await this.getBalance(address);
    const transactions = await this.getAddressTransactions(address, 10);
    
    return {
      address,
      balance,
      transactionCount: transactions.length,
      transactions,
    };
  }

  // Get transactions for an address (محسّن باستخدام الـ Indexer)
  async getAddressTransactions(address, count = 10) {
    try {
      // استخدام الـ Indexer API للحصول على معاملات العنوان (أسرع بكثير!)
      const transactions = await this.indexerCall(`/transactions/address/${address}?limit=${count}`);
      
      if (transactions && Array.isArray(transactions)) {
        return transactions.map(tx => ({
          hash: tx.hash,
          blockNumber: parseInt(tx.block_number),
          blockHash: null,
          from: tx.from_address,
          to: tx.to_address,
          value: tx.value,
          gas: parseInt(tx.gas),
          gasPrice: tx.gas_price,
          nonce: parseInt(tx.nonce),
          input: tx.input,
          transactionIndex: parseInt(tx.transaction_index),
          timestamp: parseInt(tx.timestamp),
        }));
      }
    } catch (error) {
      console.log('Indexer failed for address transactions, falling back to RPC:', error);
    }

    // إذا فشل الـ Indexer، استخدم الطريقة القديمة
    const normalize = (a) => (a || '').toLowerCase();

    const recentMinedPromise = this.getLatestTransactions(Math.max(50, count * 10));
    const pendingPromise = this.getPendingTransactions(Math.max(20, count * 2));

    const [minedResult, pendingResult] = await Promise.allSettled([recentMinedPromise, pendingPromise]);

    const recentMined = minedResult.status === 'fulfilled' ? minedResult.value || [] : [];
    const pending = pendingResult.status === 'fulfilled' ? pendingResult.value || [] : [];

    const filteredMined = recentMined.filter(
      (tx) => normalize(tx.from) === normalize(address) || normalize(tx.to) === normalize(address)
    );

    const filteredPending = pending.filter(
      (tx) => normalize(tx.from) === normalize(address) || normalize(tx.to) === normalize(address)
    );

    const combined = [...filteredMined, ...filteredPending]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, count);

    return combined;
  }

   // Get network stats
  async getNetworkStats() {
    const currentBlock = await this.getCurrentBlockNumber();
    const latestBlock = await this.getBlock(currentBlock, false);
    
    return {
      currentBlock,
      blockTime: VERO_CONFIG.BLOCK_TIME,
      networkName: VERO_CONFIG.NETWORK_NAME,
      chainId: VERO_CONFIG.CHAIN_ID,
      coinSymbol: VERO_CONFIG.COIN_SYMBOL,
      gasPrice: latestBlock ? await this.getGasPrice() : '0',
    };
  }

  // Get current gas price
  async getGasPrice() {
    const gasPrice = await this.rpcCall('eth_gasPrice');
    return gasPrice;
  }

  async getPendingTransactions(count = 25) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const block = await this.rpcCall('eth_getBlockByNumber', ['pending', true]);
      const transactions = [];
      if (block && Array.isArray(block.transactions)) {
        for (const entry of block.transactions) {
          if (transactions.length >= count) break;
          const tx = typeof entry === 'string' ? await this.getTransaction(entry) : entry;
          if (!tx) continue;
          transactions.push({
            hash: tx.hash || null,
            blockNumber: null,
            blockHash: null,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            gas: typeof tx.gas === 'string' ? parseInt(tx.gas, 16) : tx.gas || 0,
            gasPrice: tx.gasPrice || '0x0',
            nonce: typeof tx.nonce === 'string' ? parseInt(tx.nonce, 16) : tx.nonce || 0,
            input: tx.input,
            transactionIndex: null,
            timestamp: now,
          });
        }
      }
      return transactions.slice(0, count);
    } catch (error) {
      return [];
    }
  }

  // Utility functions
  formatWeiToEther(wei) {
    try {
      if (wei === null || wei === undefined) return '0.000000';
      let v;
      if (typeof wei === 'bigint') {
        v = wei;
      } else if (typeof wei === 'number') {
        v = BigInt(Math.floor(wei));
      } else if (typeof wei === 'string') {
        const s = wei.trim();
        v = BigInt(s);
      } else {
        return '0.000000';
      }
      const base = BigInt(10) ** BigInt(VERO_CONFIG.DECIMALS);
      let integer = v / base;
      let fraction = v % base;
      let fracStr = fraction.toString().padStart(VERO_CONFIG.DECIMALS, '0');
      let six = fracStr.slice(0, 6);
      const seventh = fracStr.slice(6, 7);
      if (seventh && parseInt(seventh, 10) >= 5) {
        let sixNum = BigInt(six || '0') + 1n;
        if (sixNum >= 1000000n) {
          sixNum -= 1000000n;
          integer = integer + 1n;
        }
        six = sixNum.toString().padStart(6, '0');
      }
      return `${integer.toString()}.${six}`;
    } catch {
      const n = typeof wei === 'string' ? (wei.trim().startsWith('0x') ? parseInt(wei, 16) : parseFloat(wei)) : Number(wei || 0);
      return (n / Math.pow(10, VERO_CONFIG.DECIMALS)).toFixed(6);
    }
  }

  formatWeiToGwei(wei) {
    try {
      if (wei === null || wei === undefined) return '0.000000';
      let v;
      if (typeof wei === 'bigint') {
        v = wei;
      } else if (typeof wei === 'number') {
        v = BigInt(Math.floor(wei));
      } else if (typeof wei === 'string') {
        const s = wei.trim();
        v = BigInt(s);
      } else {
        return '0.000000';
      }
      const base = 1000000000n;
      let integer = v / base;
      let fraction = v % base;
      let fracStr = fraction.toString().padStart(9, '0');
      let six = fracStr.slice(0, 6);
      const seventh = fracStr.slice(6, 7);
      if (seventh && parseInt(seventh, 10) >= 5) {
        let sixNum = BigInt(six || '0') + 1n;
        if (sixNum >= 1000000n) {
          sixNum -= 1000000n;
          integer = integer + 1n;
        }
        six = sixNum.toString().padStart(6, '0');
      }
      return `${integer.toString()}.${six}`;
    } catch {
      const n = typeof wei === 'string' ? (wei.trim().startsWith('0x') ? parseInt(wei, 16) : parseFloat(wei)) : Number(wei || 0);
      return (n / 1e9).toFixed(6);
    }
  }

  formatHash(hash, length = 8) {
    if (!hash) return '';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  }

  formatTime(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return `${diff} secs ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  hexToAscii(hex) {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
    let str = '';
    for (let i = 0; i < clean.length; i += 2) {
      const code = parseInt(clean.substr(i, 2), 16);
      if (code === 0) continue;
      str += String.fromCharCode(code);
    }
    return str;
  }

  decodeAbiString(result) {
    if (!result || result === '0x') return null;
    const data = result.startsWith('0x') ? result.slice(2) : result;
    if (data.length <= 64) {
      return this.hexToAscii(data.replace(/00+$/g, ''));
    }
    const w0 = parseInt(data.slice(0, 64), 16);
    const w1 = parseInt(data.slice(64, 128), 16);
    if (!isNaN(w0) && w0 === 32 && !isNaN(w1)) {
      const len = w1;
      const start = 128;
      const strHex = data.slice(start, start + len * 2);
      return this.hexToAscii(strHex);
    } else {
      const len = w0;
      const start = 64;
      const strHex = data.slice(start, start + len * 2);
      return this.hexToAscii(strHex);
    }
  }

  async getTopAccounts(count = 25) {
    try {
      const latestBlock = await this.getCurrentBlockNumber();
      const accounts = [];
      
      const latestTransactions = await this.getLatestTransactions(100);
      
      const uniqueAddresses = new Set();
      latestTransactions.forEach(tx => {
        if (tx.from) uniqueAddresses.add(tx.from);
        if (tx.to) uniqueAddresses.add(tx.to);
      });
      
      const balancePromises = Array.from(uniqueAddresses).slice(0, count).map(async (address) => {
        try {
          const balance = await this.getBalance(address);
          return {
            address,
            balance: parseInt(balance, 16),
            balanceFormatted: this.formatWeiToEther(balance),
            isContract: false,
            transactionCount: 0
          };
        } catch (error) {
          console.error(`Error getting balance for ${address}:`, error);
          return null;
        }
      });
      
      const accountBalances = await Promise.all(balancePromises);
      
      const validAccounts = accountBalances
        .filter(account => account !== null && account.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, count);
      
      return validAccounts.map((account, index) => ({
        ...account,
        rank: index + 1,
        percentage: '0.000%',
        nameTag: null
      }));
      
    } catch (error) {
      console.error('Error fetching top accounts:', error);
      return [];
    }
  }

  async getTokenTransfers(count = 50) {
    try {
      const latestTransactions = await this.getLatestTransactions(count);
      const tokenTransfers = [];
      
      for (const tx of latestTransactions) {
        try {
          if (tx.input && tx.input !== '0x' && tx.input.length > 10) {
            const methodSignature = tx.input.substring(0, 10);
            
            if (methodSignature === '0xa9059cbb') {
              const toAddress = '0x' + tx.input.substring(34, 74);
              const amountHex = tx.input.substring(74, 138);
              const amount = parseInt(amountHex, 16);
              
              const tokenName = await this.getTokenName(tx.to);
              const tokenSymbol = await this.getTokenSymbol(tx.to);
              const decimals = await this.getTokenDecimals(tx.to);
              
              const formattedAmount = (amount / Math.pow(10, decimals)).toFixed(6);
              
              tokenTransfers.push({
                txHash: tx.hash,
                method: 'Transfer',
                methodFull: 'Transfer',
                block: tx.blockNumber,
                age: this.formatTime(tx.timestamp),
                from: tx.from,
                fromLabel: null,
                fromIsContract: true,
                to: toAddress,
                toLabel: null,
                toIsENS: false,
                toIsContract: false,
                amount: formattedAmount,
                amountFull: formattedAmount,
                valueUSD: '$0.00',
                token: tokenName || 'Unknown Token',
                tokenSymbol: tokenSymbol || 'UNK',
                tokenAddress: tx.to,
                tokenImage: null
              });
            }
          }
        } catch (error) {
          console.error(`Error processing transaction ${tx.hash}:`, error);
        }
      }
      
      return tokenTransfers;
      
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      return [];
    }
  }

  async getTokenName(contractAddress) {
    try {
      const result = await this.rpcCall('eth_call', [{ to: contractAddress, data: '0x06fdde03' }, 'latest']);
      if (result && result !== '0x') {
        return this.decodeAbiString(result);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getTokenSymbol(contractAddress) {
    try {
      const result = await this.rpcCall('eth_call', [{ to: contractAddress, data: '0x95d89b41' }, 'latest']);
      if (result && result !== '0x') {
        return this.decodeAbiString(result);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getTokenDecimals(contractAddress) {
    try {
      const result = await this.rpcCall('eth_call', [{ to: contractAddress, data: '0x313ce567' }, 'latest']);
      if (result && result !== '0x') {
        return parseInt(result, 16);
      }
      return 18;
    } catch (error) {
      return 18;
    }
  }

  async getNFTMints(count = 50) {
    try {
      const latestTransactions = await this.getLatestTransactions(count);
      const nftMints = [];
      
      for (const tx of latestTransactions) {
        try {
          if (tx.input && tx.input !== '0x' && tx.input.length > 10) {
            const methodSignature = tx.input.substring(0, 10);
            
            const mintSignatures = [
              '0x40c10f19',
              '0xa0712d68',
              '0x6a627842',
              '0xf399e22e',
              '0x1249c58b',
              '0x731133e9'
            ];
            
            if (mintSignatures.includes(methodSignature)) {
              let nftType = 'ERC-721';
              let tokenId = '0';
              let quantity = 1;
              
              if (methodSignature === '0x40c10f19') {
                const toAddress = '0x' + tx.input.substring(34, 74);
                tokenId = parseInt(tx.input.substring(74, 138), 16).toString();
              } else if (methodSignature === '0xa0712d68') {
                tokenId = parseInt(tx.input.substring(10, 74), 16).toString();
              } else if (methodSignature === '0x6a627842') {
                tokenId = '0';
              } else if (mintSignatures.slice(3).includes(methodSignature)) {
                nftType = 'ERC-1155';
                const toAddress = '0x' + tx.input.substring(34, 74);
                const idHex = tx.input.substring(74, 138);
                const amountHex = tx.input.substring(138, 202);
                tokenId = parseInt(idHex, 16).toString();
                quantity = parseInt(amountHex, 16);
              }
              
              const nftName = await this.getNFTName(tx.to);
              
              nftMints.push({
                txHash: tx.hash,
                block: tx.blockNumber,
                age: this.formatTime(tx.timestamp),
                maker: tx.from,
                makerLabel: null,
                makerIsENS: false,
                type: nftType,
                quantity: quantity,
                nftName: nftName || 'Unknown NFT',
                nftImage: '/images/main/nft-placeholder.svg',
                tokenAddress: tx.to,
                tokenId: tokenId
              });
            }
          }
        } catch (error) {
          console.error(`Error processing transaction ${tx.hash}:`, error);
        }
      }
      
      return nftMints;
      
    } catch (error) {
      console.error('Error fetching NFT mints:', error);
      return [];
    }
  }

  async getNFTName(contractAddress) {
    try {
      const result = await this.rpcCall('eth_call', [{ to: contractAddress, data: '0x06fdde03' }, 'latest']);
      if (result && result !== '0x') {
        return this.decodeAbiString(result);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async isContract(address) {
    try {
      const code = await this.rpcCall('eth_getCode', [address, 'latest']);
      return code && code !== '0x' && code !== '0x0';
    } catch (error) {
      console.error('Error checking if address is contract:', error);
      return false;
    }
  }

  async getNFTTransfers(count = 50) {
    try {
      const latestTransactions = await this.getLatestTransactions(count);
      const nftTransfers = [];
      
      for (const tx of latestTransactions) {
        try {
          if (tx.input && tx.input !== '0x' && tx.input.length > 10) {
            const methodSignature = tx.input.substring(0, 10);
            
            const transferSignatures = [
              '0x23b872dd',
              '0x42842e0e',
              '0xf242432a',
              '0x2eb2c2d6',
              '0xa22cb465'
            ];
            
            if (transferSignatures.includes(methodSignature)) {
              let nftType = 'ERC-721';
              let fromAddress = '0x0000000000000000000000000000000000000000';
              let toAddress = '0x0000000000000000000000000000000000000000';
              let tokenId = '0';
              let quantity = 1;
              
              if (methodSignature === '0x23b872dd') {
                fromAddress = '0x' + tx.input.substring(34, 74);
                toAddress = '0x' + tx.input.substring(98, 138);
                tokenId = parseInt(tx.input.substring(138, 202), 16).toString();
              } else if (methodSignature === '0x42842e0e') {
                fromAddress = '0x' + tx.input.substring(34, 74);
                toAddress = '0x' + tx.input.substring(98, 138);
                tokenId = parseInt(tx.input.substring(138, 202), 16).toString();
              } else if (methodSignature === '0xf242432a') {
                nftType = 'ERC-1155';
                fromAddress = '0x' + tx.input.substring(34, 74);
                toAddress = '0x' + tx.input.substring(98, 138);
                const idHex = tx.input.substring(138, 202);
                const amountHex = tx.input.substring(202, 266);
                tokenId = parseInt(idHex, 16).toString();
                quantity = parseInt(amountHex, 16);
              } else if (methodSignature === '0x2eb2c2d6') {
                nftType = 'ERC-1155';
                fromAddress = '0x' + tx.input.substring(34, 74);
                toAddress = '0x' + tx.input.substring(98, 138);
                tokenId = '0';
                quantity = 1;
              }
              
              const nftName = await this.getNFTName(tx.to);
              
              nftTransfers.push({
                txHash: tx.hash,
                method: methodSignature,
                block: tx.blockNumber,
                age: this.formatTime(tx.timestamp),
                from: fromAddress,
                fromLabel: fromAddress === '0x0000000000000000000000000000000000000000' ? 'Null: 0x000...000' : null,
                fromIsContract: false,
                to: toAddress,
                toLabel: null,
                toIsENS: false,
                toIsContract: false,
                type: nftType,
                quantity: quantity,
                nftName: nftName || 'Unknown NFT',
                nftImage: '/images/main/nft-placeholder.svg',
                tokenAddress: tx.to,
                tokenId: tokenId
              });
            }
          }
        } catch (error) {
          console.error(`Error processing transaction ${tx.hash}:`, error);
        }
      }
      
      return nftTransfers;
      
    } catch (error) {
      console.error('Error fetching NFT transfers:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
const veroService = new VeroService();
export default veroService;