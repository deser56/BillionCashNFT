// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./NFT.sol";

contract NFTMarketPlace is ReentrancyGuard {
    address payable owner;
    uint256 marketFees = 0.10 ether;
    using Counters for Counters.Counter;
    Counters.Counter private itemId;
    Counters.Counter private itemsSold;
    Counters.Counter private _itemsDeleted;

    constructor() {
        owner = payable(msg.sender);
    }

    struct NftMarketItem {
        address nftContract;
        uint256 id;
        uint256 tokenId;
        address payable creator;
        address payable seller;
        address payable owner;
        address payable admin;
        uint256 price;
        int32 royalty;
        bool sold;
        address oldOwner;
        address oldSeller;
        uint256 oldPrice;
        bool isResell;
    }

    event NftMarketItemCreated(
        address indexed nftContract,
        uint256 indexed id,
        uint256 tokenId,
        address creator,
        address seller,
        address owner,
        address admin,
        uint256 price,
        int32 royalty,
        bool sold,
        address oldOwner,
        address oldSeller,
        uint256 oldPrice,
        bool isResell
    );

    //=>
    event ProductUpdated(
        uint256 indexed id,
        uint256 indexed newPrice,
        bool sold,
        address owner,
        address seller
    );
    //=>
    event MarketItemDeleted(uint256 id);
    //=>
    event ProductSold(
        uint256 indexed id,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        address seller,
        address owner,
        uint256 price,
        address oldOwner,
        address oldSeller,
        uint256 oldPrice,
        bool isResell
    );
    //==>
    event ProductListed(uint256 indexed itemId);

    function gettheMarketFees() public view returns (uint256) {
        return marketFees;
    }

    ///////////////////////////////////
    mapping(uint256 => NftMarketItem) private idForMarketItem;
    ///////////////////////////////////
    ///=>
    modifier onlyProductOrMarketPlaceOwner(uint256 id) {
        if (idForMarketItem[id].owner != address(0)) {
            require(idForMarketItem[id].owner == msg.sender);
        } else {
            require(
                idForMarketItem[id].seller == msg.sender || msg.sender == owner
            );
        }
        _;
    }

    modifier onlyProductSeller(uint256 id) {
        require(
            idForMarketItem[id].owner == address(0) &&
                idForMarketItem[id].seller == msg.sender,
            "Only the product can do this operation"
        );
        _;
    }

    modifier onlyItemOwner(uint256 id) {
        require(
            idForMarketItem[id].owner == msg.sender,
            "Only product owner can do this operation"
        );
        _;
    }

    modifier onlyItemOldOwner(uint256 id) {
        require(
            idForMarketItem[id].oldOwner == msg.sender,
            "Only product Old owner can do this operation"
        );
        _;
    }

    function createItemForSale(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        int32 royalty
    ) public payable nonReentrant {
        require(price > 0, "Price should be moreThan 1");
        require(tokenId > 0, "token Id should be moreThan 1");
        require(msg.value == marketFees, "The Market Fees is 0.10 Ether");
        require(nftContract != address(0), "address should not be equal 0x0");
        itemId.increment();
        payable(owner).transfer(marketFees);
        uint256 id = itemId.current();

        idForMarketItem[id] = NftMarketItem(
            nftContract,
            id,
            tokenId,
            payable(msg.sender),
            payable(msg.sender),
            payable(address(0)),
            owner,
            price,
            royalty,
            false,
            payable(address(0)),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        //Creatore-seller-owner
        emit NftMarketItemCreated(
            nftContract,
            id,
            tokenId,
            msg.sender,
            msg.sender,
            address(0),
            owner,
            price,
            royalty,
            false,
            address(0),
            address(0),
            price,
            false
        );
    }

    //=>Update Item =>We Dont Use This

    function updateMarketItem(
        address nftContract,
        uint256 id,
        uint256 tokenId
    ) public payable onlyProductSeller(id) {
        NftMarketItem storage item = idForMarketItem[id];
        uint256 newPrice = item.oldPrice;
        item.price = newPrice;
        item.sold = false;
        address newOwner = item.oldOwner;
        item.owner = payable(newOwner);
        address newSeller = item.oldSeller;
        item.seller = payable(newSeller);
        NFT tokenContract = NFT(nftContract);
        tokenContract.transferToken(msg.sender, address(this), tokenId);
        emit ProductUpdated(id, newPrice, false, newOwner, newSeller);
    }

    function sendRoyaltiesToCreator(uint256 nftItemId)
        public
        payable
        nonReentrant
    {
        idForMarketItem[nftItemId].creator.transfer(msg.value);
    }
    function sendAdimCommissionToAdmin(uint256 nftItemId)
        public
        payable
        nonReentrant
    {
        idForMarketItem[nftItemId].admin.transfer(msg.value);
    }

    //Buy Item
    function createMarketForSale(address nftContract, uint256 nftItemId)
        public
        payable
        nonReentrant
    {
        // uint256 price = idForMarketItem[nftItemId].price;
        uint256 tokenId = idForMarketItem[nftItemId].tokenId;

        // require(msg.value == price, "should buy the price of item");
        idForMarketItem[nftItemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); //buy
        idForMarketItem[nftItemId].owner = payable(msg.sender);
        idForMarketItem[nftItemId].sold = true;
        idForMarketItem[nftItemId].isResell = true;
        itemsSold.increment();
        // payable(owner).transfer(msg.value);
        emit ProductSold(
            idForMarketItem[nftItemId].id,
            idForMarketItem[nftItemId].nftContract,
            idForMarketItem[nftItemId].tokenId,
            idForMarketItem[nftItemId].creator,
            idForMarketItem[nftItemId].seller,
            payable(msg.sender),
            idForMarketItem[nftItemId].price,
            address(0),
            address(0),
            0,
            idForMarketItem[nftItemId].isResell
        );
    }

    function cancelResellWitholdPrice(address nftContract, uint256 nftItemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idForMarketItem[nftItemId].oldPrice;
        uint256 tokenId = idForMarketItem[nftItemId].tokenId;
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); //buy
        idForMarketItem[nftItemId].owner = payable(msg.sender);
        idForMarketItem[nftItemId].price = price;
        idForMarketItem[nftItemId].seller = payable(
            idForMarketItem[nftItemId].oldSeller
        );
        idForMarketItem[nftItemId].sold = true;
        itemsSold.increment();

        emit ProductSold(
            idForMarketItem[nftItemId].id,
            idForMarketItem[nftItemId].nftContract,
            idForMarketItem[nftItemId].tokenId,
            idForMarketItem[nftItemId].creator,
            idForMarketItem[nftItemId].seller,
            payable(msg.sender),
            idForMarketItem[nftItemId].price,
            address(0),
            address(0),
            0,
            idForMarketItem[nftItemId].isResell
        );
    }

    //REsell
    function putItemToResell(
        address nftContract,
        uint256 itemid,
        uint256 newPrice
    ) public payable nonReentrant onlyItemOwner(itemid) {
        uint256 tokenId = idForMarketItem[itemid].tokenId;
        require(newPrice > 0, "Price must be at least 1 wei");

        NFT tokenContract = NFT(nftContract);

        tokenContract.transferToken(msg.sender, address(this), tokenId);

        address payable oldOwner = idForMarketItem[itemid].owner;
        address payable oldSeller = idForMarketItem[itemid].seller;

        uint256 oldPrice = idForMarketItem[itemid].price;

        idForMarketItem[itemid].owner = payable(address(0));
        idForMarketItem[itemid].seller = oldOwner;
        idForMarketItem[itemid].price = newPrice;
        idForMarketItem[itemid].sold = false;
        //Start to save old value
        idForMarketItem[itemid].oldOwner = oldOwner;
        idForMarketItem[itemid].oldSeller = oldSeller;
        idForMarketItem[itemid].oldPrice = oldPrice;

        itemsSold.decrement();

        emit ProductListed(itemid);
    }

    ///FETCH SINGLE NFT
    function fetchSingleItem(uint256 id)
        public
        view
        returns (NftMarketItem memory)
    {
        return idForMarketItem[id];
    }

    /////////////////////////GETS///////

    //My items => sold,not sold,buy

    function getMyItemCreated() public view returns (NftMarketItem[] memory) {
        uint256 totalItemCount = itemId.current();
        uint256 myItemCount = 0; //10
        uint256 myCurrentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idForMarketItem[i + 1].creator == msg.sender) {
                myItemCount += 1;
            }
        }
        NftMarketItem[] memory nftItems = new NftMarketItem[](myItemCount); //list[3]
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idForMarketItem[i + 1].creator == msg.sender) {
                //[1,2,3,4,5]
                uint256 currentId = i + 1;
                NftMarketItem storage currentItem = idForMarketItem[currentId];
                nftItems[myCurrentIndex] = currentItem;
                myCurrentIndex += 1;
            }
        }

        return nftItems;
    }

    function getMyItemsolod() public view returns (NftMarketItem[] memory) {
        uint256 totalItemCount = itemId.current();
        uint256 myItemCount = 0; //10
        uint256 myCurrentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idForMarketItem[i + 1].seller == msg.sender) {
                myItemCount += 1;
            }
        }
        NftMarketItem[] memory nftItems = new NftMarketItem[](myItemCount); //list[3]
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idForMarketItem[i + 1].seller == msg.sender) {
                //[1,2,3,4,5]
                uint256 currentId = i + 1;
                NftMarketItem storage currentItem = idForMarketItem[currentId];
                nftItems[myCurrentIndex] = currentItem;
                myCurrentIndex += 1;
            }
        }

        return nftItems;
    }

    //Create My purchased Nft Item

    function getMyNFTPurchased() public view returns (NftMarketItem[] memory) {
        uint256 totalItemCount = itemId.current();
        uint256 myItemCount = 0; //10
        uint256 myCurrentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idForMarketItem[i + 1].owner == msg.sender) {
                myItemCount += 1;
            }
        }

        NftMarketItem[] memory nftItems = new NftMarketItem[](myItemCount); //list[3]
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idForMarketItem[i + 1].owner == msg.sender) {
                //[1,2,3,4,5]
                uint256 currentId = i + 1;
                NftMarketItem storage currentItem = idForMarketItem[currentId];
                nftItems[myCurrentIndex] = currentItem;
                myCurrentIndex += 1;
            }
        }

        return nftItems;
    }

    //Fetch  all unsold nft items
    function getAllUnsoldItems() public view returns (NftMarketItem[] memory) {
        uint256 totalItemCount = itemId.current();
        uint256 myItemCount = itemId.current() - itemsSold.current();
        uint256 myCurrentIndex = 0;

        NftMarketItem[] memory nftItems = new NftMarketItem[](myItemCount); //list[3]
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idForMarketItem[i + 1].owner == address(0)) {
                //[1,2,3,4,5]
                uint256 currentId = i + 1;
                NftMarketItem storage currentItem = idForMarketItem[currentId];
                nftItems[myCurrentIndex] = currentItem;
                myCurrentIndex += 1;
            }
        }

        return nftItems;
    }

    //Get resell my items

    function getMyResellItems() public view returns (NftMarketItem[] memory) {
        uint256 totalItemCount = itemId.current();
        uint256 myItemCount = 0; //10
        uint256 myCurrentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                (idForMarketItem[i + 1].seller == msg.sender) &&
                (idForMarketItem[i + 1].sold == false)
            ) {
                myItemCount += 1;
            }
        }

        NftMarketItem[] memory nftItems = new NftMarketItem[](myItemCount); //list[3]
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                (idForMarketItem[i + 1].seller == msg.sender) &&
                (idForMarketItem[i + 1].sold == false)
            ) {
                //[1,2,3,4,5]
                uint256 currentId = i + 1;
                NftMarketItem storage currentItem = idForMarketItem[currentId];
                nftItems[myCurrentIndex] = currentItem;
                myCurrentIndex += 1;
            }
        }
        return nftItems;
    }
}
