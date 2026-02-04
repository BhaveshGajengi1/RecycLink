/**
 * Real Blockchain Service using Arbitrum Sepolia Testnet
 * Handles wallet connection, NFT minting, and blockchain interactions
 */

import { ethers } from 'ethers';

// Arbitrum Sepolia Network Configuration
const ARBITRUM_SEPOLIA = {
    chainId: '0x66eee', // 421614 in hex
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://arbitrum-sepolia.drpc.org'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io/']
};

const CHAIN_ID = 421614;
const RPC_URL = import.meta.env.VITE_ARBITRUM_RPC || 'https://arbitrum-sepolia.drpc.org';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Smart Contract ABI (simplified for demo - will be updated after deployment)
const CONTRACT_ABI = [
    "function mintBadge(address user, uint256 itemsRecycled, uint256 co2Saved, string wasteType, string imageHash) public returns (uint256)",
    "function getUserBadges(address user) public view returns (uint256[])",
    "function getBadgeDetails(uint256 tokenId) public view returns (tuple(uint256 itemsRecycled, uint256 co2Saved, uint256 timestamp, string wasteType, string imageHash))",
    "function balanceOf(address owner) public view returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string)"
];

let provider = null;
let signer = null;
let contract = null;
let currentAddress = null;

/**
 * Check if MetaMask is installed
 * @returns {boolean}
 */
export function isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask wallet
 * @returns {Promise<Object>} Wallet connection details
 */
export async function connectWallet() {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        currentAddress = accounts[0];

        // Check network and switch if needed
        const network = await provider.getNetwork();
        if (network.chainId !== 421614) {
            await switchToArbitrumSepolia();
        }

        // Initialize contract if address is configured
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
            contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
        }

        // Get balance
        const balance = await provider.getBalance(currentAddress);
        const balanceInEth = ethers.utils.formatEther(balance);

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return {
            address: currentAddress,
            balance: balanceInEth,
            network: network.name,
            chainId: network.chainId,
            connected: true
        };

    } catch (error) {
        console.error('Wallet connection error:', error);

        if (error.code === 4001) {
            throw new Error('User rejected the connection request');
        }

        throw new Error(`Failed to connect wallet: ${error.message}`);
    }
}

/**
 * Switch to Arbitrum Sepolia Testnet
 */
async function switchToArbitrumSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARBITRUM_SEPOLIA.chainId }],
        });
    } catch (switchError) {
        // Network not added, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [ARBITRUM_SEPOLIA],
                });
            } catch (addError) {
                throw new Error('Failed to add Arbitrum Sepolia network to MetaMask');
            }
        } else {
            throw switchError;
        }
    }
}

/**
 * Handle account changes
 */
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected
        currentAddress = null;
        signer = null;
        contract = null;
    } else {
        currentAddress = accounts[0];
        window.location.reload(); // Reload to update UI
    }
}

/**
 * Handle chain changes
 */
function handleChainChanged() {
    window.location.reload();
}

/**
 * Disconnect wallet
 */
export function disconnectWallet() {
    currentAddress = null;
    signer = null;
    contract = null;
    provider = null;

    if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
}

/**
 * Get current wallet address
 * @returns {string|null}
 */
export function getCurrentAddress() {
    return currentAddress;
}

/**
 * Check if wallet is connected
 * @returns {boolean}
 */
export function isWalletConnected() {
    return !!currentAddress && !!signer;
}

/**
 * Mint a recycling NFT badge
 * @param {Object} wasteData - Classification data
 * @param {string} imageHash - IPFS hash of the image
 * @returns {Promise<Object>} Transaction details
 */
