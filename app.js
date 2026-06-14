// Global Web3 State
let web3Provider = null;
let web3Signer = null;
let userWalletAddress = null;

// DOM Elements
const DOM = {
    btnConnect: document.getElementById('btnConnect'),
    walletAddress: document.getElementById('walletAddress'),
    btnExecuteDeploy: document.getElementById('btnExecuteDeploy'),
    btnExecuteSwap: document.getElementById('btnExecuteSwap'),
    swapInputEvoz: document.getElementById('swapInputEvoz'),
    swapLogs: document.getElementById('swapLogs'),
    factoryAddress: document.getElementById('factoryAddress'),
    exchangeAddress: document.getElementById('exchangeAddress'),
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

// 1. KONEKSI KE WALLET (METAMASK / TRUST WALLET)
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
    
    const exchangeAddr = DOM.exchangeAddress.value.trim();
    if (!exchangeAddr || !exchangeAddr.startsWith("0x")) {
        return alert("Harap isi alamat Exchange Contract dengan benar!");
    }

    const amountEvoz = DOM.swapInputEvoz.value.trim();
    if (!amountEvoz || parseFloat(amountEvoz) <= 0) return alert("Masukkan jumlah koin EVOZ yang valid.");

    try {
        DOM.btnExecuteSwap.disabled = true;
        DOM.swapLogs.innerText = "[Processing] Menunggu konfirmasi dompet...";

        // Konversi jumlah EVOZ inputan ke satuan Wei
        const amountInWei = ethers.parseEther(amountEvoz);

        // Eksekusi pengiriman koin native ke kontrak exchange (Trigger Payable)
        const tx = await web3Signer.sendTransaction({
            to: exchangeAddr,
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

    const factoryAddr = DOM.factoryAddress.value.trim();
    if (!factoryAddr || !factoryAddr.startsWith("0x")) {
        return alert("Harap isi alamat Factory Contract dengan benar!");
    }

    try {
        DOM.btnExecuteDeploy.disabled = true;
        updateLogDisplay("Mulai membaca data parameter Token Anda...");

        // Buat instance Factory Contract (ABI minimal sesuai fungsi penting)
        const factoryAbi = [
            "function evozx() public view returns (address)",
            "function createToken(tuple(string name, string symbol, uint256 supply, bool mintable, bool burnable, bool ownershipEnabled, bool tradingControlEnabled, bool maxWalletEnabled, bool maxTxEnabled, bool buyTaxEnabled, bool sellTaxEnabled, uint8 buyTax, uint8 sellTax, uint8 burnTaxShare, address marketingWallet, address developmentWallet) config) public returns (address)"
        ];
        const factoryContract = new ethers.Contract(factoryAddr, factoryAbi, web3Signer);

        // A. AMBIL ALAMAT TOKEN EVOZX DARI KONTRAK FACTORY
        updateLogDisplay("Menghubungkan ke sistem pembayaran Factory...");
        const evozxTokenAddress = await factoryContract.evozx();

        // ABI Minimal ERC20 untuk melakukan Approve Token
        const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const tokenContract = new ethers.Contract(evozxTokenAddress, erc20Abi, web3Signer);

        // B. PROSES APPROVE (Angka di-hardcode besar / disesuaikan kebutuhan fee sistem kamu)
        // Disarankan sesuaikan jumlah persis fee jika factory kamu punya fungsi penarik data fee.
        // Di sini kita minta persetujuan izin pakai token EVOZX senilai perkiraan fee pasar.
        const tokenAmountToApprove = ethers.parseEther("1000"); // Contoh izin: 1000 EVOZX

        updateLogDisplay("Meminta Izin (Approve) pemotongan Token EVOZX untuk biaya Deploy...");
        const approveTx = await tokenContract.approve(factoryAddr, tokenAmountToApprove);
        updateLogDisplay(`Menunggu konfirmasi Approve di dompet: ${approveTx.hash.substring(0,12)}...`);
        await approveTx.wait();
        updateLogDisplay("Approve Sukses! Kontrak Factory diizinkan menarik Token EVOZX.");

        // C. SUSUN STRUCT CONFIG TOKEN BERDASARKAN INPUT USER DI WEB
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
            marketingWallet: userWalletAddress, // default ke pembuat
            developmentWallet: userWalletAddress // default ke pembuat
        };

        // D. EKSEKUSI PENUH CREATE TOKEN (Gas fee otomatis ditagih pakai Koin EVOZ oleh MetaMask)
        updateLogDisplay("Meminta konfirmasi akhir untuk Deploy Token Baru...");
        const deployTx = await factoryContract.createToken(tokenConfig);
        updateLogDisplay(`Transaksi pembuatan dikirim ke blockchain: ${deployTx.hash}`);
        
        await deployTx.wait();
        updateLogDisplay("💥 BOOM! TOKEM KAMU BERHASIL DI-DEPLOY DI EVOZ MAINNET! Check dompet kamu.");
        DOM.btnExecuteDeploy.disabled = false;
    } catch (err) {
        updateLogDisplay(`Proses Gagal/Dibatalkan: ${err.message}`);
        DOM.btnExecuteDeploy.disabled = false;
    }
}
