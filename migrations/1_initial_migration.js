const NFTMarketPlace = artifacts.require("NFTMarketPlace");
const NFT = artifacts.require("NFT");
const Token = artifacts.require("Token");



module.exports =  async function (deployer) {
  await deployer.deploy(Token);
  const  token = await Token.deployed();
  
  await deployer.deploy(NFTMarketPlace); 
  const market = await NFTMarketPlace.deployed()
  await deployer.deploy(NFT,market.address);
}
