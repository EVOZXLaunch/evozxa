let web3Provider = null;
let web3Signer = null;
let userWalletAddress = null;
let launchKitVersion = 1; 

// LOCKED SMART CONTRACT ADDRESSES
const FACTORY_CONTRACT_ADDRESS = "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB";
const EXCHANGE_CONTRACT_ADDRESS = "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8";

// RAW REPOSITORY GITHUB DOWNLOAD TARGET FOR VERIFICATION
const GITHUB_RAW_JSON_URL = "https://raw.githubusercontent.com/EVOZXLabs/evozx-launchfuture/main/docs/standard-input.json";

// COMPLETE EXCHANGE ABI
const EXCHANGE_ABI = [
    {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
    {"inputs": [], "name": "buyEVOZX", "outputs": [], "stateMutability": "payable", "type": "function"},
    {"inputs": [], "name": "getAvailableStock", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "rate", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}
];

// COMPLETE FACTORY ABI
const FACTORY_ABI = [
    {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
    {"inputs": [], "name": "LAUNCHKIT_VERSION", "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "evozx", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"components": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "string", "name": "symbol", "type": "string"},{"internalType": "uint256", "name": "supply", "type": "uint256"},{"internalType": "address", "name": "owner", "type": "address"},{"internalType": "uint256", "name": "chainId", "type": "uint256"},{"internalType": "uint16", "name": "launchKitVersion", "type": "uint16"},{"internalType": "bool", "name": "burnable", "type": "bool"},{"internalType": "bool", "name": "mintable", "type": "bool"},{"internalType": "bool", "name": "ownershipEnabled", "type": "bool"},{"internalType": "string", "name": "website", "type": "string"},{"internalType": "string", "name": "telegram", "type": "string"},{"internalType": "string", "name": "twitter", "type": "string"},{"internalType": "string", "name": "logoURI", "type": "string"},{"internalType": "bool", "name": "maxWalletEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxWalletPercent", "type": "uint8"},{"internalType": "bool", "name": "maxTxEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxTxPercent", "type": "uint8"},{"internalType": "bool", "name": "tradingControlEnabled", "type": "bool"},{"internalType": "bool", "name": "tradingEnabled", "type": "bool"},{"internalType": "bool", "name": "buyTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "buyTax", "type": "uint8"},{"internalType": "bool", "name": "sellTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "sellTax", "type": "uint8"},{"internalType": "uint8", "name": "burnTaxShare", "type": "uint8"},{"internalType": "address", "name": "marketingWallet", "type": "address"},{"internalType": "address", "name": "developmentWallet", "type": "address"}], "internalType": "struct LaunchKitTypes.TokenConfig", "name": "config", "type": "tuple"}], "name": "getDeploymentFee", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"components": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "string", "name": "symbol", "type": "string"},{"internalType": "uint256", "name": "supply", "type": "uint256"},{"internalType": "address", "name": "owner", "type": "address"},{"internalType": "uint256", "name": "chainId", "type": "uint256"},{"internalType": "uint16", "name": "launchKitVersion", "type": "uint16"},{"internalType": "bool", "name": "burnable", "type": "bool"},{"internalType": "bool", "name": "mintable", "type": "bool"},{"internalType": "bool", "name": "ownershipEnabled", "type": "bool"},{"internalType": "string", "name": "website", "type": "string"},{"internalType": "string", "name": "telegram", "type": "string"},{"internalType": "string", "name": "twitter", "type": "string"},{"internalType": "string", "name": "logoURI", "type": "string"},{"internalType": "bool", "name": "maxWalletEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxWalletPercent", "type": "uint8"},{"internalType": "bool", "name": "maxTxEnabled", "type": "bool"},{"internalType": "uint8", "name": "maxTxPercent", "type": "uint8"},{"internalType": "bool", "name": "tradingControlEnabled", "type": "bool"},{"internalType": "bool", "name": "tradingEnabled", "type": "bool"},{"internalType": "bool", "name": "buyTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "buyTax", "type": "uint8"},{"internalType": "bool", "name": "sellTaxEnabled", "type": "bool"},{"internalType": "uint8", "name": "sellTax", "type": "uint8"},{"internalType": "uint8", "name": "burnTaxShare", "type": "uint8"},{"internalType": "address", "name": "marketingWallet", "type": "address"},{"internalType": "address", "name": "developmentWallet", "type": "address"}], "internalType": "struct LaunchKitTypes.TokenConfig", "name": "config", "type": "tuple"}], "name": "createToken", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
];

