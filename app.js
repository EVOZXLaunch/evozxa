// CONFIGURATION ECOSYSTEM
const EVOZ_CHAIN_ID = 805;

// KAMUS ABI SMART CONTRACT ROOT FACTORY
const FACTORY_ABI = [
    {
        "inputs": [{
            "components": [
                {"name": "name", "type": "string"}, {"name": "symbol", "type": "string"}, {"name": "supply", "type": "uint256"},
                {"name": "owner", "type": "address"}, {"name": "chainId", "type": "uint256"}, {"name": "launchKitVersion", "type": "uint16"},
                {"name": "burnable", "type": "bool"}, {"name": "mintable", "type": "bool"}, {"name": "ownershipEnabled", "type": "bool"},
                {"name": "website", "type": "string"}, {"name": "telegram", "type": "string"}, {"name": "twitter", "type": "string"}, {"name": "logoURI", "type": "string"},
                {"name": "maxWalletEnabled", "type": "bool"}, {"name": "maxWalletPercent", "type": "uint8"}, {"name": "maxTxEnabled", "type": "bool"}, {"name": "maxTxPercent", "type": "uint8"},
                {"name": "tradingControlEnabled", "type": "bool"}, {"name": "tradingEnabled", "type": "bool"}, {"name": "buyTaxEnabled", "type": "bool"}, {"name": "buyTax", "type": "uint8"},
                {"name": "sellTaxEnabled", "type": "bool"}, {"name": "sellTax", "type": "uint8"}, {"name": "burnTaxShare", "type": "uint8"},
                {"name": "marketingWallet", "type": "address"}, {"name": "developmentWallet", "type": "address"}
            ],
            "name": "config", "type": "tuple"
        }],
        "name": "createToken", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    {
        "inputs": [{
            "components": [
                {"name": "name", "type": "string"}, {"name": "symbol", "type": "string"}, {"name": "supply", "type": "uint256"},
                {"name": "owner", "type": "address"}, {"name": "chainId", "type": "uint256"}, {"name": "launchKitVersion", "type": "uint16"},
                {"name": "burnable", "type": "bool"}, {"name": "mintable", "type": "bool"}, {"name": "ownershipEnabled", "type": "bool"},
                {"name": "website", "type": "string"}, {"name": "telegram", "type": "string"}, {"name": "twitter", "type": "string"}, {"name": "logoURI", "type": "string"},
                {"name": "maxWalletEnabled", "type": "bool"}, {"name": "maxWalletPercent", "type": "uint8"}, {"name": "maxTxEnabled", "type": "bool"}, {"name": "maxTxPercent", "type": "uint8"},
                {"name": "tradingControlEnabled", "type": "bool"}, {"name": "tradingEnabled", "type": "bool"}, {"name": "buyTaxEnabled", "type": "bool"}, {"name": "buyTax", "type": "uint8"},
                {"name": "sellTaxEnabled", "type": "bool"}, {"name": "sellTax", "type": "uint8"}, {"name": "burnTaxShare", "type": "uint8"},
                {"name": "marketingWallet", "type": "address"}, {"name": "developmentWallet", "type": "address"}
            ],
            "name": "config", "type": "tuple"
        }],
        "name": "getDeploymentFee", "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"
    },
    {"inputs": [{"name": "creator", "type": "address"}], "name": "getTokensByCreator", "outputs": [{"type": "address[]"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "totalTokens", "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
    {
        "inputs": [{"name": "", "type": "address"}], "name": "tokenInfo",
        "outputs": [
            {"name": "token", "type": "address"}, {"name": "creator", "type": "address"}, {"name": "name", "type": "string"}, {"name": "symbol", "type": "string"},
            {"name": "supply", "type": "uint256"}, {"name": "createdAt", "type": "uint256"}, {"name": "chainId", "type": "uint256"}, {"name": "active", "type": "bool"}
        ], "stateMutability": "view", "type": "function"
    }
];

const STRUCT_TUPLE_MAPPING = `tuple(
    string name, string symbol, uint256 supply, address owner, uint256 chainId, uint16 launchKitVersion,
    bool burnable, bool mintable, bool ownershipEnabled, string website, string telegram, string twitter, string logoURI,
    bool maxWalletEnabled, uint8 maxWalletPercent, bool maxTxEnabled, uint8 maxTxPercent,
    bool tradingControlEnabled, bool tradingEnabled, bool buyTaxEnabled, uint8 buyTax,
    bool sellTaxEnabled, uint8 sellTax, uint8 burnTaxShare, address marketingWallet, address developmentWallet
)`;

// STATE GLOBAL APP
let web3Provider = null, web3Signer = null, activeUserAddress = null, compiledStandardJsonCache = null;

// DOM REFERENCES
const DOM = {
    btnConnect: document.getElementById('btnConnect'), userAddress: document.getElementById('userAddress'),
    factoryAddress: document.getElementById('factoryAddress'), txtGlobalTokens: document.getElementById('txtGlobalTokens'),
    txtDeploymentFee: document.getElementById('txtDeploymentFee'), btnCalculateFee: document.getElementById('btnCalculateFee'),
    btnExecuteDeploy: document.getElementById('btnExecuteDeploy'), deployLogs: document.getElementById('deployLogs'),
    txtEncodedOutput: document.getElementById('txtEncodedOutput'), txtStandardJsonPreview: document.getElementById('txtStandardJsonPreview'),
    btnCompileVerification: document.getElementById('btnCompileVerification'), btnDownloadJson: document.getElementById('btnDownloadJson'),
    manageLedgerContainer: document.getElementById('manageLedgerContainer'), btnRefreshLedger: document.getElementById('btnRefreshLedger')
};

// INITIALIZATION EVENT LOOP
window.addEventListener('DOMContentLoaded', () => {
    if (window.ethereum) {
        web3Provider = new ethers.BrowserProvider(window.ethereum);
        window.ethereum.on('accountsChanged', (accounts) => synchronizeAccountSession(accounts));
        window.ethereum.on('chainChanged', () => window.location.reload());
    } else {
        DOM.deployLogs.innerText = "Error: Ekstensi dompet Web3 tidak terdeteksi pada peramban ini.";
    }

    DOM.btnConnect.addEventListener('click', connectWalletInterface);
    DOM.btnCalculateFee.addEventListener('click', processFetchFee);
    DOM.btnExecuteDeploy.addEventListener('click', triggerDeploymentTransaction);
    DOM.btnCompileVerification.addEventListener('click', compileVerificationPackage);
    DOM.btnDownloadJson.addEventListener('click', executeJsonDownloadAction);
    DOM.btnRefreshLedger.addEventListener('click', loadUserCreatedLedger);
});

// LOGIKA KONEKSI DOMPET WEB3 (METAMASK / TRUSTWALLET)
async function connectWalletInterface() {
    if (!web3Provider) return;
    try {
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        await synchronizeAccountSession(accounts);
    } catch (err) {
        updateLogDisplay(`Koneksi dompet dibatalkan: ${err.message}`);
    }
}

async function synchronizeAccountSession(accounts) {
    if (accounts.length === 0) {
        activeUserAddress = null;
        DOM.userAddress.innerText = "0x...";
        DOM.btnConnect.innerText = "Connect Wallet";
        DOM.btnExecuteDeploy.disabled = true;
        return;
    }

    web3Signer = await web3Provider.getSigner();
    activeUserAddress = accounts[0];
    DOM.userAddress.innerText = `${activeUserAddress.substring(0, 6)}...${activeUserAddress.substring(38)}`;
    DOM.btnConnect.innerText = "Wallet Connected";
    DOM.btnExecuteDeploy.disabled = false;

    const network = await web3Provider.getNetwork();
    if (Number(network.chainId) !== EVOZ_CHAIN_ID) {
        updateLogDisplay("Peringatan: Jaringan salah. Meminta perpindahan ke EVOZ Mainnet...");
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ethers.toQuantity(EVOZ_CHAIN_ID) }]
            });
            window.location.reload();
        } catch (err) {
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: ethers.toQuantity(EVOZ_CHAIN_ID),
                        chainName: 'EVOZ Mainnet',
                        nativeCurrency: { name: 'EVOZ', symbol: 'EVOZ', decimals: 18 },
                        rpcUrls: ['https://rpc.evozscan.com'],
                        blockExplorerUrls: ['https://evozscan.com']
                    }]
                });
                window.location.reload();
            }
        }
    } else {
        updateLogDisplay("Koneksi sukses diotorisasi pada jaringan EVOZ Mainnet.");
        loadGlobalStatistics();
    }
}

