const wvs = 10 ** 8;

describe('BeginAuction Testing', async function () {

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

    describe('Basic Working', async function () {

        it("Begin auction by a seller", async function () {
            var NFT_Asset = issue({ name: "NFT_Item", description: "", quantity: 1, decimals: 0, reissuable: false }, accounts.sellerOne);
            await broadcast(NFT_Asset);
            await waitForTx(NFT_Asset.id);
            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 100000 },
                        { type: "integer", value: 10 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_Asset.id }],
                fee: 500000

            }, accounts.sellerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        })

        it("Block auction greater than maximum duration", async function () {
            max_duration = 1440;
            var NFT_Asset = issue({ name: "NFT_Item", description: "", quantity: 1, decimals: 0, reissuable: false }, accounts.sellerOne);
            await broadcast(NFT_Asset);
            await waitForTx(NFT_Asset.id);
            let ts = invokeScript({
                dApp: address(accounts.dappAddress),
                call: {
                    function: "beginAuction",
                    args: [
                        { type: "integer", value: 100000 },
                        { type: "integer", value: 1441 }
                    ]
                },
                payment: [{ amount: 1, assetId: NFT_Asset.id }],
                fee: 500000

            }, accounts.sellerOne);
            let tx = await broadcast(ts);
            await waitForTx(tx.id);
        })

    });


});