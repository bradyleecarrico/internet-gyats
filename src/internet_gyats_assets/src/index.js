import { internet_gyats } from "../../declarations/internet_gyats";
import { Principal } from "@dfinity/principal";
import idlFactory from "./ledger.did.js";

main()

function main() {
  const plugButton = document.getElementById("plug");
  const mintButton = document.getElementById("mint");
  const myButton = document.getElementById("my");
  const rareButton = document.getElementById("rare");
  const logsButton = document.getElementById("logs");
  const myX = document.getElementById("myX");
  const rareX = document.getElementById("rareX");
  const logsX = document.getElementById("logsX");

  plugButton.addEventListener("click", onButtonPressPlug);
  mintButton.addEventListener("click", onButtonPressMint);
  myButton.addEventListener("click", onButtonPressMy);
  rareButton.addEventListener("click", onButtonPressRare);
  logsButton.addEventListener("click", onButtonPressLogs);
  myX.addEventListener("click", onXPressMy);
  rareX.addEventListener("click", onXPressRare);
  logsX.addEventListener("click", onXPressLogs);
  
}

const faucetId = "yeeiw-3qaaa-aaaah-qcvmq-cai";
const NFTcanisterId = "kbpid-wqaaa-aaaai-qicfq-cai";
const account = {account: "3190fc7fb919fd9ba34b569a74fafe53d7e40aa1d6c9e1fef3a43e9612dd9b19"};

const ModifiedInterfaceFactory = ({ IDL }) => {
  const NFTs = IDL.Vec(
    IDL.Record({
      tokenId: IDL.Nat,
      principalId: IDL.Text,
    }),
  )
  const TokenId = IDL.Nat
  const MessageId = IDL.Nat
  const URI = IDL.Text
  const Room = IDL.Nat
  const Message = IDL.Text
  const MessageArgs = IDL.Record({
    room: Room,
    message: Message,
  })
  return IDL.Service({
    allMinted: IDL.Func([], [NFTs], ["query"]),
    mint: IDL.Func([URI], [TokenId], []),
    message: IDL.Func([MessageArgs], [MessageId], []),
  })
}
// Whitelist
const whitelist = [
  faucetId,
  NFTcanisterId,
];
async function onButtonPressPlug () {

  

  // Make the request
  const isConnected = await window.ic.plug.requestConnect({
      whitelist,
  });

  //Create (authenticaed) actor
  const faucetActor  = await window.ic.plug.createActor({
    canisterId: faucetId,
    interfaceFactory: idlFactory,
  });
  
  const balance = await faucetActor.account_balance_dfx(account);
  console.log("Balance: ", balance);

}

let stop = false;
let i = 4;
let source = i + ".png";
var mintText = document.getElementById("mint");

async function onButtonPressMint() {


  const connected = await window.ic.plug.isConnected();
  if (!connected) {
    alert("Please connect to plug before minting an NFT!");
  }
  else {
    if (stop) {
      i = 14;
      stop = false;
      mintText.firstChild.data = "Start Mint";
      mint_nft();
    }
    else {
      mintText.firstChild.data = "Mint NFT";
      i = 4;
      let j = 0;
      stop = true;
      for (; i < 13; i++){
        source = i + ".png";
        document.getElementById("image").src = source;
        if (i == 12) {i = 4; j++}
        if (j == 5) {j = 0; i = (Math.floor(Math.random() * 100)%3);}
        await new Promise(res => { setTimeout(res, 90); });
      }
    }
  }
}

async function getPrincipal() {
  await window.ic.plug.createAgent({ whitelist })
  const agent = window.ic.plug.agent
  const principal = await agent.getPrincipal()
  return principal.toText()
}

async function mint_nft() {
  // Get the url of the image from the input field
  const name = document.getElementById("image").src;
  console.log("The url we are trying to mint is " + name);

  // Get the principal from the input field.
  //const principal_string = "vfkkj-zurs7-dnnw5-dn2tt-qa7wx-wmcov-jj7zw-wv2zy-eolie-e3xhh-nqe";
  //const principal = Principal.fromText(principal_string);
  const principalId = await getPrincipal();
  const p = Principal.fromText(principalId);

  // Mint the image by calling the mint_principal function of the minter.
  const mintId = await internet_gyats.mint_principal(name, p);
  console.log("The id is " + Number(mintId));
  // Get the id of the minted image.

  // Get the url by asking the minter contract.
  document.getElementById("image").src = await internet_gyats.tokenURI(mintId);
  document.getElementById("image").src = source;

  //transfer tokens
  sendBootcampTokens();

  const faucetActor  = await window.ic.plug.createActor({
    canisterId: faucetId,
    interfaceFactory: idlFactory,
  });
  
  const balance = await faucetActor.account_balance_dfx(account);
  console.log("Balance: ", balance);

}

async function sendBootcampTokens() {
  
  const faucetActor  = await window.ic.plug.createActor({
    canisterId: faucetId,
    interfaceFactory: idlFactory,
  });

  const balance = await faucetActor.account_balance_dfx(account);
  
  try {
    const response = await faucetActor.send_dfx({
      to: "3190fc7fb919fd9ba34b569a74fafe53d7e40aa1d6c9e1fef3a43e9612dd9b19",
      fee: {
        e8s: 10000,
      },
      memo: 0,
      from_subaccount: [],
      created_at_time: [],
      amount: {
        e8s: 10000000000,
      },
    })
    console.log(response)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}


async function onButtonPressMy() {

  const connected = await window.ic.plug.isConnected();
  if (!connected) {
    alert("Please connect to plug before you can see your NFTs!");
  }
  else {
  document.getElementById("coverMy").style.display = 'block';

  const faucetActor  = await window.ic.plug.createActor({
    canisterId: NFTcanisterId,
    interfaceFactory: ModifiedInterfaceFactory,
  });

  const all = await internet_gyats.allMinted();
  const principalId = await getPrincipal();

  for (let i = 0; i < all.length; i++) {

    if(all[i].principalId == principalId){
    var img = document.createElement('img');
    img.style.width = '30%';
    img.src = all[i].uri;
    document.getElementById('coverMy').appendChild(img);
    }
  }
  }
}

async function onButtonPressRare() {
  document.getElementById("coverRare").style.display = 'block';
}

async function onButtonPressLogs() {
  document.getElementById("coverLogs").style.display = 'block';
  const all = await internet_gyats.allMinted();

  for (let i = 0; i < all.length; i++) {
    var img = document.createElement('img');
    img.style.width = '30%';
    img.src = all[i].uri;
    document.getElementById('coverLogs').appendChild(img);
  }
}

async function onXPressMy() {
  document.getElementById("coverMy").style.display = 'none';
  let x = document.getElementById("myX");
  const removeChilds = (parent) => {
      while (parent.lastChild != x) {
          parent.removeChild(parent.lastChild);
      }
  };

  const cover = document.getElementById('coverMy');

  removeChilds(cover);
}

async function onXPressRare() {
  document.getElementById("coverRare").style.display = 'none';
}

async function onXPressLogs() {
  document.getElementById("coverLogs").style.display = 'none';
  let x = document.getElementById("logsX");
  const removeChilds = (parent) => {
      while (parent.lastChild != x) {
          parent.removeChild(parent.lastChild);
      }
  };
  const cover = document.getElementById('coverLogs');

  removeChilds(cover);
}