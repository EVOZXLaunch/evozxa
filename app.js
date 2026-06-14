// Global Web3 State
let web3Provider = null;
let web3Signer = null;
let userWalletAddress = null;
let currentTotalFee = 10; // Default base fee awal

// !!! MASUKKAN ALAMAT KONTRAK ASLI KAMU DI SINI !!!
const FACTORY_CONTRACT_ADDRESS = "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB"; 
const EXCHANGE_CONTRACT_ADDRESS = "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8"; 

// STRUKTUR KONSTAN BIAYA SESUAI SMART CONTRACT FACTORY
const FEE_PRICING = {
    base: 10,
    mintable: 20,
    burnable: 5,
    ownership: 5,
    trading: 10,
    maxWallet: 5,
    maxTx: 5,
    buyTax: 20,
    sellTax: 20
};

// ABI UTUH EXCHANGE (Sesuai spesifikasi Anda)
const EXCHANGE_ABI = [
    {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
    {"inputs": [], "name": "buyEVOZX", "outputs": [], "stateMutability": "payable", "type": "function"},
    {"inputs": [], "name": "getAvailableStock", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "rate", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"stateMutability": "payable", "type": "receive"}
];

// DOM Elements
const DOM = {
    btnConnect: document.getElementById('btnConnect'),
    walletAddress: document.getElementById('walletAddress'),
    btnExecuteDeploy: document.getElementById('btnExecuteDeploy'),
    btnExecuteSwap: document.getElementById('btnExecuteSwap'),
    swapInputEvoz: document.getElementById('swapInputEvoz'),
    swapLogs: document.getElementById('swapLogs'),
    logDisplay: document.getElementById('logDisplay'),
    feeTotalDisplay: document.getElementById('feeTotalDisplay'),
    // Inputs Form
    tokenName: document.getElementById('tokenName'),
    tokenSymbol: document.getElementById('tokenSymbol'),
    tokenSupply: document.getElementById('tokenSupply'),
    // Checkboxes Fitur
    featMintable: document.getElementById('featMintable'),
    featBurnable: document.getElementById('featBurnable'),
    featOwnership: document.getElementById('featOwnership'),
    featTrading: document.getElementById('featTrading'),
    featMaxWallet: document.getElementById('featMaxWallet'),
    featMaxTx: document.getElementById('featMaxTx'),
    featBuyTax: document.getElementById('featBuyTax'),
    featSellTax: document.getElementById('featSellTax'),
    // Rows Rincian Biaya
    rowMintable: document.getElementById('rowMintable'),
    rowBurnable: document.getElementById('rowBurnable'),
    rowOwnership: document.getElementById('rowOwnership'),
    rowTrading: document.getElementById('rowTrading'),
    rowMaxWallet: document.getElementById('rowMaxWallet'),
    rowMaxTx: document.getElementById('rowMaxTx'),
    rowBuyTax: document.getElementById('rowBuyTax'),
    rowSellTax: document.getElementById('rowSellTax')
};

// Pemicu Awal Aplikasi
window.addEventListener('DOMContentLoaded', () => {
    DOM.btnConnect.addEventListener('click', connectUserWallet);
    DOM.btnExecuteDeploy.addEventListener('click', startTokenDeploymentProcess);
    DOM.btnExecuteSwap.addEventListener('click', executeEvozToEvozxSwap);

    // Pasang Event Listener ke semua Checkbox agar Rincian Biaya Ter-update Otomatis
    const allCheckboxes = [
        DOM.featMintable, DOM.featBurnable, DOM.featOwnership, DOM.featTrading,
        DOM.featMaxWallet, DOM.featMaxTx, DOM.featBuyTax, DOM.featSellTax
    ];
    allCheckboxes.forEach(cb => cb.addEventListener('change', calculateLiveFees));
    
    // Hitung di awal loading
    calculateLiveFees();
});

function updateLogDisplay(text) {
    DOM.logDisplay.innerText = `[${new Date().toLocaleTimeString()}] ${text}\n` + DOM.logDisplay.innerText;
}

// FUNGSI UTAMA HITUNG BIAYA DINAMIS (REAL-TIME CALCULATOR)
function calculateLiveFees() {
    let total = FEE_PRICING.base;

    // Mintable
    if (DOM.featMintable.checked) { total += FEE_PRICING.mintable; DOM.rowMintable.style.display = 'flex'; }
    else { DOM.rowMintable.style.display = 'none'; }
    
    // Burnable
    if (DOM.featBurnable.checked) { total += FEE_PRICING.burnable; DOM.rowBurnable.style.display = 'flex'; }
    else { DOM.rowBurnable.style.display = 'none'; }

    // Ownership
    if (DOM.featOwnership.checked) { total += FEE_PRICING.ownership; DOM.rowOwnership.style.display = 'flex'; }
    else { DOM.rowOwnership.style.display = 'none'; }

    // Trading Control
    if (DOM.featTrading.checked) { total += FEE_PRICING.trading; DOM.rowTrading.style.display = 'flex'; }
    else { DOM.rowTrading.style.display = 'none'; }

    // Max Wallet
    if (DOM.featMaxWallet.checked) { total += FEE_PRICING.maxWallet; DOM.rowMaxWallet.style.display = 'flex'; }
    else { DOM.rowMaxWallet.style.display = 'none'; }

    // Max Tx
    if (DOM.featMaxTx.checked) { total += FEE_PRICING.maxTx; DOM.rowMaxTx.style.display = 'flex'; }
    else { DOM.rowMaxTx.style.display = 'none'; }

    // Buy Tax
    if (DOM.featBuyTax.checked) { total += FEE_PRICING.buyTax; DOM.rowBuyTax.style.display = 'flex'; }
    else { DOM.rowBuyTax.style.display = 'none'; }

    // Sell Tax
    if (DOM.featSellTax.checked) { total += FEE_PRICING.sellTax; DOM.rowSellTax.style.display = 'flex'; }
    else { DOM.rowSellTax.style.display = 'none'; }

    // Simpan data & render ke layar dashboard
    currentTotalFee = total;
    DOM.feeTotalDisplay.innerText = `${total} EVOZX`;
}

// 1. KONEKSI KE WALLET
async function connectUserWallet() {
    if (!window.ethereum) {
        alert("DApp Browser tidak terdeteksi! Jalankan lewat MetaMask/Trust Wallet HP.");
        return;
    }
    try {
        web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3Signer = await web3Provider.getSigner();
        userWalletAddress = accounts[0];
        
        DOM.walletAddress.innerText = `Connected: ${userWalletAddress.substring(0, 6)}...${userWalletAddress.substring(38)}`;
        DOM.btnConnect.innerText = "Connected ✅";
        updateLogDisplay("Dompet terhubung.");

        await checkExchangeContractStatus();
    } catch (err) {
        updateLogDisplay(`Gagal koneksi wallet: ${err.message}`);
    }
}

async function checkExchangeContractStatus() {
    try {
        const exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_ABI, web3Provider);
        const currentRate = await exchangeContract.rate();
        const rawStock = await exchangeContract.getAvailableStock();
        const formattedStock = ethers.formatEther(rawStock);

        DOM.swapLogs.innerText = `Rate: 1 EVOZX = ${currentRate} EVOZ | Stock: ${parseFloat(formattedStock).toFixed(2)} EVOZX`;
    } catch (err) {
        console.error(err);
    }
}