// DOM SELECTION
const DOM = {
    btnConnect: document.getElementById('btnConnect'),
    walletAddress: document.getElementById('walletAddress'),
    btnExecuteDeploy: document.getElementById('btnExecuteDeploy'),
    txtLiveFee: document.getElementById('txtLiveFee'),
    logDisplay: document.getElementById('logDisplay'),
    cardSuccessOutput: document.getElementById('cardSuccessOutput'),
    displayNewTokenAddress: document.getElementById('displayNewTokenAddress'),
    btnDownloadJson: document.getElementById('btnDownloadJson'),
    
    // Gas Station DOMs
    btnExecuteSwap: document.getElementById('btnExecuteSwap'),
    swapInputEvoz: document.getElementById('swapInputEvoz'),
    swapLogs: document.getElementById('swapLogs'),
    
    // Inputs Form
    tokenName: document.getElementById('tokenName'),
    tokenSymbol: document.getElementById('tokenSymbol'),
    tokenSupply: document.getElementById('tokenSupply'),
    tokenOwner: document.getElementById('tokenOwner'),
    metaWebsite: document.getElementById('metaWebsite'),
    metaTelegram: document.getElementById('metaTelegram'),
    metaTwitter: document.getElementById('metaTwitter'),
    metaLogo: document.getElementById('metaLogo'),
    featMintable: document.getElementById('featMintable'),
    featBurnable: document.getElementById('featBurnable'),
    featOwnership: document.getElementById('featOwnership'),
    
    featMaxWallet: document.getElementById('featMaxWallet'),
    boxMaxWallet: document.getElementById('boxMaxWallet'),
    valMaxWallet: document.getElementById('valMaxWallet'),
    
    featMaxTx: document.getElementById('featMaxTx'),
    boxMaxTx: document.getElementById('boxMaxTx'),
    valMaxTx: document.getElementById('valMaxTx'),
    
    featTradingControl: document.getElementById('featTradingControl'),
    boxTradingControl: document.getElementById('boxTradingControl'),
    featTradingEnabled: document.getElementById('featTradingEnabled'),
    
    featBuyTax: document.getElementById('featBuyTax'),
    boxBuyTax: document.getElementById('boxBuyTax'),
    valBuyTax: document.getElementById('valBuyTax'),
    
    featSellTax: document.getElementById('featSellTax'),
    boxSellTax: document.getElementById('boxSellTax'),
    valSellTax: document.getElementById('valSellTax'),
    
    valBurnTaxShare: document.getElementById('valBurnTaxShare'),
    taxMarketingWallet: document.getElementById('taxMarketingWallet'),
    taxDevWallet: document.getElementById('taxDevWallet')
};

window.addEventListener('DOMContentLoaded', () => {
    DOM.btnConnect.addEventListener('click', connectUserWallet);
    DOM.btnExecuteDeploy.addEventListener('click', launchTokenOnBlockchain);
    DOM.btnExecuteSwap.addEventListener('click', executeEvozToEvozxSwap);
    DOM.btnDownloadJson.addEventListener('click', runVerificationDownloader);

    setupInteractiveFormListeners();
});

function writeLog(text) {
    DOM.logDisplay.innerText = `[${new Date().toLocaleTimeString()}] ${text}\n` + DOM.logDisplay.innerText;
}

function setupInteractiveFormListeners() {
    const togglePairs = [
        { cb: DOM.featMaxWallet, box: DOM.boxMaxWallet },
        { cb: DOM.featMaxTx, box: DOM.boxMaxTx },
        { cb: DOM.featTradingControl, box: DOM.boxTradingControl },
        { cb: DOM.featBuyTax, box: DOM.boxBuyTax },
        { cb: DOM.featSellTax, box: DOM.boxSellTax }
    ];

    togglePairs.forEach(pair => {
        pair.cb.addEventListener('change', () => {
            pair.box.style.display = pair.cb.checked ? 'block' : 'none';
            fetchLiveFeeFromContract();
        });
    });

    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', fetchLiveFeeFromContract);
    });
}

