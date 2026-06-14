// Global Web3 State
let web3Provider = null;
let web3Signer = null;
let userWalletAddress = null;

// !!! MASUKKAN ALAMAT KONTRAK ASLI KAMU DI SINI !!!
const FACTORY_CONTRACT_ADDRESS = "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB"; 
const EXCHANGE_CONTRACT_ADDRESS = "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8"; 

// ABI UTUH EXCHANGE (Sesuai yang kamu berikan)
const EXCHANGE_ABI = [
    {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "buyer", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "evozPaid", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "evozxReceived", "type": "uint256"}], "name": "EVOZXPurchased", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "EVOZXWithdrawn", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": false, "internalType": "address", "name": "oldOwner", "type": "address"}, {"indexed": false, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": false, "internalType": "bool", "name": "status", "type": "bool"}], "name": "PauseUpdated", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "oldRate", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "newRate", "type": "uint256"}], "name": "RateUpdated", "type": "event"},
    {"anonymous": false, "inputs": [{"indexed": false, "internalType": "address", "name": "oldTreasury", "type": "address"}, {"indexed": false, "internalType": "address", "name": "newTreasury", "type": "address"}], "name": "TreasuryUpdated", "type": "event"},
    {"inputs": [], "name": "buyEVOZX", "outputs": [], "stateMutability": "payable", "type": "function"},
    {"inputs": [], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "evozx", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getAvailableStock", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "paused", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "rate", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "bool", "name": "status", "type": "bool"}], "name": "setPaused", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "newRate", "type": "uint256"}], "name": "setRate", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "newTreasury", "type": "address"}], "name": "setTreasury", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "treasury", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "withdrawEVOZX", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "withdrawNative", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
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
    tokenName: document.getElementById('tokenName'),
    tokenSymbol: document.getElementById('tokenSymbol'),
    tokenSupply: document.getElementById('tokenSupply'),
    featMintable: document.getElementById('featMintable'),
    featBurnable: document.getElementById('featBurnable'),
    featOwnership: document.getElementById('featOwnership'),
    featTrading: document.getElementById('featTrading'),
    featMaxWallet: document.getElementById('featMaxWallet'),
    featMaxTx: document.getElementById('featMaxTx'),
    featBuyTax: document.getElementById('featBuyTax'),
    featSellTax: document.getElementById('featSellTax')
};

// Pemicu Awal Aplikasi
window.addEventListener('DOMContentLoaded', () => {
    DOM.btnConnect.addEventListener('click', connectUserWallet);
    DOM.btnExecuteDeploy.addEventListener('click', startTokenDeploymentProcess);
    DOM.btnExecuteSwap.addEventListener('click', executeEvozToEvozxSwap);
});

function updateLogDisplay(text) {
    DOM.logDisplay.innerText = `[${new Date().toLocaleTimeString()}] ${text}\n` + DOM.logDisplay.innerText;
}

// 1. KONEKSI KE WALLET & CEK AUTOMATIS KONDISI EXCHANGE
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

        // Jalankan pengecekan sisa stock kontrak di balik layar
        await checkExchangeContractStatus();
    } catch (err) {
        updateLogDisplay(`Gagal koneksi wallet: ${err.message}`);
    }
}

// FUNGSI CEK STATUS STOCK & RATE KONTRAK EXCHANGE SECARA LIVE
async function checkExchangeContractStatus() {
    try {
        const exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_ABI, web3Provider);
        
        // Ambil data stock dan rate langsung dari blockchain
        const currentRate = await exchangeContract.rate();
        const rawStock = await exchangeContract.getAvailableStock();
        const formattedStock = ethers.formatEther(rawStock);

        DOM.swapLogs.innerText = `Rate: 1 EVOZX = ${currentRate} EVOZ | Stock: ${parseFloat(formattedStock).toFixed(2)} EVOZX`;
        
        if (parseFloat(formattedStock) <= 0) {
            updateLogDisplay("⚠️ PERINGATAN: Stock EVOZX di dalam kontrak Exchange bernilai 0! Transaksi swap pasti akan gagal sampai Developer mengisi ulang saldo kontrak.");
        }
    } catch (err) {
        console.error(err);
        DOM.swapLogs.innerText = "Gagal memuat status live Exchange.";
    }
}