// 2. FITUR SWAP
async function executeEvozToEvozxSwap() {
    if (!web3Signer) return alert("Silakan hubungkan dompet Anda terlebih dahulu.");
    const amountEvoz = DOM.swapInputEvoz.value.trim();
    if (!amountEvoz || parseFloat(amountEvoz) <= 0) return alert("Masukkan jumlah koin EVOZ yang valid.");

    try {
        DOM.btnExecuteSwap.disabled = true;
        DOM.swapLogs.innerText = "[Processing] Mengecek ketersediaan...";

        const exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_ABI, web3Signer);
        const stock = await exchangeContract.getAvailableStock();
        if (stock === 0n) {
            DOM.btnExecuteSwap.disabled = false;
            DOM.swapLogs.innerText = "[Error] Stock di kontrak kosong!";
            return alert("Kontrak Exchange kehabisan bensin EVOZX.");
        }

        DOM.swapLogs.innerText = "[Processing] Menunggu konfirmasi...";
        const tx = await exchangeContract.buyEVOZX({ value: ethers.parseEther(amountEvoz) });
        await tx.wait();
        
        DOM.swapLogs.innerText = "[Success] Swap Berhasil! Saldo EVOZX bertambah.";
        updateLogDisplay("Proses Swap koin berhasil.");
        DOM.btnExecuteSwap.disabled = false;
        await checkExchangeContractStatus();
    } catch (err) {
        DOM.swapLogs.innerText = `[Error] Gagal swap: ${err.message}`;
        DOM.btnExecuteSwap.disabled = false;
    }
}

