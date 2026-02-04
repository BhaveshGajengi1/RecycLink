import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';
import {
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
    getCurrentAddress,
    getWalletBalance,
    formatAddress,
    getFaucetUrl,
    getExplorerUrl
} from '../services/realBlockchainService';
import './WalletConnect.css';

const WalletConnect = ({ onConnect }) => {
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState('0');
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if already connected
        const currentAddr = getCurrentAddress();
        if (currentAddr) {
            setAddress(currentAddr);
            updateBalance();
        }
    }, []);

    const updateBalance = async () => {
        try {
            const bal = await getWalletBalance();
            setBalance(bal);
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };

    const handleConnect = async () => {
        if (!isMetaMaskInstalled()) {
            setError('MetaMask not installed. Please install MetaMask extension.');
            return;
        }

        setConnecting(true);
        setError(null);

        try {
            const wallet = await connectWallet();
            setAddress(wallet.address);
            setBalance(wallet.balance);

            if (onConnect) {
                onConnect(wallet);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        setAddress(null);
        setBalance('0');
        setShowDetails(false);
    };

    const balanceNum = parseFloat(balance);
    const isLowBalance = balanceNum < 0.1;

    return (
        <div className="wallet-connect">
            {!address ? (
                <div className="wallet-connect-prompt">
                    <Button
                        onClick={handleConnect}
                        loading={connecting}
                        icon={<Wallet size={20} />}
                        variant="primary"
                    >
                        {connecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>

                    {error && (
                        <motion.div
                            className="wallet-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                            {error.includes('MetaMask') && (
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="install-link"
                                >
                                    Install MetaMask
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </motion.div>
                    )}
                </div>
            ) : (
                <div className="wallet-connected">
                    <motion.div
                        className="wallet-info"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <div className="wallet-icon">
                            <Wallet size={18} />
                            <CheckCircle size={12} className="connected-badge" />
                        </div>
                        <div className="wallet-details">
                            <span className="wallet-address">{formatAddress(address)}</span>
                            <span className={`wallet-balance ${isLowBalance ? 'low' : ''}`}>
                                {balanceNum.toFixed(4)} ETH
                            </span>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                className="wallet-dropdown"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="dropdown-section">
                                    <label>Address</label>
                                    <div className="address-full">
                                        {address}
                                        <button
                                            onClick={() => navigator.clipboard.writeText(address)}
                                            className="copy-btn"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="dropdown-section">
                                    <label>Balance</label>
                                    <div className="balance-info">
                                        <span className="balance-amount">
                                            {balanceNum.toFixed(6)} ETH
                                        </span>
                                        {isLowBalance && (
                                            <a
                                                href={getFaucetUrl()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="faucet-link"
                                            >
                                                Get Test ETH
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="dropdown-actions">
                                    <a
                                        href={getExplorerUrl(address)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="explorer-link"
                                    >
                                        View on Arbiscan
                                        <ExternalLink size={14} />
                                    </a>
                                    <button onClick={handleDisconnect} className="disconnect-btn">
                                        Disconnect
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default WalletConnect;
