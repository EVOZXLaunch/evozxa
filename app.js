// --- CONFIG & ABIS ---
const FACTORY_ADDR = "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB";
const EXCHANGE_ADDR = "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8";

const FACTORY_ABI = [
    {"inputs":[{"components":[{"name":"name","type":"string"},{"name":"symbol","type":"string"},{"name":"supply","type":"uint256"}],"name":"config","type":"tuple"}],"name":"getDeploymentFee","outputs":[{"type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"components":[{"name":"name","type":"string"},{"name":"symbol","type":"string"},{"name":"supply","type":"uint256"}],"name":"config","type":"tuple"}],"name":"createToken","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

const EXCHANGE_ABI = [
    {"inputs":[],"name":"buyEVOZX","outputs":[],"stateMutability":"payable","type":"function"},
    {"inputs":[],"name":"getAvailableStock","outputs":[{"type":"uint256"}],"stateMutability":"view","type":"function"}
];

let signer = null;
const DOM = {
    btnConnect: document.getElementById('btnConnect'),
    btnExecuteDeploy: document.getElementById('btnExecuteDeploy'),
    btnExecuteSwap: document.getElementById('btnExecuteSwap'),
    txtLiveFee: document.getElementById('txtLiveFee'),
    tokenName: document.getElementById('tokenName'),
    tokenSymbol: document.getElementById('tokenSymbol'),
    tokenSupply: document.getElementById('tokenSupply')
};

// --- LOGIKA EXCHANGE (SWAP) ---
async function executeSwap() {
    if (!signer) return alert("Connect wallet dulu bray!");
    try {
        const exchange = new ethers.Contract(EXCHANGE_ADDR, EXCHANGE_ABI, signer);
        // Swap 0.1 ETH/EVOZ ke EVOZX
        const tx = await exchange.buyEVOZX({ value: ethers.parseEther("0.1") }); 
        await tx.wait();
        alert("Swap Berhasil!");
    } catch (e) {
        console.error(e);
        alert("Error Exchange: " + (e.reason || e.message));
    }
}

// --- LOGIKA FACTORY (DEPLOY) ---
async function updateCalculator() {
    if (!signer) return;
    try {
        const factory = new ethers.Contract(FACTORY_ADDR, FACTORY_ABI, signer);
        const config = {
            name: DOM.tokenName.value || "TKN",
            symbol: DOM.tokenSymbol.value || "TKN",
            supply: ethers.parseEther(DOM.tokenSupply.value || "0")
        };
        const fee = await factory.getDeploymentFee(config);
        DOM.txtLiveFee.innerText = ethers.formatEther(fee);
    } catch (e) { console.log("Menunggu data..."); }
}

async function launchToken() {
    if (!signer) return;
    try {
        const factory = new ethers.Contract(FACTORY_ADDR, FACTORY_ABI, signer);
        const config = {
            name: DOM.tokenName.value,
            symbol: DOM.tokenSymbol.value,
            supply: ethers.parseEther(DOM.tokenSupply.value)
        };
        const tx = await factory.createToken(config);
        await tx.wait();
        alert("Token Berhasil Dibuat!");
    } catch (e) {
        alert("Error Factory: " + e.message);
    }
}

// --- SLIDER NAVIGATION ---
let currentSlide = 0;
function changeSlide(dir) {
    const track = document.getElementById('sliderTrack');
    currentSlide = Math.max(0, Math.min(2, currentSlide + dir));
    track.style.transform = `translateX(-${currentSlide * 33.33}%)`;
}

// --- INITIALIZER ---
DOM.btnConnect.addEventListener('click', async () => {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        DOM.btnConnect.innerText = "Wallet Connected ✅";
        DOM.btnExecuteDeploy.disabled = false;
        updateCalculator();
    } catch (e) { alert("Koneksi Gagal: " + e.message); }
});

DOM.btnExecuteSwap.addEventListener('click', executeSwap);
DOM.btnExecuteDeploy.addEventListener('click', launchToken);
document.querySelectorAll('input').forEach(i => i.addEventListener('input', updateCalculator));

// --- ANIMASI PARTIKEL CYBERPUNK (Auto-Run) ---
function initBackground() {
    const canvas = document.getElementById('cyberParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2
    }));

    function animate() {
        ctx.fillStyle = "rgba(5, 5, 5, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#d4af37";
        
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// Jalankan otomatis saat web load
window.addEventListener('load', initBackground);
