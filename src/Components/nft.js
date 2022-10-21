import '../styles/nft.css'
import nftAbi from '../utils/nftMint.json'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ethers } from 'ethers';
import Web3 from 'web3';
import walletAbi from '../utils/wallet.json';
import tokenAbi from '../utils/token.json';
import axios from 'axios';
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { Buffer } from 'buffer';

//Infura autherization

const projectId = process.env.REACT_APP_INFURA_PROJECT_ID
const projectSecret = process.env.REACT_APP_INFURA_SECRET_KEY
var buffer = window.buffer;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')


const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    //apiPath:'/api/v0/',
    headers: {
        authorization: auth,
    }
});


export default function NftMint(){
    const [imageUrl, setImageUrl]= useState()
    const [nftName, setNftName]= useState()
    const [nftSymbol, setNftSmbol] = useState()
   // const [nftCount, setNftCount] = useState()
    const [toAddress, setToAddress] = useState()
    const[currentChainId, setCurrentChainId] = useState()
    const providerUrl = process.env.REACT_APP_URL
    const web3 = new Web3(providerUrl)
    const [currentAccount, setCurrentAccount] =useState()
    const [nftDisplayUrl, setNftDisplayUrl] = useState([])
    const [nftItemName, setNftItemName]=useState()
    const[nftDescription, setNftDescription]= useState()
    const[uploadPath, setUPloadPath] = useState()
    //const [fileUrl, setFileUrl]= useState()
   // const [formInput, updateFormInput] = useState({ name: '', description: '' })

   
    useEffect(()=>{
        getNftInfo();
        getNetworkId();
        
    },[])
    
    const displayImage =(event)=>{
        setImageUrl(URL.createObjectURL(event.target.files[0]))
    }

    const getNftInfo= async()=>{
        //event.preventDefault()
        //const data = new FormData(event.target)
        const provider =  new ethers.providers.Web3Provider(window.ethereum)
        const nftContract = new ethers.Contract(process.env.REACT_APP_NFT_CONTRACT_ADDRESS, nftAbi, provider)
        
        const nName = await nftContract.name()
        const nsymbol = await nftContract.symbol();
        setNftName(nName)
        setNftSmbol(nsymbol)

       // var tx = await nftContract.methods.safeMint()

    }

    const getNetworkId=async()=>{
        const currentChainId = await web3.eth.net.getId()
        //console.log(currentChainId)
        setCurrentChainId(currentChainId)
    }

    const handleAccountChanges=(accounts)=>{
        console.log("handlechange")
        if(accounts.lenght === 0){
            console.log("connet to metamask")
        }else if(accounts[0] !== currentAccount ){
            //currentAccount = accounts[0]
            setCurrentAccount(accounts[0])
            //console.log(currentAccount)
        }
    }
    
    const connect=()=>{
        console.log("connect()")
         window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(handleAccountChanges)
        .catch((err)=>{
            if(err.code === 4001){
                console.log("you refused to connect to metamask")
                Swal.fire({
                    icon: "error",
                    title: "You refused Connection",
          
                    confirmButtonText:
                      '<i class="fa fa-thumbs-up"></i> <a href="#"  style="color: white;">OK</a>',
                    confirmButtonAriaLabel: "Thumbs up, great!",
          
                    timerProgressBar: true,
                  });
            }else{
                console.error(err)
            }
        })
    }

    const switchNetwork= async(chainId)=>{

        if(currentChainId !== chainId){
        try{
                await web3.currentProvider.request({
                    method:"wallet_switchEthereumChain",
                    params: [{chainId: web3.utils.toHex(chainId)}],
                });
                
            }
            catch(switchError){
                if(switchError.code === 4902){
                    alert("aad this mail Id")
                }
            }
        }

        if(chainId === 80001){
            const tokenCotract = new web3.eth.Contract(tokenAbi,process.env.REACT_APP_TOKEN_CONTRACT)
           // const provider = new ethers.providers.Web3Provider(window.ethereum)
            const nft721Contract = new web3.eth.Contract(nftAbi,process.env.REACT_APP_NFT_CONTRACT_ADDRESS)
            const walletContract = new web3.eth.Contract(walletAbi, process.env.REACT_APP_WALLET_CONTRACT)
            //console.log(tokenCotract)

        }
    }


// const handleImageChange=async(e)=>{
//     e.preventDefault()
    
//     const file = e.target.files[0]
//     setImageUrl(URL.createObjectURL(file))

//     try {
//         const added = await client.add(
//             file,
//             {
//                 progress: (prog) => console.log(`received: ${prog}`)
//             }
//         )
//         const url = `https://nftminting.infura-ipfs.io/ipfs/${added.path}`
//         setNftDisplayUrl(url)
//     }
//     catch(error){
//         console.log("Error in infura", error)
//     }

//  }

// async function uploadToIPFS() {
//     //const { name, description } = formInput
//     if (!nftItemName || !nftDescription || !nftDisplayUrl) return

//     const data = JSON.stringify({
//         nftItemName, nftDescription, nftDisplayUrl: nftDisplayUrl
//       })

//       try {
//         const added = await client.add(data)
//         console.log(data)
//         const url = `https://nftminting.infura-ipfs.io/ipfs/${added.path}`
//         /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
//         console.log("HELLO",url)
//         setUPloadPath(added.path)
//         return url
//       } catch (error) {
//         console.log('Error uploading file: ', error)
//       }  
// }
    //minting the nft with mint function in the smart contract
    const handleNftMinting=async(e) =>{
        e.preventDefault()
        await connect()
        //const data = new FormData(e.target)
        //const provider = new ethers.providers.Web3Provider(window.ethereum)
        //await uploadToIPFS()

        await switchNetwork(80001).then(async()=>{
        const {address: admin} =  web3.eth.accounts.wallet.add(process.env.REACT_APP_ACCOUNT_PRIVATE_KEY)
        const walletContract = new web3.eth.Contract(walletAbi, process.env.REACT_APP_WALLET_CONTRACT)
        const nft721Contract = new web3.eth.Contract(nftAbi,process.env.REACT_APP_NFT_CONTRACT_ADDRESS)

        //console.log("dddddddddddddddd",url)

        var tx = await nft721Contract.methods.safeMint(process.env.REACT_APP_WALLET_CONTRACT,toAddress,'https://example.com/nft/').encodeABI()
        var rawTransaction = {"to": process.env.REACT_APP_NFT_CONTRACT_ADDRESS, "gasLimit": 8500000, "data": tx };
        web3.eth.accounts.signTransaction(rawTransaction,process.env.REACT_APP_ACCOUNT_PRIVATE_KEY )
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(async(req)=>{
            console.log(req)
            console.log(web3.utils.hexToNumber(req.logs[0].topics[3]))
            
            walletContract.methods.getCurrentNonce().call().then ( async(noncereq) =>{
                console.log("nonce", noncereq)
                
                tx = await walletContract.methods.LockNfts(toAddress,web3.utils.hexToNumber(req.logs[0].topics[3]),noncereq).encodeABI();
                const rawTransaction  = {"to": process.env.REACT_APP_WALLET_CONTRACT,  "gasLimit": 8500000, "data": tx }
                web3.eth.accounts.signTransaction(rawTransaction, process.env.REACT_APP_ACCOUNT_PRIVATE_KEY)
                .then(signTx =>{
                    web3.eth.sendSignedTransaction(signTx.rawTransaction)
                    .then( async(req)=>{
                        console.log(req)
                      //await displaynft()
                    })
                })
            })
        })
        })
    }

    const displaynft=async()=>{
        
        console.log("displauURL",nftDisplayUrl)
        const walletContract = new web3.eth.Contract(walletAbi, process.env.REACT_APP_WALLET_CONTRACT)
        console.log("displayNFT")
        const nft721Contract = new web3.eth.Contract(nftAbi,process.env.REACT_APP_NFT_CONTRACT_ADDRESS)
        await switchNetwork(80001).then(async(result)=>{
            walletContract.methods.getNfts(currentAccount).call()
            .then(async(result)=>{
                console.log("jjjj",result)
                
                for(var i=0;i<result.length;i++){
                    const tokenURI = await nft721Contract.methods.tokenURI(result[i]).call()
                    console.log("uri",tokenURI)
                }
            

            
            })
            
        })

        // const request = new Request(url);
        // const response = await fetch(request);
        // const metadata = await response.json();
        // console.log(metadata);
    }
    return(
        <div>
            <form id="nftmint" className="text-center mt-4" onSubmit={handleNftMinting}>
                <label>Address : </label>
                <input type="text" name="toAddress" id='toAddress' onChange={(e)=>setToAddress(e.target.value)}></input><br></br>
                
                <label>Name:</label>
                <input type="text" placeholder='Your NFT name' onChange={(e)=>setNftItemName(e.target.value)}></input><br></br>
                <label>Description:</label>
                <input type="text" placeholder='Your NFT description' onChange={((e)=>setNftDescription(e.target.value))} ></input>
                <input type="file" placeholder='Choose Image to make your NFT' accept="image/png, image/jpeg" onChange={displayImage} name="imgFile"></input>
                <div id="userPic">
                    <img src={imageUrl} id="uploadedImage"></img>
                </div>
                <button type='submit'>MintNft</button>
            </form>
            <p>{nftName}</p>
            <p>{nftSymbol}</p>
            <div>
                {/* <img src={nftDisplayUrl}  id=""></img> */}
            </div>
            
        </div>
    )
}