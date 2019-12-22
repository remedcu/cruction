const wvs = 10 ** 8;

describe('Winner withdraw Testing', async function () {

    before(async function () {
        await setupAccounts(
            {
                buyerOne: 10 * wvs,
                buyerTwo: 10 * wvs,
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
            var NFT_Asset = issue({ name: "NFT_Item", description: "", quantity: 1, decimals: 0, reissuable: false }, accounts.buyerOne);
            await broadcast(NFT_Asset);
            await waitForTx(NFT_Asset.id);
            let NFT_AssetId = NFT_Asset.id;

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
            let auctionId = await accountDataByKey(tx.id, address(accounts.dappAddress));

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

        });

        it("Winner withdraw", async function ()  {

            //since auction duration is 1 min(6000ms)
            this.timeout("6001")


            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"winnerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.buyerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        });

        it("Winner withdraw before auction ends", async function ()  {

            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"winnerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.buyerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        });

        it("Unauthorised access", async function ()  {

            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"winnerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.buyerTwo);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        });

        it("Invalid auction Id", async function ()  {
            auctionId = "foofoofooofoofoo"
            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"winnerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.buyerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        });

        it("Withdraw amount already withrawn", async function ()  {

            //since auction duration is 1 min(6000ms)
            this.timeout("6001")


            let ts1 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"winnerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.buyerOne);
            let tx1 = await broadcast(ts1);
            await waitForTx(tx1.id);

            let ts2 = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"winnerWithdraw",
                        args:[
                            {type:"string",  value: auctionId }
                        ]
                    },
                    payment:[],
                    fee:500000

            },accounts.buyerOne);
            let tx2 = await broadcast(ts2);
            await waitForTx(tx2.id);
        });
        
    });


});
