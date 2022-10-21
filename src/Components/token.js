import tokenAbi from '../utils/token.json';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import '../styles/token.css';
import Web3 from 'web3';
import Swal from 'sweetalert2';

export default function Token(){
  const [tkName, setTkName ] = useState()
  const [tkSym, setTkSym] = useState()
  const [tkSypply, setTkSypply] = useState()
  const [accBalance, setAccBalance] = useState()
  const [receiverAddress, setReceiverAaddress]= useState()
  const [token20contract , setToken20Contract] = useState()
  const [currentAccount, setCurrentAccount] =useState()
  const [transactionAamount, setTransactionAmount] = useState()
  const providerUrl = process.env.REACT_APP_URL
  //console.log(providerUrl)
  const web3 = new Web3(providerUrl)

  useEffect(()=>{
    handleSubmit()
    getMyBalance()
  },[])

 
  const handleSubmit=async ()=>{
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const tokenCotract = new ethers.Contract(process.env.REACT_APP_TOKEN_CONTRACT, tokenAbi, provider)
   
    const tokenName = await tokenCotract.name();
    const tokenSymbol = await tokenCotract.symbol();
    
    const tokenSupply = await tokenCotract.totalSupply();
    setTkName(tokenName)
    setTkSym(tokenSymbol)
   
    setTkSypply(String(tokenSupply))
   
  }

  const swichNetwork = async (chainId) => {

    const currentChainId = await getNetworkId()
    
    if (currentChainId !== chainId) {
    try {
      console.log("hi")
        await web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
            params: [{ chainId: Web3.utils.toHex(chainId) }],
            
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
        alert('add this chain id')
        }
    }
    }
  }

  const getNetworkId = async () => {
    const currentChainId = await web3.eth.net.getId()
    //console.log(currentChainId)
    return currentChainId
}

  const getMyBalance= async() =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts",[]);
    const erc20 = new ethers.Contract(process.env.REACT_APP_TOKEN_CONTRACT, tokenAbi, provider)
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    setCurrentAccount(signerAddress)
    const balance = await erc20.balanceOf(signerAddress);

    setAccBalance(String(balance))
  }
  


  const handleTransfer1=async(e)=>{
    e.preventDefault();
    await swichNetwork(80001).then( async(res)=>{
          //console.log(res)
          const data = new FormData(e.target)
          const provider =  new ethers.providers.Web3Provider(window.ethereum)
          await provider.send("eth_requestAccounts",[]);
          const signer = await provider.getSigner()
          if(accBalance >0 ){
          const erc20 = new web3.eth.Contract(tokenAbi, process.env.REACT_APP_TOKEN_CONTRACT)
          var tx =  await erc20.methods.transfer(data.get("recipient"), data.get("amount")).encodeABI()
          var rawTransaction = {"to": process.env.REACT_APP_TOKEN_CONTRACT, "gasLimit": 8500000, "data": tx };
          console.log(rawTransaction)
          web3.eth.accounts.signTransaction(rawTransaction, process.env.REACT_APP_ACCOUNT_PRIVATE_KEY)
                          .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                          .then(async function (req) {
                              console.log('Trnnsfer token tx---',req)
                              Swal.fire({
                                icon: "sucess",
                                title: "Transaction successfull",
                      
                                confirmButtonText:
                                  '<i class="fa fa-thumbs-up"></i> <a href="#"  style="color: white;">OK</a>',
                                confirmButtonAriaLabel: "Thumbs up, great!",
                      
                                timerProgressBar: true,
                              });
             })
            }else{
              Swal.fire({
                icon: "error",
                title: "not enough tokens",
      
                confirmButtonText:
                  '<i class="fa fa-thumbs-up"></i> <a href="#"  style="color: white;">OK</a>',
                confirmButtonAriaLabel: "Thumbs up, great!",
      
                timerProgressBar: true,
              });
            }
            })
            .catch((err)=>{
              console.log(err)
            })
                  
  }

  // const handleTransfer = async(e)=>{
  //               //e.preventDefault()
  //               console.log("transfe")
  //               const data = new FormData(e.target)

  //               await swichNetwork(8001).then( async (res)=> {

  //                //var balance =    await token20contract.methods.balanceOf(currentAccount).call();

  //                //var balanceto =    await token20contract.methods.balanceOf('0xE4590231332e41AA806eB47F20842EEc942c93ab').call();



  //                //console.log(balance)

  //                if(accBalance>0){
  //                 const erc20 = new ethers.Contract(process.env.REACT_APP_TOKEN_CONTRACT, tokenAbi)
  //                   var tx = await await erc20.transfer(receiverAddress,transactionAamount).encodeABI()
  //                   //var tx = await token20contract.methods.transfer(receiverAddress,transactionAamount).encodeABI();
  //                   var rawTransaction = {"to": process.env.REACT_APP_TOKEN_CONTRACT, "gasLimit": 8500000, "data": tx };
  //                   web3.eth.accounts.signTransaction(rawTransaction, process.env.REACT_APP_ACCOUNT_PRIVATE_KEY)
  //                   .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
  //                    .then(async function (req) {
  //                       console.log('Trnnsfer token tx---',req)
                      
  //                   })
  //                }
                 



  //               });

  // }



  return (
    <div className="App">
      <div id="token" className="text-center mt-4">
        <p>{tkName}</p>
        <p>{tkSym}</p>
        <p>{tkSypply}</p>
      </div>
      <div className="p-4">
              <p>{accBalance}</p>
      </div>

      <form onSubmit={handleTransfer1}>
              
        <input type="text"   name="recipient" placeholder="Recipient address" onChange={(e)=>setReceiverAaddress(e.target.value)}/>
        <input type="text" name="amount" placeholder="Amount to transfer" onChange={(e)=>setTransactionAmount(e.target.value)}/>
        <button type="submit">Transfer</button>
        <p></p>
              
      </form>
      
    </div>
  );
}