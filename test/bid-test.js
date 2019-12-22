const wvs = 10 ** 8;

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
            let NFT_AssetId = NFT_Asset.id;
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


        it("Placing bid using invalid auction ID", async function ()  {

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
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        })

        it("Placing a bid after acution", async function ()  {

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

            //since auction duration is 1 min(6000ms)
            this.timeout("6001");

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

        it("Placing a bid lesser than min price", async function ()  {

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
            let tx2 = await broadcast(ts2);
            await waitForTx(tx2.id);
        })

        it("Placing a bid lesser than highet bid amount", async function ()  {

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
            let tx3 = await broadcast(ts3);
            await waitForTx(tx3.id);
        })
        
        it("Placing a bid by same user ", async function ()  {

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
                    payment:[{amount:100000000}],
                    fee: 500000
    
            }, accounts.buyerOne);
            let tx3 = await broadcast(ts3);
            await waitForTx(tx3.id);
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