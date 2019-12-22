const wvs = 10 ** 8;

describe('Bid Testing', async function () {

    describe('Basic Working', async function() {

        before(async function () {
            await setupAccounts(
                {foofoofoofoofoofoofoofoofoofoofoo: 10 * wvs,
                     barbarbarbarbarbarbarbarbarbar: 2 * wvs,
                      wallet: 0.05 * wvs});
            const script = compile(file('cruction.ride'));
            const ssTx = setScript({script}, accounts.wallet);
            await broadcast(ssTx);
            await waitForTx(ssTx.id)
            console.log('Script has been set')
        });
        
        it("bidding", async function ()  {
            let ts = invokeScript({
                dApp: address(accounts.wallet),
                    call:{
                        function:"bid",
                        args:[
                            {type:"string",  value: "GDxqiQKP24pYosamDv26YJjZFxD1WaMToag6M1DG7uTA"}
                        ]
                    },
                    payment:[{amount:100000000}],
                    fee:1000000
    
            }, accounts.foofoofoofoofoofoofoofoofoofoofoo)
            let tx = await broadcast(ts)
            await waitForTx(tx.id)
            console.log(tx)
        })
    
    });

});