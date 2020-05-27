// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

const Item = {
    SKU                  : 0,
    UPC                  : 1,
    OWNERID              : 2,
    ORIGINFARMERID       : 3,
    ORIGINFARMNAME       : 4,
    ORIGINFARMINFORMATION: 5,
    ORIGINFARMLATITUDE   : 6,
    ORIGINFARMLONGITUDE  : 7,
    PRODUCTID            : 2,
    PRODUCTNOTES         : 3,
    PRODUCTPRICE         : 4,
    ITEMSTATE            : 5,
    DISTRIBUTORID        : 6,
    RETAILERID           : 7,
    CONSUMERID           : 8,
}

const State =
{
    HARVESTED: 0,
    PROCESSED: 1,
    PACKED   : 2,
    FORSALE  : 3,
    SOLD     : 4,
    SHIPPED  : 5,
    RECEIVED : 6,
    PURCHASED: 7,
}

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku                     = 1
    var upc                     = 1
    const ownerID               = accounts[0]
    const originFarmerID        = accounts[1]
    const originFarmName        = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude    = "-38.239770"
    const originFarmLongitude   = "144.341490"
    var productID               = sku + upc
    const productNotes          = "Best beans for Espresso"
    const productPrice          = web3.toWei(1, "ether")
    var itemState               = 0
    const distributorID         = accounts[2]
    const retailerID            = accounts[3]
    const consumerID            = accounts[4]
    const emptyAddress          = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    const Role = 
    {
        FARMER     : accounts[1],
        DISTRIBUTOR: accounts[2],
        RETAILER   : accounts[3],
        CONSUMER   : accounts[4],
    }

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] "        , accounts[1])
    console.log("Distributor: accounts[2] "   , accounts[2])
    console.log("Retailer: accounts[3] "      , accounts[3])
    console.log("Consumer: accounts[4] "      , accounts[4])



    //const supplyChain = await SupplyChain.deployed()
    //supplyChain.addFarmer(accounts[1]);

    it("adding accounts to roles", async() => {
        const supplyChain = await SupplyChain.deployed()
        await supplyChain.addFarmer     (Role.FARMER     , {from: accounts[0]})
        await supplyChain.addDistributor(Role.DISTRIBUTOR, {from: accounts[0]})
        await supplyChain.addRetailer   (Role.RETAILER   , {from: accounts[0]})
        await supplyChain.addConsumer   (Role.CONSUMER   , {from: accounts[0]})

        var event = supplyChain.Harvested()
        await event.watch((err, res) => {
            eventEmitted = true
        })

    })

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Harvested()
        var mEvent = supplyChain.Harvested()
        await mEvent.watch((err, res) => {
            eventEmitted = true
        })

        
        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, {from: Role.FARMER})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[Item.SKU                  ], sku                  , 'Error: Invalid item SKU'                        )
        assert.equal(resultBufferOne[Item.UPC                  ], upc                  , 'Error: Invalid item UPC'                        )
        assert.equal(resultBufferOne[Item.OWNERID              ], originFarmerID       , 'Error: Missing or Invalid ownerID'              )
        assert.equal(resultBufferOne[Item.ORIGINFARMERID       ], originFarmerID       , 'Error: Missing or Invalid originFarmerID'       )
        assert.equal(resultBufferOne[Item.ORIGINFARMNAME       ], originFarmName       , 'Error: Missing or Invalid originFarmName'       )
        assert.equal(resultBufferOne[Item.ORIGINFARMINFORMATION], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[Item.ORIGINFARMLATITUDE   ], originFarmLatitude   , 'Error: Missing or Invalid originFarmLatitude'   )
        assert.equal(resultBufferOne[Item.ORIGINFARMLONGITUDE  ], originFarmLongitude  , 'Error: Missing or Invalid originFarmLongitude'  )
        assert.equal(resultBufferTwo[Item.ITEMSTATE            ], State.HARVESTED      , 'Error: Invalid item State'                      )
        assert.equal(eventEmitted                               , true                 , 'Invalid event emitted'                          )
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Processed()
        var event = supplyChain.Processed()
        await event.watch(function(err, res) {
            eventEmitted = true
        })

        // Mark an item as Processed by calling function processtItem()
        await supplyChain.processItem(upc, {from: Role.FARMER})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[Item.OWNERID  ], originFarmerID , 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferTwo[Item.ITEMSTATE], State.PROCESSED, 'Error: Invalid item State'        );
        assert.equal(eventEmitted                   , true           , 'Invalid event emitted'            );
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Packed()
        var mEvent = supplyChain.Packed()
        await mEvent.watch((err, res) => {
            eventEmitted = true
        })

        // Mark an item as Packed by calling function packItem()
        await supplyChain.packItem(upc, {from: Role.FARMER});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[Item.OWNERID  ], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[Item.ITEMSTATE], State.PACKED  , 'Error: Invalid item State'        )
        assert.equal(eventEmitted                   , true          , 'Invalid event emitted'            )
        
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Packed()
        var mEvent1 = supplyChain.ForSale()
        await mEvent1.watch((err, res) => {
            eventEmitted = true
        })

        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.sellItem(upc, productPrice, {from: Role.FARMER})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
        

        // Verify the result set
        assert.equal(resultBufferOne[Item.OWNERID  ], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[Item.ITEMSTATE], State.FORSALE , 'Error: Invalid item State'        )
        assert.equal(eventEmitted                   , true          , 'Invalid event emitted'            )
          
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
                
        // Watch the emitted event Sold()
        var mEvent2 = supplyChain.Sold()
        await mEvent2.watch((err, res) => {
            eventEmitted = true
        })

        let balanceFarmer      = await web3.eth.getBalance(Role.FARMER)
        let balanceDistributor = await web3.eth.getBalance(Role.DISTRIBUTOR)
        
        // Mark an item as Sold by calling function buyItem()
        await supplyChain.buyItem(upc, {from: Role.DISTRIBUTOR, value: 2*productPrice})
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
        
        let balanceFarmerNew = await web3.eth.getBalance(Role.FARMER)
        //console.log(`Balance before: ${balanceDistributor}; after: ${balanceFarmerNew}, price: ${productPrice}`);
        
        // Verify the result set
        assert.equal(resultBufferOne[Item.OWNERID      ], Role.DISTRIBUTOR , 'Error: Missing or Invalid ownerID'       )
        assert.equal(resultBufferTwo[Item.ITEMSTATE    ], State.SOLD       , 'Error: Invalid item State'               )
        assert.equal(resultBufferTwo[Item.DISTRIBUTORID], Role.DISTRIBUTOR , 'Error: Missing or Invalid distributorID' )

        assert.equal(parseInt(balanceFarmerNew,10), parseInt(balanceFarmer,10) + parseInt(productPrice,10) , 'Error: balance')
        
        assert.equal(eventEmitted                   , true            , 'Invalid event emitted'            )
        
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
                
        // Watch the emitted event Sold()
        var mEvent1 = supplyChain.Shipped()
        await mEvent1.watch((err, res) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.shipItem(upc, {from: Role.DISTRIBUTOR})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
        
        // Verify the result set
        assert.equal(resultBufferOne[Item.OWNERID  ], Role.DISTRIBUTOR, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[Item.ITEMSTATE], State.SHIPPED   , 'Error: Invalid item State'        )
        assert.equal(eventEmitted                   , true            , 'Invalid event emitted'            )
        
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
                    
        // Watch the emitted event Sold()
        var mEvent4 = supplyChain.Received()
        await mEvent4.watch((err, res) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.receiveItem(upc, {from: Role.RETAILER})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
        

        // Verify the result set
        assert.equal(resultBufferOne[Item.OWNERID  ], Role.RETAILER , 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[Item.ITEMSTATE], State.RECEIVED, 'Error: Invalid item State'        )
        assert.equal(eventEmitted                   , true          , 'Invalid event emitted'            )
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Purchased()
        var mEvent1 = supplyChain.Purchased()
        await mEvent1.watch((err, res) => {
        eventEmitted = true
        })

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.purchaseItem(upc, {from: Role.CONSUMER})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[Item.OWNERID  ], Role .CONSUMER , 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[Item.ITEMSTATE], State.PURCHASED, 'Error: Invalid item State'        )
        assert.equal(eventEmitted                   , true           , 'Invalid event emitted'            )
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        
        
        // Verify the result set:
        assert.equal(resultBufferOne[Item.SKU                  ], sku                  , 'Error: Invalid item SKU'                        )
        assert.equal(resultBufferOne[Item.UPC                  ], upc                  , 'Error: Invalid item UPC'                        )
        assert.equal(resultBufferOne[Item.OWNERID              ], Role.CONSUMER        , 'Error: Missing or Invalid ownerID'              )
        assert.equal(resultBufferOne[Item.ORIGINFARMERID       ], originFarmerID       , 'Error: Missing or Invalid originFarmerID'       )
        assert.equal(resultBufferOne[Item.ORIGINFARMNAME       ], originFarmName       , 'Error: Missing or Invalid originFarmName'       )
        assert.equal(resultBufferOne[Item.ORIGINFARMINFORMATION], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[Item.ORIGINFARMLATITUDE   ], originFarmLatitude   , 'Error: Missing or Invalid originFarmLatitude'   )
        assert.equal(resultBufferOne[Item.ORIGINFARMLONGITUDE  ], originFarmLongitude  , 'Error: Missing or Invalid originFarmLongitude'  )
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc)
    
        // Verify the result set:
        assert.equal(resultBuffer[Item.SKU          ], sku              , 'Error: Invalid item SKU'                        )
        assert.equal(resultBuffer[Item.UPC          ], upc              , 'Error: Invalid item UPC'                        )
        assert.equal(resultBuffer[Item.PRODUCTID    ], productID        , 'Error: Missing or Invalid ownerID'              )
        assert.equal(resultBuffer[Item.PRODUCTNOTES ], productNotes     , 'Error: Missing or Invalid originFarmerID'       )
        assert.equal(resultBuffer[Item.PRODUCTPRICE ], productPrice     , 'Error: Missing or Invalid originFarmName'       )
        assert.equal(resultBuffer[Item.ITEMSTATE    ], State.PURCHASED   , 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBuffer[Item.DISTRIBUTORID], Role.DISTRIBUTOR , 'Error: Missing or Invalid originFarmLatitude'   )
        assert.equal(resultBuffer[Item.RETAILERID   ], Role.RETAILER    , 'Error: Missing or Invalid originFarmLongitude'  )
        assert.equal(resultBuffer[Item.CONSUMERID   ], Role.CONSUMER    , '')
         
    })

});

