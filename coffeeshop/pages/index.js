import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import {CONTRACT_ABI, contractAddress} from '../utils/CofferPortal'

let provider;
if (typeof window.ethereum !== 'undefined'){
  provider = new ethers.providers.Web3Provider(window.ethereum)
} else {
  provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
}

let contract = new ethers.Contract(CONTRACT_ABI, contractAddress, provider)
let signer;


const Home = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState('');
  const [message, setMessage]= useState('');
  const [allCoffee, setAllCoffee] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      /**
       * Check if we're authorized to access the user's waller
       */
      const accounts = await ethereum.request({method: "eth_accounts"});

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success("🎽 Wallet is connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false, 
          closeOnClick: true,
          pauseOnHover: true, 
          draggable: true,
          progress: undefined
        });
      } else {
        toast.warn("Make sure you have metamask connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false, 
          closeOnClick: true,
          pauseOnHover: true, 
          draggable: true, 
          progress: undefined,
        });
      }
    } catch(error){
      toast.error(`${error.message}`,{
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false, 
        closeOnClick: true, 
        pauseOnHover: true, 
        draggable: true ,
        progress: undefined,

      });
    }
  };

  /***
   * Implement Connect Metamask wallet
   */


  const connectWallet = async () => {
    try {
      const { ethereum} = window;

      if (!ethereum){
        toast.warn("Make sure you have Metamask connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined, 
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error){
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const {ethereum} = window;

      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeePortContract = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          signer 
        ); 

        let count = await coffeePortContract.getTotalCoffee();
        console.log("Retrieved total Coffee count ...",count.toNumber());

        /**
         * Execute the acutal coffee gift from your smart contract
        */
       const coffeeTxn = await coffeePortContract.buyCoffee(
        message ? message : "Enjoy your coffee",
        name ? name : "Anonymous",
        ethers.utils.parseEther("0.001"),
        {
          gasLimit: 300000, 
        }
       );
       console.log("Mining...", coffeeTxn.hash);
       toast.info("Sending Fund for Coffee...", {
        position: "top-left",
        autoClose: 18050, 
        hideProgressBar: false, 
        closeOnClick: true, 
        pauseOnHover: true, 
        draggable: true, 
        progress: undefined, 
       });

       await coffeeTxn.wait();

       console.log("Mined --- ", coffeeTxn.hash);

       count = await coffeePortContract.getTotalCoffee();

       console.log("Retrieved total Coffee count ...", count.toNumber());

       setMessage("");
       setName("");

       toast.success("Coffee Purchased!!", {
        position: "top-left",
        autoClose: 5000, 
        hideProgressBar: false ,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true, 
        progress: undefined,
       });

      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error ){
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000, 
        hideProgressBar: false, 
        closeOnClick: true, 
        pauseOnHover: true, 
        draggable: true, 
        progress: undefined, 
      });
    }
  };

  /***
   * Create a method that get all the coffee from your contract
   */

  const getAllCoffee = async () => {
    try {
      const {ethereum} = window;
      if (ethereum ){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeePortalContract = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          signer 
        );

        /**
         * Call the getAllCoffee method from your smart contract
         */
        const coffees = await coffeePortalContract.getAllCoffee();

        /**
         * We only need address , timestamp, name, and message in our UI so let's pick those out
         */
        const coffeeCleaned = coffees.map((coffee) => {
          return {
            address : coffee.giver,
            timestamp: new Date(coffee.timestamp * 1000),
            message: coffee.message, 
            name: coffee.name,
          };
        });

        /***
         * Store our data in React state
         */
        setAllCoffee(coffeeCleaned);
      }  else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error ){
      console.log(error);
    }
  };

  /**
   * This runs our function when the page loads
   */
  useEffect(() => {
    let coffeePortalContract;
    const onNewCoffee = (from, timeStamp, message, name) => {
      console.log("NewCoffee", from, timeStamp, message, name);
      setAllCoffee((prevState) => [
         ...prevState, 
        {
          address: from ,
          timeStamp: new Date(timeStamp * 1000),
          message : message ,
          name: name,
        }
      ]);
    };
    if (typeof window.ethereum !== "undefined" || (typeof window.web3 !== "undefined") ) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

   
    getAllCoffee();
    checkIfWalletIsConnected();

    

      const signer = provider.getSigner();

      coffeePortalContract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI, 
        signer
      );
      coffeePortalContract.on("NewCoffee", onNewCoffee);
      }    
    

    return () => {
      if (coffeePortalContract){
        coffeePortalContract.off("NewCoffee", onNewCoffee);
      }
    }
  
  },[]);


  const handleNameChange = (e) => {
    const { value } = e.target;
    setName(value);  
    console.log("Name : ",value);
  }

  const handleMessageChange = (e) => {
    const { value } = e.target;
    setMessage(value);
    console.log("Message : ", value); 
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <header>
      <title>
          Mini Buy Me a Coffee 
        </title>
        <link rel="icon" href="/favicon.ico" />
      </header>

      <main className="flex flex-col items-center justity-center w-full flex-1 px-20 text-center">
         <h1 className="text-6xl font-bold text-purple-600 mb-6">
            Buy Me A Coffee
         </h1>

        { currentAccount ? (<div className="w-full max-w-xs sticky top-3 z-50" >
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                  <label className="block text-grey-700 text-sm font-bold mb-2" htmlFor="name">
                      Name 
                  </label>
                  <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-nonce focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Name"
                  onChange={handleNameChange}
                  required 
                />
                </div>
              <div className="mb-4">
                <label
                className="block text-grey-700 text-sm font-bold mb-2"
                htmlFor="message" 
                >
                  Send the Creator a Message 

                </label>

                <textarea
                className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-grey-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={3}
                placeholder="Message"
                id="message"
                onChange={handleMessageChange}
                required={false}

                >
                </textarea>
              </div>  
              <div className="flex items-left justify-between">
                <button
                 className="bg-purple-500 hover:bg-purple-700 text-center text-white font-bold py-2 px-3 rounded focus: outline-none focus:shadow-outline"
                 type="button"
                 onClick={buyCoffee}
                 >
                  Support $1

                </button>

              </div>
            </form>
         </div>) : (
          <div>
            <p className="text-2xl text-orange-600 mb-6">
              You can switch your wallet to Goerli Testnet to use this application
            </p>
            <button
             className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded-full mt-3"
             onClick={connectWallet}
            >
              Connect Your Wallet
            </button>
          </div>
         )}

         {allCoffee.map((coffee, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!--- Dot Following the Left Vertical Line ---> */}
                <div className="w-5 h-5 bg-yellow-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0">

                </div>
                    {/* <!-- Line that connecting the box with the vertical line --> */}
                    <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>
              
                 
 {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">Supporter: {coffee.name}</h1>
                  <h1 className="text-md">Message: {coffee.message}</h1>
                  <h3>Address: {coffee.address}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {coffee.timestamp.toString()}
                  </h1>
                </div>            
                  </div>
            </div>
          )
         })}

      </main>
      <ToastContainer 
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover

      />
      
    

    </div>
  )

}

export default Home;