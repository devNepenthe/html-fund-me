import { ethers } from "./ethers-6.7.min.js";
import { contractAddress, abi } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalanceButton = document.getElementById("getBalanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        console.log(accounts);
    } else {
        connectButton.innerHTML = "Please install Metamask.";
    }
}

async function fund(ethAmount) {
    ethAmount = document.getElementById("ethAmountInput").value;
    console.log(`Funding contract with ${ethAmount} ETH.`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const txResponse = await contract.fund({
                value: ethers.parseEther(ethAmount),
            });
            await listenForTxMine(txResponse, provider);
            console.log("Done!");
        } catch (e) {
            console.log(e);
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            console.log(
                `Withdrawing ${ethers.formatEther(
                    await provider.getBalance(contractAddress),
                )} ETH from contract...`,
            );
            const txResponse = await contract.withdraw();
            await listenForTxMine(txResponse, provider);
            console.log("Done!");
        } catch (e) {
            console.log(e);
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.formatEther(balance));
    }
}

function listenForTxMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, async (transactionReceipt) => {
            console.log(
                `Completed with ${await transactionReceipt.confirmations()} confirmations.`,
            );
            resolve();
        });
    });
}
