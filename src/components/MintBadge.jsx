import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import Button from './Button';
import Card from './Card';
import './MintBadge.css';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
    "function mintBadge(address user, uint256 itemsRecycled, uint256 co2Saved, string memory wasteType, string memory imageHash) public returns (uint256)",
    "function getUserBadges(address user) public view returns (uint256[] memory)",
    "function getBadgeDetails(uint256 tokenId) public view returns (tuple(uint256 itemsRecycled, uint256 co2Saved, uint256 timestamp, string wasteType, string imageHash, address recycler))",
    "event BadgeMinted(address indexed user, uint256 indexed tokenId, string wasteType, uint256 co2Saved)"
];

const MintBadge = ({ user, onClose, onSuccess }) => {
    const [minting, setMinting] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, minting, success, error
    const [txHash, setTxHash] = useState('');
    const [tokenId, setTokenId] = useState(null);
    const [error, setError] = useState('');

    const mintNFTBadge = async () => {
        try {
            setMinting(true);
            setStatus('minting');
            setError('');

            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to mint NFT badges!');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer (ethers v5 syntax)
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Check network
            const network = await provider.getNetwork();
            const expectedChainId = parseInt(import.meta.env.VITE_CHAIN_ID || '421614');

            if (network.chainId !== expectedChainId) {
                // Try to switch network
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        // Network not added, add it
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: `0x${expectedChainId.toString(16)}`,
                                chainName: 'Arbitrum Sepolia',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: [import.meta.env.VITE_ARBITRUM_RPC || 'https://arbitrum-sepolia.drpc.org'],
                                blockExplorerUrls: ['https://sepolia.arbiscan.io/']
                            }]
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            // Create contract instance
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Get user's wallet address
            const userAddress = await signer.getAddress();

            // Calculate stats from user data
            const itemsRecycled = user.stats?.totalItems || 10;
            const co2Saved = Math.floor((user.stats?.totalCO2Saved || 25) * 1000); // Convert to grams
            const wasteType = 'Mixed Recycling';
            const imageHash = 'QmRecyclingBadge'; // Placeholder IPFS hash

            // Get current gas price and add buffer
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice;

            // Increase gas price by 20% to ensure transaction goes through
            const adjustedGasPrice = gasPrice.mul(120).div(100);

            // Mint the badge with proper gas settings
            const tx = await contract.mintBadge(
                userAddress,
                itemsRecycled,
                co2Saved,
                wasteType,
                imageHash,
                {
                    gasLimit: 500000, // Set a reasonable gas limit
                    gasPrice: adjustedGasPrice
                }
            );

            setTxHash(tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            // Get token ID from event
            const event = receipt.events?.find(e => e.event === 'BadgeMinted');
            if (event) {
                setTokenId(event.args.tokenId.toString());
            }

            setStatus('success');
            if (onSuccess) onSuccess(receipt);

        } catch (err) {
            console.error('Minting error:', err);
            setStatus('error');
            setError(err.message || 'Failed to mint NFT badge');
        } finally {
            setMinting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="mint-badge-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="mint-badge-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card className="mint-card">
                        <button className="close-button" onClick={onClose}>
                            <X size={24} />
                        </button>

                        {status === 'idle' && (
                            <>
                                <div className="mint-header">
                                    <div className="mint-icon">
                                        <Award size={48} />
                                    </div>
                                    <h2>Mint Your NFT Badge</h2>
                                    <p>Claim your on-chain proof of recycling!</p>
                                </div>

                                <div className="mint-details">
                                    <div className="detail-row">
                                        <span>Items Recycled:</span>
                                        <strong>{user.stats?.totalItems || 10}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>CO₂ Saved:</span>
                                        <strong>{(user.stats?.totalCO2Saved || 25).toFixed(1)} kg</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Network:</span>
                                        <strong>Arbitrum Sepolia</strong>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    icon={<Award size={20} />}
                                    onClick={mintNFTBadge}
                                    loading={minting}
                                    fullWidth
                                >
                                    Mint NFT Badge
                                </Button>
                            </>
                        )}

                        {status === 'minting' && (
                            <div className="mint-status">
                                <Loader className="spinner" size={48} />
                                <h2>Minting Your Badge...</h2>
                                <p>Please confirm the transaction in MetaMask</p>
                                {txHash && (
                                    <a
                                        href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="tx-link"
                                    >
                                        View Transaction
                                    </a>
                                )}
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="mint-status success">
                                <CheckCircle size={48} />
                                <h2>Badge Minted Successfully! 🎉</h2>
                                <p>Your NFT badge has been minted on-chain</p>
                                {tokenId && (
                                    <div className="token-info">
                                        <span>Token ID:</span>
                                        <strong>#{tokenId}</strong>
                                    </div>
                                )}
                                {txHash && (
                                    <a
                                        href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="tx-link"
                                    >
                                        View on Arbiscan
                                    </a>
                                )}
                                <Button
                                    variant="primary"
                                    onClick={onClose}
                                    fullWidth
                                >
                                    Close
                                </Button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mint-status error">
                                <AlertCircle size={48} />
                                <h2>Minting Failed</h2>
                                <p className="error-message">{error}</p>
                                <div className="error-actions">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setStatus('idle')}
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MintBadge;
