
/* eslint-disable no-unused-vars */
import { NavLink } from "react-router-dom";
import { SortingCard } from '../../utils';
import React, { useState, useEffect, useContext } from "react";
import axios from 'axios'
import Web3 from "web3"
import '../../assets/css/profile.css'
import { useSelector } from "react-redux";
import FilterItem from "./item";
import Footer from "../../layouts/Footer";
import { AppContext } from "../../context/AppContext";

const NFTFilter = () => {
	const { themeMode } =
		useContext(AppContext);

	const [isLoading, setIsLoading] = useState(true);
	const account = useSelector((state) => state.cart.account)
	const web = useSelector((state) => state.cart.web3)

	//Load Contracts Function
	const [nftContract, setNFtContract] = useState(null)
	const [marketContract, setMarketContract] = useState(null)
	const [nftAddress, setNFtAddress] = useState(null)
	const [marketAddress, setMarketAddress] = useState(null)

	const [tokenContract, setTokenContract] = useState(null)
	const [tokenBalance, setTokenBalnce] = useState("0");
	//Load Contracts Function
	const [creathedItems, setcreathedItems] = useState([])


	useEffect(() => {
		if (web === null)
			return;
		const LoadContracts = async () => {
			//Paths of Json File
			const nftContratFile = await fetch("/abis/NFT.json");
			const marketContractFile = await fetch("/abis/NFTMarketPlace.json");
			//Convert all to json
			const convertNftContratFileToJson = await nftContratFile.json();
			const convertMarketContractFileToJson = await marketContractFile.json();
			//Get The ABI
			const markrtAbi = convertMarketContractFileToJson.abi;
			const nFTAbi = convertNftContratFileToJson.abi;

			const netWorkId = await web.eth.net.getId();

			const nftNetWorkObject = convertNftContratFileToJson.networks[netWorkId];
			const nftMarketWorkObject = convertMarketContractFileToJson.networks[netWorkId];

			//Get Token Contract
			const TokenContractFile = await fetch("/abis/Token.json");
			const convertTokenContractFileToJson = await TokenContractFile.json();
			const tokenAbi = await convertTokenContractFileToJson.abi;

			const TokenMarketWorkObject = convertTokenContractFileToJson.networks[netWorkId];
			if (nftNetWorkObject && nftMarketWorkObject && TokenMarketWorkObject) {
				const nftAddress = nftNetWorkObject.address;
				setNFtAddress(nftAddress)
				const marketAddress = nftMarketWorkObject.address;
				setMarketAddress(marketAddress)
				const deployedNftContractWithWallet = await new web.eth.Contract(nFTAbi, nftAddress);
				setNFtContract(deployedNftContractWithWallet)
				const deployedMarketContractWithWallet = await new web.eth.Contract(markrtAbi, marketAddress);
				setMarketContract(deployedMarketContractWithWallet)
				const tokenAddress = TokenMarketWorkObject.address;
				const deployedTokenContractWithWallet = await new web.eth.Contract(tokenAbi, tokenAddress);
				setTokenContract(deployedTokenContractWithWallet);

				if (account) {
					const getTokenBalance = await deployedTokenContractWithWallet.methods.balanceOf(account).call();
					const tokenPriceToWei = Web3.utils.fromWei(getTokenBalance, "ether")
					setTokenBalnce(tokenPriceToWei.toString());
				}

				const data = await deployedMarketContractWithWallet.methods.getAllUnsoldItems().call()
				const items = await Promise.all(data.map(async item => {
					// Url
					const nftUrl = await deployedNftContractWithWallet.methods.tokenURI(item.tokenId).call();
					const priceToWei = Web3.utils.fromWei((item.price).toString(), "ether")
					const metaData = await axios.get(nftUrl);

					//TODO: fix this object
					let myItem = {
						price: priceToWei,
						itemId: item.tokenId,
						owner: item.owner,
						seller: item.seller,
						oldOwner: item.oldOwner,
						creator: item.creator,
						oldSeller: item.oldSeller,
						royalty: item.royalty,
						oldPrice: item.oldPrice,
						image: metaData.data.image,
						type: metaData.data.type,
						title: metaData.data.name,
						category: metaData.data.category,
						description: metaData.data.description,
						isResell: item.isResell,
					}
					return myItem;
				}))
				setcreathedItems(items)
			} else {
				window.alert("You are at Wrong Network, Connect with BSC network Please")
			}
		}
		setIsLoading(false)
		LoadContracts()
		// eslint-disable-next-line
	}, [web, account])

	useEffect(() => {
		creathedItems?.length > 0 && setTimeout(() => SortingCard(), 2000)
	}, [creathedItems])

	const [category, SetCategory] = useState('all')

	const handleClick = (event) => {
		let value = event.target.name;
		SetCategory(value);
	}

	return (
		<>
			{
				isLoading ? "Loading" : <section className="blog-area section-padding-50">
					<div className="container">
						<div className="row">
							<div className="col-12 col-md-12">
								<div className="text-center dream-projects-menu mb-50 ">
									<div className="text-center portfolio-menu ">
										<button
											name="all"
											onClick={handleClick}
											className={`btn mr-2 ${category === "all" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter="*"
										>
											All
										</button>
										<button
											name="art"
											onClick={handleClick}
											className={`btn  mr-2  ${category === "art" ? "filter-active" : ""}  ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".art"
										>
											ART
										</button>
										<button
											name="collectibles"
											onClick={handleClick}
											className={`btn  mr-2 ${category === "collectibles" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".collectibles"
										>
											COLLECTIBLES
										</button>
										<button
											name="photography"
											onClick={handleClick}
											className={`btn  mr-2 ${category === "photography" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".photography"
										>
											PHOTOGRAPHY
										</button>
										<button
											name="sport"
											onClick={handleClick}
											className={`btn  mr-2 ${category === "sport" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".sport"
										>
											SPORT
										</button>
										<button
											name="trading"
											onClick={handleClick}
											className={`btn  mr-2 ${category === "trading" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".tradingcards"
										>
											TRADING CARDS
										</button>
										<button
											name="utility"
											onClick={handleClick}
											className={`btn  mr-2 ${category === "utility" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".utility"
										>
											UTILITY
										</button>
										<button
											name="virtualworld"
											onClick={handleClick}
											className={`btn  mr-2 ${category === "virtualworld" ? "filter-active" : ""} ${themeMode ? "light-color" : "dark-color"}`}
											data-filter=".virtualworlds"
										>
											VIRTUAL WORLDS
										</button>
									</div>
								</div>
								<div className="row">
									<div className="container col-md-9">
										<div className="row dream-portfolio" data-aos="fade-up">
											{creathedItems?.map((item, i) =>
												<FilterItem
													key={i}
													item={item}
												/>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			}
			<br />
			<Footer />
		</>
	);
}

export default NFTFilter;