function switchTab(evt, panelId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
    evt.currentTarget.classList.add('active');
    if (panelId === 'panelManage' && activeUserAddress) loadUserCreatedLedger();
}

function extractTokenConfigObject() {
    if (!ethers.isAddress(DOM.factoryAddress.value.trim())) throw new Error("Alamat factory salah atau kosong.");
    const baseSupply = document.getElementById('param_supply').value.trim();
    const rawMarketingWallet = document.getElementById('param_marketingWallet').value.trim();
    const rawDevelopmentWallet = document.getElementById('param_developmentWallet').value.trim();

    return {
        name: document.getElementById('param_name').value.trim(),
        symbol: document.getElementById('param_symbol').value.trim(),
        supply: ethers.parseUnits(baseSupply || "0", 18),
        owner: activeUserAddress || ethers.ZeroAddress,
        chainId: BigInt(EVOZ_CHAIN_ID),
        launchKitVersion: parseInt(document.getElementById('param_lkVersion').value),
        burnable: document.getElementById('param_burnable').checked,
        mintable: document.getElementById('param_mintable').checked,
        ownershipEnabled: document.getElementById('param_ownershipEnabled').checked,
        website: document.getElementById('param_website').value.trim(),
        telegram: document.getElementById('param_telegram').value.trim(),
        twitter: document.getElementById('param_twitter').value.trim(),
        logoURI: document.getElementById('param_logoURI').value.trim(),
        maxWalletEnabled: document.getElementById('param_maxWalletEnabled').checked,
        maxWalletPercent: parseInt(document.getElementById('param_maxWalletPercent').value),
        maxTxEnabled: document.getElementById('param_maxTxEnabled').checked,
        maxTxPercent: parseInt(document.getElementById('param_maxTxPercent').value),
        tradingControlEnabled: document.getElementById('param_tradingControlEnabled').checked,
        tradingEnabled: document.getElementById('param_tradingEnabled').checked,
        buyTaxEnabled: document.getElementById('param_buyTaxEnabled').checked,
        buyTax: parseInt(document.getElementById('param_buyTax').value),
        sellTaxEnabled: document.getElementById('param_sellTaxEnabled').checked,
        sellTax: parseInt(document.getElementById('param_sellTax').value),
        burnTaxShare: parseInt(document.getElementById('param_burnTaxShare').value),
        marketingWallet: ethers.isAddress(rawMarketingWallet) ? rawMarketingWallet : ethers.ZeroAddress,
        developmentWallet: ethers.isAddress(rawDevelopmentWallet) ? rawDevelopmentWallet : ethers.ZeroAddress
    };
}

