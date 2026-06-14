let web3Provider = null;
let web3Signer = null;
let userWalletAddress = null;
let launchKitVersion = 1; 

const FACTORY_CONTRACT_ADDRESS = "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB";
const EXCHANGE_CONTRACT_ADDRESS = "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8";
const GITHUB_RAW_JSON_URL = "https://raw.githubusercontent.com/EVOZXLabs/evozx-launchfuture/main/docs/standard-input.json";

const EXCHANGE_ABI = [
    {"inputs": [], "name": "buyEVOZX", "outputs": [], "stateMutability": "payable", "type": "function"},
    {"inputs": [], "name": "getAvailableStock", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "rate", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}
];

const FACTORY_ABI = [
    {"inputs": [], "name": "LAUNCHKIT_VERSION", "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "evozx", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"components": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "string", "name": "symbol", "type": "string"},{"internalType": "uint256", "name": "supply", "type": "uint256"},{"internalType": "address", "name": "owner", "type": "address"},{"internalType": "uint256", "name": "chainId", "type": "uint256"},{"internalType": "uint16", "name": "launchKitVersion", "type": "uint16"},{"internalType": "bool", "name": "burnable", "type": "bool"},{"internalType": "bool", "name": "mintable", "type": "bool"},{"internalType": "bool", "name": "ownershipEnabled", "type": "bool"},{"internalType": "string", "name": "website", "type": "string"},{"internalType": "string", "name": "telegram", "type": "string"},{"internalType": "string", "name": "twitter", "type": "string"},{"internalType": "string", "name": "logoURI", "type": "string"},{"internalType": "bool", "name": "maxWalletEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxWalletPercent", "type": "uint8"},{"internalType": "bool", "name": "maxTxEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxTxPercent", "type": "uint8"},{"internalType": "bool", "name": "tradingControlEnabled", "type": "bool"},{"internalType": "bool", "name": "tradingEnabled", "type": "bool"},{"internalType": "bool", "name": "buyTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "buyTax", "type": "uint8"},{"internalType": "bool", "name": "sellTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "sellTax", "type": "uint8"},{"internalType": "uint8", "name": "burnTaxShare", "type": "uint8"},{"internalType": "address", "name": "marketingWallet", "type": "address"},{"internalType": "address", "name": "developmentWallet", "type": "address"}], "internalType": "struct LaunchKitTypes.TokenConfig", "name": "config", "type": "tuple"}], "name": "getDeploymentFee", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"components": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "string", "name": "symbol", "type": "string"},{"internalType": "uint256", "name": "supply", "type": "uint256"},{"internalType": "address", "name": "owner", "type": "address"},{"internalType": "uint256", "name": "chainId", "type": "uint256"},{"internalType": "uint16", "name": "launchKitVersion", "type": "uint16"},{"internalType": "bool", "name": "burnable", "type": "bool"},{"internalType": "bool", "name": "mintable", "type": "bool"},{"internalType": "bool", "name": "ownershipEnabled", "type": "bool"},{"internalType": "string", "name": "website", "type": "string"},{"internalType": "string", "name": "telegram", "type": "string"},{"internalType": "string", "name": "twitter", "type": "string"},{"internalType": "string", "name": "logoURI", "type": "string"},{"internalType": "bool", "name": "maxWalletEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxWalletPercent", "type": "uint8"},{"internalType": "bool", "name": "maxTxEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxTxPercent", "type": "uint8"},{"internalType": "bool", "name": "tradingControlEnabled", "type": "bool"},{"internalType": "bool", "name": "tradingEnabled", "type": "bool"},{"internalType": "bool", "name": "buyTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "buyTax", "type": "uint8"},{"internalType": "bool", "name": "sellTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "sellTax", "type": "uint8"},{"internalType": "uint8", "name": "burnTaxShare", "type": "uint8"},{"internalType": "address", "name": "marketingWallet", "type": "address"},{"internalType": "address", "name": "developmentWallet", "type": "address"}], "internalType": "struct LaunchKitTypes.TokenConfig", "name": "config", "type": "tuple"}], "name": "createToken", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
];

const DOM = {
    btnConnect: document.getElementById('btnConnect'), walletAddress: document.getElementById('walletAddress'),
    btnExecuteDeploy: document.getElementById('btnExecuteDeploy'), txtLiveFee: document.getElementById('txtLiveFee'),
    logDisplay: document.getElementById('logDisplay'), cardSuccessOutput: document.getElementById('cardSuccessOutput'),
    displayNewTokenAddress: document.getElementById('displayNewTokenAddress'), btnDownloadJson: document.getElementById('btnDownloadJson'),
    costBreakdownContainer: document.getElementById('costBreakdownContainer'), btnExecuteSwap: document.getElementById('btnExecuteSwap'),
    swapInputEvoz: document.getElementById('swapInputEvoz'), swapLogs: document.getElementById('swapLogs'),
    tokenName: document.getElementById('tokenName'), tokenSymbol: document.getElementById('tokenSymbol'), tokenSupply: document.getElementById('tokenSupply'),
    tokenOwner: document.getElementById('tokenOwner'), featMintable: document.getElementById('featMintable'), featBurnable: document.getElementById('featBurnable'),
    featOwnership: document.getElementById('featOwnership'), featMaxWallet: document.getElementById('featMaxWallet'), boxMaxWallet: document.getElementById('boxMaxWallet'),
    valMaxWallet: document.getElementById('valMaxWallet'), featMaxTx: document.getElementById('featMaxTx'), boxMaxTx: document.getElementById('boxMaxTx'),
    valMaxTx: document.getElementById('valMaxTx'), featTradingControl: document.getElementById('featTradingControl'), boxTradingControl: document.getElementById('boxTradingControl'),
    featTradingEnabled: document.getElementById('featTradingEnabled'), featBuyTax: document.getElementById('featBuyTax'), boxBuyTax: document.getElementById('boxBuyTax'),
    valBuyTax: document.getElementById('valBuyTax'), featSellTax: document.getElementById('featSellTax'), boxSellTax: document.getElementById('boxSellTax'),
    valSellTax: document.getElementById('valSellTax'), valBurnTaxShare: document.getElementById('valBurnTaxShare'), taxMarketingWallet: document.getElementById('taxMarketingWallet'),
    taxDevWallet: document.getElementById('taxDevWallet'), taxWarningBlock: document.getElementById('taxWarningBlock'), taxFormFieldsContainer: document.getElementById('taxFormFieldsContainer')
};

window.addEventListener('DOMContentLoaded', () => {
    initParticleAnimationBackground(); setupAccordionEngine(); setupConflictRulesAndFormListeners();
    DOM.btnConnect.addEventListener('click', connectUserWallet); DOM.btnExecuteDeploy.addEventListener('click', launchTokenOnBlockchain);
    DOM.btnExecuteSwap.addEventListener('click', executeEvozToEvozxSwap); DOM.btnDownloadJson.addEventListener('click', runVerificationDownloader);
    calculateAndRenderCosts();
});

function setupAccordionEngine() {
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.querySelector('.accordion-header').addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

function setupConflictRulesAndFormListeners() {
    DOM.featMintable.addEventListener('change', () => {
        if(DOM.featMintable.checked) {
            DOM.featBuyTax.checked = false; DOM.featSellTax.checked = false;
            DOM.boxBuyTax.style.display = 'none'; DOM.boxSellTax.style.display = 'none';
            DOM.taxFormFieldsContainer.style.opacity = "0.3"; DOM.taxWarningBlock.style.display = "block";
        } else {
            DOM.taxFormFieldsContainer.style.opacity = "1"; DOM.taxWarningBlock.style.display = "none";
        }
        calculateAndRenderCosts();
    });
    document.querySelectorAll('input').forEach(i => i.addEventListener('input', calculateAndRenderCosts));
}

function calculateAndRenderCosts() {
    let total = 10;
    DOM.costBreakdownContainer.innerHTML = "<div>Base Fee: 10 EVOZX</div>";
    DOM.txtLiveFee.innerText = total;
}

async function connectUserWallet() {
    if (!window.ethereum) return alert("Install Metamask!");
    web3Provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3Signer = await web3Provider.getSigner(); userWalletAddress = accounts[0];
    DOM.btnConnect.innerText = "Wallet Connected ✅"; DOM.btnExecuteDeploy.removeAttribute('disabled');
}

async function launchTokenOnBlockchain() {
    const factory = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, web3Signer);
    // Tambahkan logika createToken lengkap di sini sesuai struktur yang sudah dibuat tadi
    alert("Deploying...");
}

function initParticleAnimationBackground() {
    const canvas = document.getElementById('cyberParticles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    // Engine animasi partikel...
}
