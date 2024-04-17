const walletGroupsContainer = document.getElementById('wallet-group');
const sumarryBar = document.getElementById('sumarry-bar');
const summaryText = document.getElementById('sumarry-text');
const summaryTextC = document.getElementById('sumarry-text-c');
sumarryBar.style.width = `${0}%`;

const extraSmallGiversMaxVolume = 350000000

const totalDiff = BigInt('115792089237277217110272752943501742914102634520085823245724998868298727686144')
const hashrate3080 = BigInt('2000000000');

const givers = {
    "extra_small_givers": [
        { "mainAddress": "EQCfwe95AJDfKuAoP1fBtu-un1yE7Mov-9BXaFM3lrJZwqg_", "jettonAddress": "EQDz5ABKpaMO8BunzgNpcG8TAHvleDXGjSqIi6nOf5cLsFKg" },
        { "mainAddress": "EQBoATvbIa9vA7y8EUQE4tlsrrt0EhSUK4mndp49V0z7Me3M", "jettonAddress": "EQB0wM5SSGxOMQW1kiA_CSnZi8xONhr2EaH0-DH3ErshW_kT" },
        { "mainAddress": "EQAV3tsPXau3VJanBw4KCFaMk3l_n3sX8NHZNgICFrR-9EGE", "jettonAddress": "EQDifNns50Ial2wezfhHT69ycmucPjQvbVa8qLsbFoVqN9_-" },
        { "mainAddress": "EQAR9DvLZMHo9FAVMHI1vHvL7Fi7jWgjKtUARZ2S_nopQRYz", "jettonAddress": "EQDMI8s3OcoaM5A9OhIOj8lh1jqGVoJc4rouNi1XPIu5YcXh" },
        { "mainAddress": "EQC10L__G2SeEeM2Lw9osGyYxhoIPqJwE-8Pe7728JcmnJzW", "jettonAddress": "EQCGGM9fF9hmvAt7OLWZKbX0tf3A5ZrCF7EW5mmdUk3wkqGm" },
        { "mainAddress": "EQDZJFkh12kw-zLGqKSGVDf1V2PRzedGZDFDcFml5_0QerST", "jettonAddress": "EQCh7TvrKTFF1shor0ni2SsDF2poyGltxgWaJYOY6J3kqi1G" },
        { "mainAddress": "EQCiLN0gEiZqthGy-dKl4pi4kqWJWjRzR3Jv4jmPOtQHveDN", "jettonAddress": "EQB3zmSjxPn2c-EcbDAzYiPZtbPi8DkxdcnjHYKRG3xealN0" },
        { "mainAddress": "EQDB8Mo9EviBkg_BxfNv6C2LO_foJRXcgEF41pmQvMvnB9Jn", "jettonAddress": "EQBFUICbJRNPrV1Q6RN12oq7TNc87hkyV_8stbQOn5Q0ddd2" },
        { "mainAddress": "EQAidDzp6v4oe-vKFWvsV8MQzY-4VaeUFnGM3ImrKIJUIid9", "jettonAddress": "EQA-9Z_fJ3PstFkCoZIMij9xM3SVEJfqYtv-x8tKfUlb0Bh5" },
        { "mainAddress": "EQAFaPmLLhXveHcw3AYIGDlHbGAbfQWlH45WGf4K4D6DNZxY", "jettonAddress": "EQDKx_EepIPaTIBiaCLbyQn23cyxHQ2UhZxZWf34AKi-MrPN" },
    ]
};

// Function to fetch wallet balance
async function getWalletBalance(address) {
    const response = await fetch('https://mainnet.tonhubapi.com/runGetMethod', {
        method: 'POST',
        body: JSON.stringify({
            address,
            method: 'get_wallet_data',
            stack: []
        })
    });
    const data = await response.json();
    const balanceHex = data.result.stack[0][1];
    return parseInt(balanceHex, 16); // Convert hex to decimal
}