export async function mintRecyclingNFT(wasteData, imageHash) {
    if (!isWalletConnected()) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    if (!contract) {
        throw new Error('Smart contract not configured. Please check VITE_CONTRACT_ADDRESS in .env');
    }

    try {
        const co2Saved = calculateCO2Saved(wasteData.category);

        // Get current gas price from network
        const feeData = await provider.getFeeData();

        // Set gas fees with buffer for Arbitrum Sepolia
        // Arbitrum uses EIP-1559, so we need maxFeePerGas and maxPriorityFeePerGas
        const maxFeePerGas = feeData.maxFeePerGas
            ? feeData.maxFeePerGas.mul(150).div(100) // 50% buffer
            : ethers.utils.parseUnits('0.1', 'gwei'); // fallback

        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
            ? feeData.maxPriorityFeePerGas.mul(150).div(100) // 50% buffer
            : ethers.utils.parseUnits('0.01', 'gwei'); // fallback

        // Send transaction with explicit gas settings
        const tx = await contract.mintBadge(
            currentAddress,
            1,
            co2Saved,
            wasteData.category,
            imageHash || '',
            {
                maxFeePerGas,
                maxPriorityFeePerGas
            }
        );

        // Wait for confirmation
        const receipt = await tx.wait();

        // Extract token ID from event
        const event = receipt.events?.find(e => e.event === 'BadgeMinted');
        const tokenId = event?.args?.tokenId?.toString() || 'unknown';

        return {
            success: true,
            transactionHash: receipt.transactionHash,
            tokenId,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            explorerUrl: `https://sepolia.arbiscan.io/tx/${receipt.transactionHash}`,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('NFT Minting Error:', error);

        if (error.code === 'INSUFFICIENT_FUNDS') {
            throw new Error('Insufficient ETH balance. Get free testnet ETH from Arbitrum Sepolia faucet');
        } else if (error.code === 4001) {
            throw new Error('Transaction rejected by user');
        }

        throw new Error(`Minting failed: ${error.message}`);
    }
}

/**
 * Get user's NFT badges
 * @returns {Promise<Array>} Array of badge objects
 */
export async function getUserNFTBadges() {
    if (!isWalletConnected()) {
        return [];
    }

    if (!contract) {
        console.warn('Contract not configured');
        return [];
    }

    try {
        const tokenIds = await contract.getUserBadges(currentAddress);

        const badges = await Promise.all(
            tokenIds.map(async (tokenId) => {
                try {
                    const details = await contract.getBadgeDetails(tokenId);
                    return {
                        tokenId: tokenId.toString(),
                        itemsRecycled: details.itemsRecycled.toString(),
                        co2Saved: details.co2Saved.toString(),
                        timestamp: new Date(details.timestamp.toNumber() * 1000),
                        wasteType: details.wasteType,
                        imageHash: details.imageHash,
                        explorerUrl: `https://sepolia.arbiscan.io/token/${contract.address}?a=${tokenId}`
                    };
                } catch (error) {
                    console.error(`Error fetching badge ${tokenId}:`, error);
                    return null;
                }
            })
        );

        return badges.filter(badge => badge !== null);

    } catch (error) {
        console.error('Error fetching badges:', error);
        return [];
    }
}

/**
 * Calculate CO2 saved based on waste category (in grams)
 * @param {string} category - Waste category
 * @returns {number} CO2 saved in grams
 */
function calculateCO2Saved(category) {
    const co2PerItem = {
        plastic: 2000,    // 2kg CO2 per plastic item
        paper: 1500,      // 1.5kg CO2 per paper item
        metal: 3000,      // 3kg CO2 per metal item
        glass: 1000,      // 1kg CO2 per glass item
        organic: 500,     // 0.5kg CO2 per organic item
        electronic: 5000, // 5kg CO2 per electronic item
        hazardous: 1000   // 1kg CO2 per hazardous item
    };

    return co2PerItem[category?.toLowerCase()] || 1000;
}

/**
 * Get wallet balance
 * @returns {Promise<string>} Balance in ETH
 */
export async function getWalletBalance() {
    if (!isWalletConnected() || !provider) {
        return '0';
    }

    try {
        const balance = await provider.getBalance(currentAddress);
        return ethers.utils.formatEther(balance);
    } catch (error) {
        console.error('Error fetching balance:', error);
        return '0';
    }
}

/**
 * Get network info
 * @returns {Promise<Object>} Network details
 */
export async function getNetworkInfo() {
    if (!provider) {
        return null;
    }

    try {
        const network = await provider.getNetwork();
        return {
            name: network.name,
            chainId: network.chainId,
            isTestnet: network.chainId === 421614
        };
    } catch (error) {
        console.error('Error fetching network:', error);
        return null;
    }
}

/**
 * Check if contract is deployed and configured
 * @returns {boolean}
 */
export function isContractConfigured() {
    const address = import.meta.env.VITE_CONTRACT_ADDRESS;
    return !!address && address !== '0x0000000000000000000000000000000000000000';
}

/**
 * Format address for display
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address
 */
export function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get Arbitrum Sepolia testnet faucet URL
 * @returns {string}
 */
export function getFaucetUrl() {
    return 'https://faucet.quicknode.com/arbitrum/sepolia';
}

/**
 * Get Arbiscan URL for address
 * @param {string} address - Ethereum address
 * @returns {string}
 */
export function getExplorerUrl(address) {
    return `https://sepolia.arbiscan.io/address/${address}`;
}
