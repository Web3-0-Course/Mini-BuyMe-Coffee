// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract CoffeePortal {
    uint256 totalCoffee;

    address payable public owner;

    /**
     
    */

    event NewCoffee(
        address indexed from,
        uint256 timestamp,
        string message,
        string name
    );


    constructor() payable {
        console.log("Coffee Shop");

        owner = payable(msg.sender);
    }

    /*
    * I created a struct here named Coffee
    * A struct is basically a custom datatype where we can customize what we want to hold inside it
    */
    struct Coffee {
        address giver;
        string message; 
        string name; 
        uint256 timestamp;
    }

    Coffee[] coffee;


    function getAllCoffee() public view returns (Coffee[] memory){
        return coffee;
    } 

    // get all coffee bought
    function getTotalCoffee() public view returns (uint256){
        console.log("We have %d total coffee received ", totalCoffee);
        return totalCoffee;
    }

    /**
    * You'll notice I changed the buycoffee function
    **/

    function buyCoffee (string memory _message, string memory _name, uint256 _payAmount) public payable {
        uint256 cost = 0.001 ether;
        require(_payAmount <= cost,"Insufficient Ether provided");

        totalCoffee += _payAmount;
        console.log("%s has just sent a coffee ", msg.sender);
        console.log("New Coffee :%d ", totalCoffee);
        coffee.push(Coffee(msg.sender, _message, _name, block.timestamp));

        (bool success , ) = owner.call{value: _payAmount}("");
        require(success, "Failed to send money");

        emit NewCoffee(msg.sender, block.timestamp, _message, _name);


    } 
}