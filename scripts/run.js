const main = async () => {
    const coffeeContractFactory = await ethers.getContractFactory("CoffeePortal") ;
    const coffeeContract = await coffeeContractFactory.deploy({
        value: ethers.utils.parseEther("0.1"), 
    });

    
    
    await coffeeContract.deployed();

    console.log("Coffee Contract deployed to : ", coffeeContract.address);

    /*Get Contract Balance*/
    let contractBalance = await ethers.provider.getBalance(
        coffeeContract.address
    );
    console.log("Contract Balance : ", ethers.utils.formatEther(contractBalance));

    /*
    Let's try to buy a coffee
    */
   const coffeeTxn = await coffeeContract.buyCoffee(
    "This is coffee #1",
    "Adhrit",
    ethers.utils.parseEther("0.001")
   );

   await coffeeTxn.wait();

   /**
    * Get contract balance to see what happened
    * 
   */
  contractBalance = await ethers.provider.getBalance(coffeeContract.address);

  console.log("Contract balance : ", ethers.utils.formatEther(contractBalance));

  let allCoffee = await coffeeContract.getAllCoffee();
  console.log(allCoffee);

};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error){
        console.log(error);
        process.exit(1);
    }
};

runMain()