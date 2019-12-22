const wvs = 10 ** 8;

describe('wallet test suite', async function () {

    this.timeout(100000);

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
    
    it("owner_Withdraw", async function ()  {
        let ts = invokeScript({
            dApp: address(accounts.wallet),
                call:{
                    function:"ownerWithdraw",
                    args:[
                        {type:"string",  value: "5DauCnK8L9KkWbEo3dHBmKAnVhVwebUnHA5UbRJWbcZn"}
                    ]
                },
                payment:[],
                fee:1000000

        },senderSeed)
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
        console.log(tx)
    })

});