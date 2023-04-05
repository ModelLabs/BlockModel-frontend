// import { ethers, utils, BigNumber} from 'ethers';
// import FlowInsightERC721NFT from "./FlowInsightERC721NFT.json";
// import FlowInsightVault from "./FlowInsightVault.json";
// import FlowInsightMarketplace from "./FlowInsightMarketplace.json";

// const contract_address = "0x30281c4D14b07231cB11cc6B9B058F71Fc3b5aA2";
// const marketplace_address = "0xc10Ed61abA73f53affBbC2a2f08f1F2d0d341d6d";
// const vault_address = "0xeB2c23593e31e205Bbe516a65113fB016fF1baC7";

// let contract = null;
// // let vault = null;
// let marketplace = null;
// //获取 metamask provider
// function getWeb3Provider() {

//     if (!window.web3Provider) {
//         if (!window.ethereum) {
//             return null;
//         }
//         window.web3Provider = new ethers.providers.Web3Provider(window.ethereum, "any");
//     }
//     return window.web3Provider;


// }
// //连接metamask
// async function connectMetamask(provider) {
//     if (provider === null) {
//         return false;
//     }
//     try {
//         // 获取当前连接的账户地址:
//         let account = await window.ethereum.request({
//             method: 'eth_requestAccounts',
//         });
//         // 获取当前连接的链ID:
//         let chainId = await window.ethereum.request({
//             method: 'eth_chainId'
//         });
//         contract = new ethers.Contract(contract_address, FlowInsightERC721NFT.abi, window.web3Provider.getSigner());
//         vault = new ethers.Contract(vault_address, FlowInsightVault.abi, window.web3Provider.getSigner());
//         marketplace = new ethers.Contract(marketplace_address, FlowInsightMarketplace.abi, window.web3Provider.getSigner());
//         return { account: account, chainId: chainId, status: true };
//     } catch (e) {
//         console.error('could not get a wallet connection.', e);
//         return false;
//     }
// }
// //监听账户切换
// function accountChangeListener(fn) {
//     window.ethereum.on('accountsChanged', fn)
// }
// //获取对应id nft元数据
// async function getNftMetadata(id) {
//     let tx = await contract.getNFTMetadata(id);
//     if (tx != "") {
//         return { status: "successed", response: tx };
//     } else {
//         return { status: "failed", response: null };
//     }

// }
// //获取账户余额
// async function getBalance(address) {
//     const balance = await window.web3Provider.getBalance(address)
//     return ethers.utils.formatEther(balance);
// }

// //创建nft
// async function createNFT(to, name, picURL, desc, property, key, privURL) {
//     try {
//         let tx = await contract.createNFT(to, name, picURL, desc, property, key, privURL);
//         tx = await tx.wait();

//         // TODO (Xufei) 下面方法适合 Ethereum 
//         // let eventFilter = contract.filters.NFTCreated();
//         // let events = await contract.queryFilter(eventFilter, tx.blockNumber, "latest");

//         // TODO (Xufei) 下面方法适合 Polygon，猜测是由于 metamask 支持的问题
//         let events = tx.events;
//         console.log("events", events);
//         return { status: "success", response: {id: events[1].args[0].toString(), owner: events[1].args[1]}};
//     } catch (e) {
//         console.error(e);
//         return { status: "failed", response: null }
//     }
// }
// //添加
// async function addMinter(user) {
//     try {
//         let tx = await contract.addMinter(user);
//         return { status: "successed", response: tx }
//     } catch (e) {
//         return { status: "failed", response: null }
//     }
// }
// //移除
// async function removeMinter(user) {
//     try {
//         let tx = await contract.addMinter(user);
//         return { status: "successed", response: tx }
//     } catch (e) {
//         return { status: "failed", response: null }
//     }
// }

// // TODO (Xufei) 把上面 createNFT 监听部分和这里的整合成一份代码
// // 监听事件
// async function Listen(contract) {
//     contract.on("NFTCreated", (_FlowInsightId, _to) => {
//         console.log("id:", _FlowInsightId.toString(), "; to:", _to);
//         let id = _FlowInsightId.toString();
//         let owner = _to;
//         console.log("1",id, owner);
//         return {id: id, owner: owner};
//     });
// }

// async function approveNFT(user) {
//     try {
//         let isApproved = await contract.isApprovedForAll(user, marketplace_address);
//         if (isApproved == true) {
//             return { status: "success", response: {owner: user, operator: marketplace_address, state: true}};
//         }

//         let tx = await contract.setApprovalForAll(marketplace_address, true);
//         tx = await tx.wait();

//         // let eventFilter = contract.filters.ApprovalForAll();
//         // let events = await contract.queryFilter(eventFilter, tx.blockNumber, "latest");

//         // TODO (Xufei) 下面方法适合 Polygon，猜测是由于 metamask 支持的问题
//         let events = tx.events;
//         console.log("events", events);

//         return { status: "success", response: {owner: events[0].args[0], operator: events[0].args[1], state: events[0].args[2]}};
//     } catch (e) {
//         console.error(e);
//         return { status: "failed", response: null }
//     }
// }