// 3. PROSES DEPLOY DENGAN AUTOMATIC APPROVAL FEE PAS
async function startTokenDeploymentProcess() {
    if (!web3Signer) return alert("Hubungkan dompet Anda terlebih dahulu!");

    try {
        DOM.btnExecuteDeploy.disabled = true;
        updateLogDisplay("Membaca parameter konfigurasi token...");

        const factoryAbi = [
            "function evozx() public view returns (address)",
            "function createToken(tuple(string name, string symbol, uint256 supply, bool mintable, bool burnable, bool ownershipEnabled, bool tradingControlEnabled, bool maxWalletEnabled, bool maxTxEnabled, bool buyTaxEnabled, bool sellTaxEnabled, uint8 buyTax, uint8 sellTax, uint8 burnTaxShare, address marketingWallet, address developmentWallet) config) public returns (address)"
        ];
        const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryAbi, web3Signer);

        updateLogDisplay("Menghubungkan ke token pembayaran...");
        const evozxTokenAddress = await factoryContract.evozx();

        const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const tokenContract = new ethers.Contract(evozxTokenAddress, erc20Abi, web3Signer);

        // DINAMIS APPROVE: Mengikuti nilai akurat dari pilihan dashboard user
        const dynamicApproveAmount = ethers.parseEther(currentTotalFee.toString()); 

        updateLogDisplay(`Meminta Izin (Approve) potong tepat ${currentTotalFee} EVOZX untuk deploy...`);
        const approveTx = await tokenContract.approve(FACTORY_CONTRACT_ADDRESS, dynamicApproveAmount);
        await approveTx.wait();
        updateLogDisplay("Approve Sukses! Kontrak Factory diizinkan menarik token.");

        // SUSUN STRUCT CONFIG TOKEN
        const tokenConfig = {
            name: DOM.tokenName.value.trim(),
            symbol: DOM.tokenSymbol.value.trim().toUpperCase(),
            supply: ethers.parseEther(DOM.tokenSupply.value),
            mintable: DOM.featMintable.checked,
            burnable: DOM.featBurnable.checked,
            ownershipEnabled: DOM.featOwnership.checked,
            tradingControlEnabled: DOM.featTrading.checked,
            maxWalletEnabled: DOM.featMaxWallet.checked,
            maxTxEnabled: DOM.featMaxTx.checked,
            buyTaxEnabled: DOM.featBuyTax.checked,
            sellTaxEnabled: DOM.featSellTax.checked,
            buyTax: 0, 
            sellTax: 0,
            burnTaxShare: 0,
            marketingWallet: userWalletAddress, 
            developmentWallet: userWalletAddress 
        };

        updateLogDisplay("Memproses pencetakan Token Baru di Mainnet...");
        const deployTx = await factoryContract.createToken(tokenConfig);
        await deployTx.wait();
        
        updateLogDisplay("💥 BOOM! TOKEN BERHASIL DI-LAUNCH DI EVOZ MAINNET!");
        DOM.btnExecuteDeploy.disabled = false;
    } catch (err) {
        updateLogDisplay(`Proses Gagal: ${err.message}`);
        DOM.btnExecuteDeploy.disabled = false;
    }
    }
            