function getFactoryContractInstance() {
    const addr = DOM.factoryAddress.value.trim();
    if (!ethers.isAddress(addr)) return null;
    return new ethers.Contract(addr, FACTORY_ABI, web3Signer || web3Provider);
}

async function loadGlobalStatistics() {
    const instance = getFactoryContractInstance();
    if (!instance) return;
    try {
        const total = await instance.totalTokens();
        DOM.txtGlobalTokens.innerText = total.toString();
    } catch (err) { console.error(err); }
}

async function processFetchFee() {
    try {
        const instance = getFactoryContractInstance();
        if (!instance) return alert("Masukkan alamat factory valid.");
        const config = extractTokenConfigObject();
        const feeWei = await instance.getDeploymentFee(config);
        DOM.txtDeploymentFee.innerText = `${ethers.formatUnits(feeWei, 18)} EVOZ`;
        return feeWei;
    } catch (err) { updateLogDisplay(`Gagal ambil tarif: ${err.message}`); return null; }
}

async function triggerDeploymentTransaction() {
    try {
        const instance = getFactoryContractInstance();
        if (!instance || !web3Signer) return;
        DOM.btnExecuteDeploy.disabled = true;
        const requiredFeeWei = await processFetchFee();
        if (requiredFeeWei === null) { DOM.btnExecuteDeploy.disabled = false; return; }

        const config = extractTokenConfigObject();
        updateLogDisplay("Menunggu konfirmasi transaksi pada dompet...");
        const tx = await instance.createToken(config, { value: requiredFeeWei });
        updateLogDisplay(`Transaksi terkirim: ${tx.hash}`);
        await tx.wait();
        updateLogDisplay("Sukses! Kontrak token berhasil dideploy.");
        loadGlobalStatistics();
        DOM.btnExecuteDeploy.disabled = false;
    } catch (err) { updateLogDisplay(`Eksekusi gagal: ${err.message}`); DOM.btnExecuteDeploy.disabled = false; }
}