// async function registerNFTSale(nftId) {
//     try {
//         let tmpRes = await contract.getApproved(BigNumber.from(nftId));
//         if (tmpRes == vault_address) {
//             return { status: "success", response: {}};
//         }
//         let tx = await marketplace.registerNFTSale(BigNumber.from(nftId));
//         tx = await tx.wait();
//         // let eventFilter = contract.filters.Approval();
//         // let events = await contract.queryFilter(eventFilter, tx.blockNumber, "latest");

//         // TODO (Xufei) 下面方法适合 Polygon，猜测是由于 metamask 支持的问题
//         let events = tx.events;
//         console.log("events", events);
//         // return { status: "success", response: {owner: events[0].args[0], approved: events[0].args[1], nftId: events[0].args[2]}};
//         return { status: "success", response: {}};
//     } catch (e) {
//         console.error(e);
//         return { status: "failed", response: null }
//     }
// }

// async function makeOfferWithETH(nftId, amount) {
//     try {
//         let tx = await marketplace.makeOfferWithETH(nftId, {value: utils.parseEther(amount)});
//         tx = await tx.wait();
//         // let eventFilter = marketplace.filters.PaymentCreated();
//         // let events = await marketplace.queryFilter(eventFilter, tx.blockNumber, "latest");

//         // TODO (Xufei) 下面方法适合 Polygon，猜测是由于 metamask 支持的问题
//         let events = tx.events;
//         console.log("events", events);
//         return { status: "success", response: {paymentId: events[4].args[0], nftId: events[4].args[1], from: events[4].args[2], to: events[4].args[3], value: events[4].args[4]}};
//     } catch (e) {
//         console.error(e);
//         return { status: "failed", response: null }
//     }
// }

// async function confirmTrade(nftId, paymentId) {
//     try {
//         console.log("typeof nftId", typeof nftId, ":", nftId);
//         console.log("typeof paymentId", typeof paymentId, ":", paymentId);
//         let tx = await marketplace.confirmTrade(BigNumber.from(nftId), BigNumber.from(paymentId));
//         tx = await tx.wait();
//         // let eventFilter = marketplace.filters.TradeComfirmed();
//         // let events = await marketplace.queryFilter(eventFilter, tx.blockNumber, "latest");

//         // TODO (Xufei) 下面方法适合 Polygon，猜测是由于 metamask 支持的问题
//         let events = tx.events;
//         console.log("events", events);
//         return { status: "success", response: {paymentId: events[4].args[0], nftId: events[4].args[1], executor: events[4].args[2]}};
//     } catch (e) {
//         console.error(e);
//         return { status: "failed", response: null }
//     }
    
// }

import { ethers } from 'ethers';

// import Web3 from "web3";
//获取 metamask provider
function getWeb3Provider() {

    if (!window.web3Provider) {
        if (!window.ethereum) {
            return null;
        }
        window.web3Provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    }
    return window.web3Provider;


}
//连接metamask
async function connectMetamask(provider) {
    if (provider === null) {
        return false;
    }
    try {
        // 获取当前连接的账户地址:
        let account = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        // 获取当前连接的链ID:
        let chainId = await window.ethereum.request({
            method: 'eth_chainId'
        });
        // contract = new ethers.Contract(contract_address, FlowInsightERC721NFT.abi, window.web3Provider.getSigner());
        // vault = new ethers.Contract(vault_address, FlowInsightVault.abi, window.web3Provider.getSigner());
        // marketplace = new ethers.Contract(marketplace_address, FlowInsightMarketplace.abi, window.web3Provider.getSigner());
        return { account: account, chainId: chainId, status: true };
    } catch (e) {
        console.error('could not get a wallet connection.', e);
        return false;
    }
}
//监听账户切换
function accountChangeListener(fn) {
    window.ethereum.on('accountsChanged', fn)
}
// const getWeb3 = () =>
//   new Promise((resolve, reject) => {
//     // Wait for loading completion to avoid race conditions with web3 injection timing.
//     window.addEventListener("load", async () => {
//       // Modern dapp browsers...
//       if (window.ethereum) {
//         const web3 = new Web3(window.ethereum);
//         try {
//           // Request account access if needed
//           await window.ethereum.enable();
//           // Acccounts now exposed
//           resolve(web3);
//         } catch (error) {
//           reject(error);
//         }
//       }
//       // Legacy dapp browsers...
//       else if (window.web3) {
//         // Use Mist/MetaMask's provider.
//         const web3 = window.web3;
//         console.log("Injected web3 detected.");
//         resolve(web3);
//       }
//       // Fallback to localhost; use dev console port by default...
//       else {
//         const provider = new Web3.providers.HttpProvider(
//           "http://127.0.0.1:9545"
//         );
//         const web3 = new Web3(provider);
//         console.log("No web3 instance injected, using Local web3.");
//         resolve(web3);
//       }
//     });
//   });

//   export default {
// 	getWeb3
// };

export {
  getWeb3Provider,
  connectMetamask,
  accountChangeListener,
  // getBalance,
  // getNftMetadata,
  // createNFT,
  // addMinter,
  // removeMinter,
  // approveNFT,
  // registerNFTSale,
  // makeOfferWithETH,
  // confirmTrade
}