const wvs = 10 ** 8;
const waitTime = 15; // This is in seconds, change it according to block time.

let NFT_AssetId = "";
let auctionId = "";

function wait(seconds) {
    return new Promise((resolve, reject) => setTimeout(resolve, seconds*1000));
  } 

describe('Owner withdraw Testing', async function () {

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
            auctionId = await accountDataByKey(tx1.id, address(accounts.dappAddress));
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

        });

        it("Owner withdraw", async function ()  {

            console.log("Waiting for auction to complete");
            //since auction duration is 1 min(60 sec)
            await wait(waitTime);

            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        });

        it("Prevent owner withdraw before auction ends", async function ()  {

            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            await expect(broadcast(ts)).rejectedWith("Error while executing account-script: Auction is still running");
        });

        it("Prevent unauthorised access", async function ()  {

            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerTwo);
            await expect(broadcast(ts)).rejectedWith("Error while executing account-script: Access Denied");
        });

        it("Prevent invalid auction Id", async function ()  {
            auctionId = "foofoofooofoofoo"
            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            await expect(broadcast(ts)).rejectedWith("Error while executing account-script: Invalid auction Id");
        });

        it("Prevent withdraw amount already withrawn", async function ()  {

            console.log("Waiting for auction to complete");
            //since auction duration is 1 min(60 sec)
            await wait(waitTime);

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            await expect(broadcast(ts2)).rejectedWith("Error while executing account-script: The bid amount is already transfered");
        });
        
    });

    describe('Auction without any bidders', async function () {
        beforeEach(async function () {    
            var NFT_Asset = issue({ name: "NFT_Item", description: "", quantity: 1, decimals: 0, reissuable: false }, accounts.sellerOne);
            await broadcast(NFT_Asset);
            await waitForTx(NFT_Asset.id);
            NFT_AssetId = NFT_Asset.id;

            let ts = invokeScript({
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
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
            auctionId = await accountDataByKey(tx.id, address(accounts.dappAddress));
            auctionId = auctionId.value;

        });

        it("Withdraw item back when no bidder", async function ()  {

            console.log("Waiting for auction to complete");
            //since auction duration is 1 min(60 sec)
            await wait(waitTime);

            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        });

        it("Prevent withdrawal of item already withdrawn when no bidder", async function ()  {

            console.log("Waiting for auction to complete");
            //since auction duration is 1 min(60 sec)
            await wait(waitTime);

            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"ownerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.sellerOne);
            await expect(broadcast(ts2)).rejectedWith("Error while executing account-script: Item already withdrawn");

        });

    });
    
});