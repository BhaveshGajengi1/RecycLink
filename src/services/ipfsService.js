/**
 * IPFS Service using Pinata (Free, no credit card required)
 * Alternative to Web3.Storage
 */

const PINATA_API_URL = 'https://api.pinata.cloud';

/**
 * Upload file to IPFS via Pinata
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Upload result with CID and URLs
 */
export async function uploadToIPFS(file) {
    const jwt = import.meta.env.VITE_PINATA_JWT;

    // If Pinata not configured, return mock data
    if (!jwt || jwt === '') {
        console.warn('⚠️ Pinata JWT not configured, skipping IPFS upload');
        return null;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const metadata = JSON.stringify({
            name: `recyclink-${Date.now()}-${file.name}`,
        });
        formData.append('pinataMetadata', metadata);

        const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Pinata upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        const cid = data.IpfsHash;

        return {
            success: true,
            cid,
            fileName: file.name,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
            gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
            dweb: `ipfs://${cid}`,
            timestamp: new Date().toISOString(),
            size: file.size,
            type: file.type
        };

    } catch (error) {
        console.error('IPFS Upload Error:', error);
        throw new Error(`IPFS upload failed: ${error.message}`);
    }
}

/**
 * Retrieve file from IPFS
 * @param {string} cid - Content Identifier
 * @returns {Promise<Object>} File data
 */
export async function retrieveFromIPFS(cid) {
    try {
        const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to retrieve ${cid}`);
        }

        return {
            success: true,
            url,
            cid
        };

    } catch (error) {
        console.error('IPFS Retrieval Error:', error);
        throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
    }
}

/**
 * Generate IPFS gateway URL
 * @param {string} cid - Content Identifier
 * @returns {string} Gateway URL
 */
export function getIPFSUrl(cid) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Check if IPFS is configured
 * @returns {boolean}
 */
export function isIPFSConfigured() {
    const jwt = import.meta.env.VITE_PINATA_JWT;
    return !!jwt && jwt !== '';
}

/**
 * Validate file for IPFS upload
 * @param {File} file - File to validate
 * @returns {boolean}
 */
export function validateFileForIPFS(file) {
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (file.size > maxSize) {
        throw new Error('File too large for IPFS. Maximum size is 100MB.');
    }

    return true;
}
