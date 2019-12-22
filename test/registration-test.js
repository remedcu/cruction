const wvs = 10 ** 8;

describe('Registration Testing', async function () {

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
        const ssTx = setScript({script}, accounts.dappAddress);
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        console.log('Script has been set')
    });

    describe('Basic Working', async function() {
        
        it("Register a Buyer", async function ()  {
            let buyerUsername = "BuyerABC";
            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"registration",
                        args:[
                            {
                                type:"string",  value: buyerUsername
                            }
                        ]
                    },
                    fee:500000    
            },accounts.buyerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
            expect(tx.call.args[0].value).to.equal(buyerUsername);
        })
    
        it("Register a Seller", async function ()  {
            let sellerUsername = "SellerABC";
            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                    call:{
                        function:"registration",
                        args:[
                            {
                                type:"string",  value: sellerUsername
                            }
                        ]
                    },
                    fee:500000    
            },accounts.sellerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
            let check = await accountDataByKey(address(accounts.sellerOne), address(accounts.dappAddress));
            expect(check.value).to.equal(sellerUsername);
        })
        
    });

    describe('Input Cases', async function () {

        it("Should not register a Buyer without arguments", async function () {
            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "registration",
                    args: []
                },
                fee: 500000
            }, accounts.buyer);
            await expect(broadcast(ts)).rejectedWith("Error while executing account-script: function 'registration takes 1 args but 0 were(was) given");
        })
       
    });
});