function compileVerificationPackage() {
    try {
        const config = extractTokenConfigObject();
        const abiCoder = ethers.AbiCoder.defaultAbiCoder();
        const encodedHex = abiCoder.encode([STRUCT_TUPLE_MAPPING], [config]);
        DOM.txtEncodedOutput.innerText = encodedHex.startsWith('0x') ? encodedHex.slice(2) : encodedHex;

        compiledStandardJsonCache = {
            "language": "Solidity",
            "sources": { "contracts/EVOZXUltimateFactory.sol": { "content": "// Kode sumber gabungan..." } },
            "settings": { "optimizer": { "enabled": true, "runs": 200 }, "evmVersion": "paris", "outputSelection": { "*": { "*": ["abi", "metadata", "evm.bytecode", "evm.deployedBytecode"] } } }
        };
        DOM.txtStandardJsonPreview.innerText = JSON.stringify(compiledStandardJsonCache, null, 4);
        DOM.btnDownloadJson.disabled = false;
    } catch (err) { alert(err.message); }
}

function executeJsonDownloadAction() {
    if (!compiledStandardJsonCache) return;
    const dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compiledStandardJsonCache, null, 4));
    const anchorNode = document.createElement('a');
    anchorNode.setAttribute("href", dataUri);
    anchorNode.setAttribute("download", "StandardInput_Verify.json");
    document.body.appendChild(anchorNode);
    anchorNode.click();
    anchorNode.remove();
}

async function loadUserCreatedLedger() {
    const instance = getFactoryContractInstance();
    if (!instance || !activeUserAddress) return;
    DOM.manageLedgerContainer.innerHTML = '<div>Membaca data blockchain...</div>';
    try {
        const items = await instance.getTokensByCreator(activeUserAddress);
        if (items.length === 0) { DOM.manageLedgerContainer.innerHTML = '<div>Belum ada token.</div>'; return; }
        DOM.manageLedgerContainer.innerHTML = '';
        for (let i = 0; i < items.length; i++) {
            const info = await instance.tokenInfo(items[i]);
            const element = document.createElement('div');
            element.className = 'token-item';
            element.innerHTML = `<h4>${info.name} [${info.symbol}]</h4><p class="addr">${info.token}</p>`;
            DOM.manageLedgerContainer.appendChild(element);
        }
    } catch (err) { DOM.manageLedgerContainer.innerHTML = `<div>Gagal: ${err.message}</div>`; }
}

function updateLogDisplay(msg) { DOM.deployLogs.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`; }
                           
