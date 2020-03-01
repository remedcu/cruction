const wvs = 10 ** 8;
const waitTime = 15; // This is in seconds, change it according to block time.

let NFT_AssetId = ""

function wait(seconds) {
    return new Promise((resolve, reject) => setTimeout(resolve, seconds*1000));
  }  

describe('Bid Testing', async function () {

    before(async function () {
        await setupAccounts(
            {
                sellerOne: 10 * wvs,
                sellerTwo: 10 * wvs,
                buyerOne: 10 * wvs,
                buyerTwo: 10 * wvs,
                dappAddress: 10 * wvs
            });

        const script = compile(file('cruction.ride'));
        const ssTx = setScript({ script }, accounts.dappAddress);
        await broadcast(ssTx);
        await waitForTx(ssTx.id);
        console.log('Script has been set');

    });

    describe('Basic Working', async function() {

        beforeEach(async function () {    
            var NFT_Asset = issue({ name: "NFT_Item", description: "", quantity: 1, decimals: 0, reissuable: false }, accounts.sellerOne);
            await broadcast(NFT_Asset);
            await waitForTx(NFT_Asset.id);
            NFT_AssetId = NFT_Asset.id;
        });

        
        it("Placing a bid by buyer", async function ()  {

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 100000 },
                        { type: "integer", value: 10 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_AssetId }],
                fee: 500000

            }, accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);
            let auctionId = await accountDataByKey(tx1.id, address(accounts.dappAddress));
            auctionId = auctionId.value;

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:100000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            let tx2 = await broadcast(ts2);
            await waitForTx(tx2.id);
        })


        it("Prevent placing a bid using invalid auction ID", async function ()  {

            let auctionId = "foofoffoofofofoffofofoffoo"

            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:100000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            await expect(broadcast(ts)).rejectedWith("Error while executing account-script: Invalid auction Id");
        })

        it("Prevent placing a bid after auction", async function ()  {

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 100000 },
                        { type: "integer", value: 1 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_AssetId }],
                fee: 500000

            }, accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);
            let auctionId = await accountDataByKey(tx1.id, address(accounts.dappAddress));
            auctionId = auctionId.value;

            console.log("Waiting for auction to complete");
            //since auction duration is 1 min(60 sec)
            await wait(waitTime);
            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:100000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            await expect(broadcast(ts2)).rejectedWith("Error while executing account-script: Auction Completed");
        })

        it("Prevent placing a bid lesser than min price", async function ()  {

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 10000000 },
                        { type: "integer", value: 10 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_AssetId }],
                fee: 500000

            }, accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);
            let auctionId = await accountDataByKey(tx1.id, address(accounts.dappAddress));
            auctionId = auctionId.value;

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:10000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            await expect(broadcast(ts2)).rejectedWith("Error while executing account-script: Bid must be more then 10000000");
        })

        it("Prevent placing a bid lesser than highet bid amount", async function ()  {

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 100000 },
                        { type: "integer", value: 10 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_AssetId }],
                fee: 500000

            }, accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);
            let auctionId = await accountDataByKey(tx1.id, address(accounts.dappAddress));
            auctionId = auctionId.value;

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:200000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            let tx2 = await broadcast(ts2);
            await waitForTx(tx2.id);

            let ts3 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:100000000}],
                    fee: 500000
    
            }, accounts.buyerTwo);
            await expect(broadcast(ts3)).rejectedWith("Error while executing account-script: Bid must be more then 200000000");
        })
        
        it("Placing a bid by already existing bidder ", async function ()  {

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 100000 },
                        { type: "integer", value: 10 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_AssetId }],
                fee: 500000

            }, accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);
            let auctionId = await accountDataByKey(tx1.id, address(accounts.dappAddress));
            auctionId = auctionId.value;

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:200000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            let tx2 = await broadcast(ts2);
            await waitForTx(tx2.id);

            let ts3 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:100000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            let tx3 = await broadcast(ts3);
            await waitForTx(tx3.id);
            let check = await accountDataByKey(auctionId + address(accounts.buyerOne)+"_frozenBalance", address(accounts.dappAddress));
            expect(check.value).to.equal(300000000);
        })

        it("Placing a bid higher than highest bidder ", async function ()  {

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 100000 },
                        { type: "integer", value: 10 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_AssetId }],
                fee: 500000

            }, accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);
            let auctionId = await accountDataByKey(tx1.id, address(accounts.dappAddress));
            auctionId = auctionId.value;

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:100000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            let tx2 = await broadcast(ts2);
            await waitForTx(tx2.id);

            let ts3 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"bid",
                        args:[
                            { type:"string",  value:auctionId }
                        ]
                    },
                    payment:[{amount:200000000}],
                    fee: 500000
    
            }, accounts.buyerTwo);
            let tx3 = await broadcast(ts3);
            await waitForTx(tx3.id);
        })

    
    });

});