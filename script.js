// DOM Elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const walletBalance = document.getElementById('walletBalance');
const solBalance = document.getElementById('solBalance');
const tokenBalances = document.getElementById('tokenBalances');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const createTokenForm = document.getElementById('createTokenForm');
const mintTokenForm = document.getElementById('mintTokenForm');
const sendTokenForm = document.getElementById('sendTokenForm');
const transactionsList = document.getElementById('transactionsList');
const notification = document.getElementById('notification');

// Solana connection
const solanaWeb3 = window.solanaWeb3;
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
let wallet = null;
let publicKey = null;

// Initialize Phantom wallet connection
async function initWallet() {
    if (window.solana) {
        wallet = window.solana;
        
        // Check if already connected
        if (wallet.isConnected) {
            publicKey = new solanaWeb3.PublicKey(wallet.publicKey.toString());
            updateWalletUI();
        }
        
        // Listen for account changes
        wallet.on('accountChanged', () => {
            if (wallet.isConnected) {
                publicKey = new solanaWeb3.PublicKey(wallet.publicKey.toString());
                updateWalletUI();
                fetchBalances();
            } else {
                disconnectWallet();
            }
        });
    } else {
        showNotification('Phantom wallet not detected. Please install it from https://phantom.app/', 'error');
    }
}

// Connect wallet
async function connectWallet() {
    try {
        if (!wallet) {
            showNotification('Wallet not initialized', 'error');
            return;
        }
        
        await wallet.connect();
        publicKey = new solanaWeb3.PublicKey(wallet.publicKey.toString());
        updateWalletUI();
        fetchBalances();
        showNotification('Wallet connected successfully', 'success');
    } catch (error) {
        showNotification('Failed to connect wallet: ' + error.message, 'error');
    }
}

// Disconnect wallet
function disconnectWallet() {
    if (wallet && wallet.disconnect) {
        wallet.disconnect();
    }
    wallet = null;
    publicKey = null;
    
    connectWalletBtn.classList.remove('hidden');
    walletInfo.classList.add('hidden');
    
    solBalance.textContent = '0.00 SOL';
    tokenBalances.innerHTML = '';
    transactionsList.innerHTML = '<p class="empty-message">No transactions yet</p>';
    
    showNotification('Wallet disconnected', 'warning');
}

// Update wallet UI
function updateWalletUI() {
    const shortAddress = `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
    walletAddress.textContent = shortAddress;
    walletAddress.title = publicKey.toString();
    
    connectWalletBtn.classList.add('hidden');
    walletInfo.classList.remove('hidden');
}

// Fetch balances
async function fetchBalances() {
    if (!publicKey) return;
    
    try {
        // Fetch SOL balance
        const balance = await connection.getBalance(publicKey);
        const solBalanceValue = balance / solanaWeb3.LAMPORTS_PER_SOL;
        solBalance.textContent = solBalanceValue.toFixed(2) + ' SOL';
        walletBalance.textContent = solBalanceValue.toFixed(2) + ' SOL';
        
        // TODO: Fetch token balances
        // This would require knowing the token mint addresses
        tokenBalances.innerHTML = '<p>Connect to see your token balances</p>';
    } catch (error) {
        showNotification('Failed to fetch balances: ' + error.message, 'error');
    }
}

// Create token
async function createToken(tokenName, tokenSymbol, decimals) {
    if (!publicKey) {
        showNotification('Please connect your wallet first', 'error');
        return null;
    }
    
    try {
        showNotification('Creating token...', 'warning');
        
        // In a real app, you would use the SPL Token Program to create a new mint
        // This is a simplified version for demonstration
        
        // Simulate token creation (replace with actual SPL token creation)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tokenAddress = 'Token_' + Math.random().toString(36).substring(2, 10);
        
        showNotification(`Token ${tokenSymbol} created successfully!`, 'success');
        addTransaction('Token Created', tokenSymbol, tokenAddress, 'success');
        
        return tokenAddress;
    } catch (error) {
        showNotification('Failed to create token: ' + error.message, 'error');
        addTransaction('Token Creation Failed', tokenSymbol, '', 'failed');
        return null;
    }
}

// Mint tokens
async function mintTokens(tokenAddress, amount) {
    if (!publicKey) {
        showNotification('Please connect your wallet first', 'error');
        return false;
    }
    
    try {
        showNotification('Minting tokens...', 'warning');
        
        // Simulate minting (replace with actual SPL token minting)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showNotification(`${amount} tokens minted successfully!`, 'success');
        addTransaction('Tokens Minted', amount, tokenAddress, 'success');
        
        return true;
    } catch (error) {
        showNotification('Failed to mint tokens: ' + error.message, 'error');
        addTransaction('Mint Failed', amount, tokenAddress, 'failed');
        return false;
    }
}

// Send tokens
async function sendTokens(tokenAddress, recipient, amount) {
    if (!publicKey) {
        showNotification('Please connect your wallet first', 'error');
        return false;
    }
    
    try {
        showNotification('Sending tokens...', 'warning');
        
        // Simulate sending (replace with actual SPL token transfer)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showNotification(`${amount} tokens sent to ${recipient.slice(0, 4)}...${recipient.slice(-4)}`, 'success');
        addTransaction('Tokens Sent', amount, recipient, 'success');
        
        return true;
    } catch (error) {
        showNotification('Failed to send tokens: ' + error.message, 'error');
        addTransaction('Send Failed', amount, recipient, 'failed');
        return false;
    }
}

// Add transaction to history
function addTransaction(type, amount, address, status) {
    if (transactionsList.querySelector('.empty-message')) {
        transactionsList.innerHTML = '';
    }
    
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    
    const leftDiv = document.createElement('div');
    leftDiv.innerHTML = `
        <div class="transaction-type">${type}</div>
        <div>${address ? address.slice(0, 4) + '...' + address.slice(-4) : ''}</div>
    `;
    
    const rightDiv = document.createElement('div');
    rightDiv.className = `transaction-${status}`;
    rightDiv.textContent = amount;
    
    transactionItem.appendChild(leftDiv);
    transactionItem.appendChild(rightDiv);
    
    transactionsList.insertBefore(transactionItem, transactionsList.firstChild);
}

// Show notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Form submissions
createTokenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tokenName = document.getElementById('tokenName').value;
    const tokenSymbol = document.getElementById('tokenSymbol').value;
    const tokenDecimals = parseInt(document.getElementById('tokenDecimals').value);
    
    const tokenAddress = await createToken(tokenName, tokenSymbol, tokenDecimals);
    if (tokenAddress) {
        createTokenForm.reset();
    }
});

mintTokenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tokenAddress = document.getElementById('mintTokenAddress').value;
    const amount = document.getElementById('mintAmount').value;
    
    const success = await mintTokens(tokenAddress, amount);
    if (success) {
        mintTokenForm.reset();
    }
});

sendTokenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tokenAddress = document.getElementById('sendTokenAddress').value;
    const recipient = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('sendAmount').value;
    
    const success = await sendTokens(tokenAddress, recipient, amount);
    if (success) {
        sendTokenForm.reset();
    }
});

// Event listeners
connectWalletBtn.addEventListener('click', connectWallet);
disconnectWalletBtn.addEventListener('click', disconnectWallet);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initWallet();
});