// 2. FITUR SWAP MENGGUNAKAN AMANAH ABI BARU
async function executeEvozToEvozxSwap() {
    if (!web3Signer) return alert("Silakan hubungkan dompet Anda terlebih dahulu.");
    
    if (EXCHANGE_CONTRACT_ADDRESS.includes("LuDisini") || !EXCHANGE_CONTRACT_ADDRESS.startsWith("0x")) {
        return alert("Alamat Exchange Contract di app.js belum diisi!");
    }

    const amountEvoz = DOM.swapInputEvoz.value.trim();
    if (!amountEvoz || parseFloat(amountEvoz) <= 0) return alert("Masukkan jumlah koin EVOZ yang valid.");

    try {
        DOM.btnExecuteSwap.disabled = true;
        DOM.swapLogs.innerText = "[Processing] Mengecek ketersediaan di blockchain...";

        const exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_ABI, web3Signer);
        
        // Proteksi sebelum user bayar gas fee sia-sia
        const stock = await exchangeContract.getAvailableStock();
        if (stock === 0n) {
            DOM.btnExecuteSwap.disabled = false;
            DOM.swapLogs.innerText = "[Error] Gagal: Stock di dalam kontrak kosong!";
            return alert("Gagal transaksi: Kontrak Exchange kehabisan stock token EVOZX. Hubungi developer untuk isi saldo kontrak.");
        }

        DOM.swapLogs.innerText = "[Processing] Menunggu konfirmasi di MetaMask...";
        const amountInWei = ethers.parseEther(amountEvoz);

        // Eksekusi penembakan fungsi buyEVOZX
        const tx = await exchangeContract.buyEVOZX({
            value: amountInWei
        });

        DOM.swapLogs.innerText = `[Sent] Transaksi diproses: ${tx.hash.substring(0, 10)}...`;
        updateLogDisplay(`Mengeksekusi swap: ${tx.hash}`);
        
        await tx.wait();
        DOM.swapLogs.innerText = "[Success] Swap Berhasil! Saldo Token EVOZX Anda bertambah.";
        updateLogDisplay("Proses Swap koin berhasil diselesaikan.");
        DOM.btnExecuteSwap.disabled = false;
        
        // Refresh info status stock pasca swap sukses
        await checkExchangeContractStatus();
    } catch (err) {
        DOM.swapLogs.innerText = `[Error] Gagal swap: ${err.message}`;
        DOM.btnExecuteSwap.disabled = false;
    }
}

// 3. PROSES INTI: APPROVE TOKEN EVOZX & DEPLOY TOKEN BARU
async function startTokenDeploymentProcess() {
    if (!web3Signer) return alert("Hubungkan dompet Anda terlebih dahulu!");

    if (FACTORY_CONTRACT_ADDRESS.includes("LuDisini") || !FACTORY_CONTRACT_ADDRESS.startsWith("0x")) {
        return alert("Alamat Factory Contract di app.js belum diisi!");
    }

    try {
        DOM.btnExecuteDeploy.disabled = true;
        updateLogDisplay("Mulai membaca data parameter Token Anda...");

        const factoryAbi = [
            "function evozx() public view returns (address)",
            "function createToken(tuple(string name, string symbol, uint256 supply, bool mintable, bool burnable, bool ownershipEnabled, bool tradingControlEnabled, bool maxWalletEnabled, bool maxTxEnabled, bool buyTaxEnabled, bool sellTaxEnabled, uint8 buyTax, uint8 sellTax, uint8 burnTaxShare, address marketingWallet, address developmentWallet) config) public returns (address)"
        ];
        const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryAbi, web3Signer);

        updateLogDisplay("Menghubungkan ke sistem pembayaran Factory...");
        const evozxTokenAddress = await factoryContract.evozx();

        const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const tokenContract = new ethers.Contract(evozxTokenAddress, erc20Abi, web3Signer);

        const tokenAmountToApprove = ethers.parseEther("5000"); 

        updateLogDisplay("Meminta Izin (Approve) pemotongan Token EVOZX untuk biaya Deploy...");
        const approveTx = await tokenContract.approve(FACTORY_CONTRACT_ADDRESS, tokenAmountToApprove);
        updateLogDisplay(`Menunggu konfirmasi Approve di dompet: ${approveTx.hash.substring(0,12)}...`);
        await approveTx.wait();
        updateLogDisplay("Approve Sukses! Kontrak Factory diizinkan menarik Token EVOZX.");

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

        updateLogDisplay("Meminta konfirmasi akhir untuk Deploy Token Baru...");
        const deployTx = await factoryContract.createToken(tokenConfig);
        updateLogDisplay(`Transaksi pembuatan dikirim ke blockchain: ${deployTx.hash}`);
        
        await deployTx.wait();
        updateLogDisplay("💥 BOOM! TOKEN KAMU BERHASIL DI-DEPLOY DI EVOZ MAINNET!");
        DOM.btnExecuteDeploy.disabled = false;
    } catch (err) {
        updateLogDisplay(`Proses Gagal/Dibatalkan: ${err.message}`);
        DOM.btnExecuteDeploy.disabled = false;
    }
}