async function getGiverComplexity(address) {
    const response = await fetch('https://mainnet.tonhubapi.com/runGetMethod', {
        method: 'POST',
        body: JSON.stringify({
            address,
            method: 'get_pow_params',
            stack: []
        })
    });
    const data = await response.json();
    const balanceHex = data.result.stack[1][1];
    const hashes = totalDiff / BigInt(parseInt(balanceHex, 16));
    return hashes
}

function formatN(n) {
    const unitList = ['y', 'z', 'a', 'f', 'p', 'n', 'u', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    const zeroIndex = 8;
    const nn = n.toExponential(2).split(/e/);
    let u = Math.floor(+nn[1] / 3) + zeroIndex;
    if (u > unitList.length - 1) {
        u = unitList.length - 1;
    } else
        if (u < 0) {
            u = 0;
        }
    return nn[0] * Math.pow(10, +nn[1] - (u - zeroIndex) * 3) + unitList[u];
}

async function createProgressBar(giver, name) {
    const groupElement = document.createElement('div');
    groupElement.classList.add('wallet-group');
    const link = document.createElement('a');
    link.href = 'https://tonviewer.com/' + giver.mainAddress;
    link.classList.add('address')
    link.target = '_blank';

    var text = document.createElement('p');
    text.innerHTML = `${name}: ... <br>Mining progress: ...`;
    text.id = `text-${giver.mainAddress}%`;
    link.appendChild(text)
    groupElement.appendChild(link)

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');

    const progressBarFill = document.createElement('div');
    progressBarFill.id = `progres-bar-${giver.mainAddress}%`;
    progressBarFill.classList.add('progress-bar-fill');
    progressBarFill.style.width = `${0}%`;
    progressBar.appendChild(progressBarFill);

    groupElement.appendChild(progressBar);

    walletGroupsContainer.appendChild(groupElement);
}

async function fillProgressBar(giver, balance, percentage, name, maxVolume, hashes) {
    const text = document.getElementById(`text-${giver.mainAddress}%`);
    const progressBarFill = document.getElementById(`progres-bar-${giver.mainAddress}%`);
    const baseLabel = `${name}: ${balance.toLocaleString('en-US')}/${maxVolume.toLocaleString('en-US')} GRAM<br>Mining progress: `
    if (hashes != 0) {
        let secondsOn3080 = hashes / hashrate3080
        text.innerHTML = baseLabel + `${(100 - percentage).toFixed(2)}% Hashes: ${formatN(Number(hashes))} Seconds on 3080: ${secondsOn3080}`;
    } else {
        text.innerHTML = baseLabel + "Done.";
    }
    progressBarFill.style.width = `${percentage}%`;
}

async function createSeparator() {
    const div = document.createElement('div')
    const h3 = document.createElement('h3')
    h3.innerText = " "
    div.appendChild(h3)
    walletGroupsContainer.appendChild(div)
}


// Function to create and display wallet groups
async function spawnProgressBars() {
    createSeparator()
    for (let i = 0; i < givers.extra_small_givers.length; i++) { createProgressBar(givers.extra_small_givers[i], "Extra Small Giver #" + (i + 1).toString()) }
}

async function fillProgressBars() {
    var total = 0;
    var totalRemain = 0;

    // Fill extra small givers bars
    for (let i = 0; i < givers.extra_small_givers.length; i++) {
        const giver = givers.extra_small_givers[i]

        await new Promise(r => setTimeout(r, 300));
        try { var balance = await getWalletBalance(giver.jettonAddress) / 1000000000; } catch (err) { i--; continue }

        const percentage = ((balance) / extraSmallGiversMaxVolume) * 100;

        await new Promise(r => setTimeout(r, 300));
        try { var hashes = await getGiverComplexity(giver.mainAddress); } catch (err) { i--; continue }

        fillProgressBar(giver, balance, percentage, "Extra Small Giver #" + (i + 1).toString(), extraSmallGiversMaxVolume, hashes)

        total += extraSmallGiversMaxVolume;
        totalRemain += balance;
    }
}

async function switchTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme')
    } else {
        document.body.classList.add('dark-theme')
    }
}

const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
if (darkThemeMq.matches) {
    document.body.classList.add('dark-theme')
}

spawnProgressBars();
// Initial data fetching and display
fillProgressBars();
