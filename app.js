// Global Web3 State
let web3Provider = null;
let web3Signer = null;
let userWalletAddress = null;

// !!! MASUKKAN ALAMAT KONTRAK ASLI KAMU DI SINI (BIAR USER GAK LIHAT DAN GAK USAH INPUT) !!!
const FACTORY_CONTRACT_ADDRESS = "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB"; 
const EXCHANGE_CONTRACT_ADDRESS = "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8"; 

// DOM Elements
const DOM = {
    btnConnect: document.getElementById('btnConnect'),
    walletAddress: document.getElementById('walletAddress'),
    btnExecuteDeploy: document.getElementById('btnExecuteDeploy'),
    btnExecuteSwap: document.getElementById('btnExecuteSwap'),
    swapInputEvoz: document.getElementById('swapInputEvoz'),
    swapLogs: document.getElementById('swapLogs'),
    logDisplay: document.getElementById('logDisplay'),
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
    featSellTax: document.getElementById('featSellTax')
};

// Pemicu Awal Aplikasi
window.addEventListener('DOMContentLoaded', () => {
    DOM.btnConnect.addEventListener('click', connectUserWallet);
    DOM.btnExecuteDeploy.addEventListener('click', startTokenDeploymentProcess);
    DOM.btnExecuteSwap.addEventListener('click', executeEvozToEvozxSwap);
});

// Fungsi Menampilkan Log Sistem
function updateLogDisplay(text) {
    DOM.logDisplay.innerText = `[${new Date().toLocaleTimeString()}] ${text}\n` + DOM.logDisplay.innerText;
}

// 1. KONEKSI KE WALLET
async function connectUserWallet() {
    if (!window.ethereum) {
        alert("DApp Browser tidak terdeteksi! Buka situs ini dari dalam aplikasi MetaMask atau Trust Wallet HP Anda.");
        return;
    }
    try {
        web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3Signer = await web3Provider.getSigner();
        userWalletAddress = accounts[0];
        
        DOM.walletAddress.innerText = `Connected: ${userWalletAddress.substring(0, 6)}...${userWalletAddress.substring(38)}`;
        DOM.btnConnect.innerText = "Connected ✅";
        updateLogDisplay("Dompet berhasil terhubung. Siap bertransaksi.");
    } catch (err) {
        updateLogDisplay(`Gagal koneksi wallet: ${err.message}`);
    }
}

// 2. FITUR SWAP: TUKAR NATIVE EVOZ MENJADI TOKEN EVOZX
async function executeEvozToEvozxSwap() {
    if (!web3Signer) return alert("Silakan hubungkan dompet Anda terlebih dahulu.");
    
    if (EXCHANGE_CONTRACT_ADDRESS.includes("LuDisini") || !EXCHANGE_CONTRACT_ADDRESS.startsWith("0x")) {
        return alert("Developer belum memasukkan alamat Exchange Contract yang valid di app.js!");
    }

    const amountEvoz = DOM.swapInputEvoz.value.trim();
    if (!amountEvoz || parseFloat(amountEvoz) <= 0) return alert("Masukkan jumlah koin EVOZ yang valid.");

    try {
        DOM.btnExecuteSwap.disabled = true;
        DOM.swapLogs.innerText = "[Processing] Menunggu konfirmasi dompet...";

        const amountInWei = ethers.parseEther(amountEvoz);

        // Kirim koin native langsung ke target alamat Exchange yang di-hardcode
        const tx = await web3Signer.sendTransaction({
            to: EXCHANGE_CONTRACT_ADDRESS,
            value: amountInWei
        });

        DOM.swapLogs.innerText = `[Sent] Transaksi dikirim: ${tx.hash.substring(0, 10)}...`;
        updateLogDisplay(`Mengeksekusi swap di Exchange: ${tx.hash}`);
        
        await tx.wait();
        DOM.swapLogs.innerText = "[Success] Swap Berhasil! Saldo Token EVOZX Anda sudah bertambah.";
        updateLogDisplay("Proses Swap Koin sukses diselesaikan.");
        DOM.btnExecuteSwap.disabled = false;
    } catch (err) {
        DOM.swapLogs.innerText = `[Error] Gagal swap: ${err.message}`;
        DOM.btnExecuteSwap.disabled = false;
    }
}

// 3. PROSES INTI: APPROVE TOKEN EVOZX & DEPLOY TOKEN BARU
async function startTokenDeploymentProcess() {
    if (!web3Signer) return alert("Hubungkan dompet Anda terlebih dahulu!");

    if (FACTORY_CONTRACT_ADDRESS.includes("LuDisini") || !FACTORY_CONTRACT_ADDRESS.startsWith("0x")) {
        return alert("Developer belum memasukkan alamat Factory Contract yang valid di app.js!");
    }

    try {
        DOM.btnExecuteDeploy.disabled = true;
        updateLogDisplay("Mulai membaca data parameter Token Anda...");

        const factoryAbi = [
            "function evozx() public view returns (address)",
            "function createToken(tuple(string name, string symbol, uint256 supply, bool mintable, bool burnable, bool ownershipEnabled, bool tradingControlEnabled, bool maxWalletEnabled, bool maxTxEnabled, bool buyTaxEnabled, bool sellTaxEnabled, uint8 buyTax, uint8 sellTax, uint8 burnTaxShare, address marketingWallet, address developmentWallet) config) public returns (address)"
        ];
        // Pakai FACTORY_CONTRACT_ADDRESS yang di-hardcode di atas
        const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryAbi, web3Signer);

        updateLogDisplay("Menghubungkan ke sistem pembayaran Factory...");
        const evozxTokenAddress = await factoryContract.evozx();

        const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const tokenContract = new ethers.Contract(evozxTokenAddress, erc20Abi, web3Signer);

        // Limit persetujuan izin pakai token EVOZX (bisa lu ubah nominalnya sesuka hati)
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
        updateLogDisplay("💥 BOOM! TOKEM KAMU BERHASIL DI-DEPLOY DI EVOZ MAINNET!");
        DOM.btnExecuteDeploy.disabled = false;
    } catch (err) {
        updateLogDisplay(`Proses Gagal/Dibatalkan: ${err.message}`);
        DOM.btnExecuteDeploy.disabled = false;
    }
}