function generateTokenConfigStruct() {
    const currentOwner = DOM.tokenOwner.value.trim() || userWalletAddress || ethers.ZeroAddress;
    const marketing = DOM.taxMarketingWallet.value.trim() || userWalletAddress || ethers.ZeroAddress;
    const development = DOM.taxDevWallet.value.trim() || userWalletAddress || ethers.ZeroAddress;
    
    let parsedSupply = "0";
    try {
        if(DOM.tokenSupply.value) parsedSupply = ethers.parseEther(DOM.tokenSupply.value).toString();
    } catch(e){}

    return {
        name: DOM.tokenName.value.trim() || "Unnamed",
        symbol: DOM.tokenSymbol.value.trim().toUpperCase() || "TOKEN",
        supply: parsedSupply,
        owner: currentOwner,
        chainId: 0, 
        launchKitVersion: launchKitVersion,
        burnable: DOM.featBurnable.checked,
        mintable: DOM.featMintable.checked,
        ownershipEnabled: DOM.featOwnership.checked,
        website: DOM.metaWebsite.value.trim(),
        telegram: DOM.metaTelegram.value.trim(),
        twitter: DOM.metaTwitter.value.trim(),
        logoURI: DOM.metaLogo.value.trim(),
        maxWalletEnabled: DOM.featMaxWallet.checked,
        maxWalletPercent: parseInt(DOM.valMaxWallet.value) || 0,
        maxTxEnabled: DOM.featMaxTx.checked,
        maxTxPercent: parseInt(DOM.valMaxTx.value) || 0,
        tradingControlEnabled: DOM.featTradingControl.checked,
        tradingEnabled: DOM.featTradingControl.checked ? DOM.featTradingEnabled.checked : false,
        buyTaxEnabled: DOM.featBuyTax.checked,
        buyTax: parseInt(DOM.valBuyTax.value) || 0,
        sellTaxEnabled: DOM.featSellTax.checked,
        sellTax: parseInt(DOM.valSellTax.value) || 0,
        burnTaxShare: parseInt(DOM.valBurnTaxShare.value) || 0,
        marketingWallet: marketing,
        developmentWallet: development
    };
}

async function fetchLiveFeeFromContract() {
    if (!web3Signer) return;
    try {
        const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, web3Signer);
        const config = generateTokenConfigStruct();
        
        const network = await web3Provider.getNetwork();
        config.chainId = network.chainId;

        const estimatedWei = await factoryContract.getDeploymentFee(config);
        DOM.txtLiveFee.innerText = parseFloat(ethers.formatEther(estimatedWei)).toFixed(2);
    } catch (err) {
        DOM.txtLiveFee.innerText = "---";
        console.error("Fee estimation failed", err);
    }
}

async function connectUserWallet() {
    if (!window.ethereum) return alert("Crypto Wallet Extension/Browser not detected!");
    try {
        web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3Signer = await web3Provider.getSigner();
        userWalletAddress = accounts[0];
        
        DOM.walletAddress.innerText = `Connected: ${userWalletAddress.substring(0,6)}...${userWalletAddress.substring(38)}`;
        DOM.btnConnect.innerText = "Wallet Connected ✅";
        DOM.btnExecuteDeploy.removeAttribute('disabled');
        DOM.btnExecuteDeploy.innerText = "LAUNCH NEW TOKEN";
        
        writeLog("Wallet connected successfully.");
        
        const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, web3Provider);
        launchKitVersion = await factoryContract.LAUNCHKIT_VERSION();
        
        // Fetch Exchange rates and current stock parameters
        const exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_ABI, web3Provider);
        const rate = await exchangeContract.rate();
        const stockWei = await exchangeContract.getAvailableStock();
        DOM.swapLogs.innerText = `Rate: 1 EVOZX = ${rate} EVOZ | Stock: ${parseFloat(ethers.formatEther(stockWei)).toFixed(2)} EVOZX`;

        fetchLiveFeeFromContract();
    } catch (err) {
        writeLog(`Connection Failed: ${err.message}`);
    }
}

async function executeEvozToEvozxSwap() {
    if (!web3Signer) return alert("Please connect your wallet first.");
    const valEvoz = DOM.swapInputEvoz.value.trim();
    if (!valEvoz || parseFloat(valEvoz) <= 0) return alert("Enter a valid amount of EVOZ.");
    try {
        DOM.btnExecuteSwap.disabled = true;
        DOM.swapLogs.innerText = "[Processing] Waiting for swap confirmation...";
        
        const exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_ABI, web3Signer);
        const tx = await exchangeContract.buyEVOZX({ value: ethers.parseEther(valEvoz) });
        await tx.wait();
        
        DOM.swapLogs.innerText = "[Success] Swap completed successfully!";
        DOM.btnExecuteSwap.disabled = false;
        fetchLiveFeeFromContract();
    } catch (err) {
        DOM.swapLogs.innerText = `[Error] ${err.message}`;
        DOM.btnExecuteSwap.disabled = false;
    }
}

async function launchTokenOnBlockchain() {
    if (!web3Signer) return;
    try {
        DOM.btnExecuteDeploy.disabled = true;
        DOM.cardSuccessOutput.style.display = "none";
        writeLog("Processing token configurations and settings parameters...");

        const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, web3Signer);
        const config = generateTokenConfigStruct();
        
        const network = await web3Provider.getNetwork();
        config.chainId = network.chainId;

        const evozxTokenAddress = await factoryContract.evozx();
        const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const tokenPaymentContract = new ethers.Contract(evozxTokenAddress, erc20Abi, web3Signer);

        writeLog("Requesting precise configuration quotes directly from the factory contract...");
        const finalRequiredFeeWei = await factoryContract.getDeploymentFee(config);

        writeLog("Sending Approve transaction for token currency allocation...");
        const approveTx = await tokenPaymentContract.approve(FACTORY_CONTRACT_ADDRESS, finalRequiredFeeWei);
        await approveTx.wait();

        writeLog("Broadcasting deployment payload to the blockchain network...");
        const deployTx = await factoryContract.createToken(config);
        
        writeLog("Waiting for block mining confirmation receipt...");
        const receipt = await deployTx.wait();

        let deployedTokenAddress = null;
        const TRANSFER_EVENT_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        
        for (const log of receipt.logs) {
            if (log.topics && log.topics[0] === TRANSFER_EVENT_TOPIC) {
                deployedTokenAddress = log.address;
                break;
            }
        }

        if (deployedTokenAddress) {
            writeLog(`🚀 DEPLOYMENT SUCCESS: Token is live at address: ${deployedTokenAddress}`);
            DOM.displayNewTokenAddress.innerText = deployedTokenAddress;
            DOM.cardSuccessOutput.style.display = "block";
        } else {
            writeLog("Token created successfully, but dApp could not parse the contract address automatically. Please check your transaction hash on Explorer.");
        }
        DOM.btnExecuteDeploy.disabled = false;
    } catch (err) {
        writeLog(`Execution Failed: ${err.message}`);
        DOM.btnExecuteDeploy.disabled = false;
    }
}

async function runVerificationDownloader() {
    writeLog("Fetching standard-input.json schema live from GitHub...");
    try {
        // FETCH REAL CONTRACT COMPILATION FROM REPOSITORY DIRECTLY
        const response = await fetch(GITHUB_RAW_JSON_URL);
        if(!response.ok) throw new Error("Network response error from repo");
        
        const dataJson = await response.json();
        
        const blob = new Blob([JSON.stringify(dataJson, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "factory-standard-input.json";
        document.body.appendChild(anchor);
        anchor.click();
        
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        writeLog("Standard-input.json config file downloaded successfully.");
    } catch (err) {
        writeLog(`Download Failed: Unable to fetch source config from repository. (${err.message})`);
    }
    }
            
