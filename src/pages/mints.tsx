
import { Blockfrost, Data, fromText, getAddressDetails, Lucid, MintingPolicy, PolicyId, Unit, WalletApi } from "lucid-cardano"; // NPM

import { NextPage } from "next";
import { useEffect, useState } from "react";

let lucid: Lucid | null = null

const Mint: NextPage = () => {
    const [address, setAddress] = useState('');
    const [connected, setConnected] = useState(false)
    const [mint, setMint] = useState(true)
    const [tokens, setTokens] = useState<number>(0)
    const [tx, setTx] = useState<string>('')
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>, value: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_BLOCKFROST_URL || ''
        const key = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
        const l = await Lucid.new(new Blockfrost(baseUrl, key), "Preprod")
        const wallet = await window.cardano[value]?.enable() as WalletApi
        if (wallet) {
            setConnected(true)
            l.selectWallet(wallet)
            const addr = await l.wallet.address()
            setAddress(addr)
            lucid = l
        }
    }
    const freePolicy: MintingPolicy = {
        type: "PlutusV2",
        script: "5830582e010000323222320053333573466e1cd55ce9baa0024800080148c98c8014cd5ce249035054310000500349848005"
    };

    const handleChange = (e: any) => {
        const token = Number(e.target.value)
        if (token > 0) {
            setMint(true)
        } else {
            setMint(false)
        }
        setTokens(token)
    }
    const onMint = async () => {
        if (!lucid) return
        if (Number(tokens) === 0) {
            alert("Tokens cannot equal 0. Please mint more / burn tokens")
            return
        }
        const pkh: string = getAddressDetails(address).paymentCredential?.hash || "";
        console.log("own pubkey hash: " + pkh);

        const policyId: PolicyId = lucid.utils.mintingPolicyToId(freePolicy);
        console.log("minting policy: " + policyId);

        const unit: Unit = policyId + fromText("TOKU TEST");

        const amount: bigint = BigInt(+tokens)

        const tx = await lucid
            .newTx()
            .mintAssets({[unit]: amount}, Data.void())
            .attachMintingPolicy(freePolicy)
            .complete();
        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit()
        if (txHash) {
            console.log("tid: " + txHash)
            setTokens(0)
            setTx(txHash)
        }
    }
    useEffect(() => {
        document.title = "Mint Tokens"
    }, [])
    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                alignItems: "center",
                margin: "50px",
            }}
        >
            {!connected ? <div style={{ marginTop: "50px", display: "flex", justifyContent: "center", justifyItems: "center"}}>
                <button onClick={e => handleClick(e, 'flint')} style={{ background: "#F05503",padding: "20px", margin: "20px", border: "1px solid black", borderRadius: "10px",  cursor: "pointer", width: "200px", height: "90px" }}>Flint</button>
                <button onClick={e => handleClick(e, 'nami')} style={{ padding: "20px", margin: "20px", border: "1px solid black", borderRadius: "10px", cursor: "pointer", width: "200px", height: "90px" }}>
                <img style={{ maxWidth: "40px" }} src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0ODYuMTcgNDk5Ljg2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzM0OWVhMzt9PC9zdHlsZT48L2RlZnM+PGcgaWQ9IkxheWVyXzIiIGRhdGEtbmFtZT0iTGF5ZXIgMiI+PGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj48cGF0aCBpZD0icGF0aDE2IiBjbGFzcz0iY2xzLTEiIGQ9Ik03My44Nyw1Mi4xNSw2Mi4xMSw0MC4wN0EyMy45MywyMy45MywwLDAsMSw0MS45LDYxLjg3TDU0LDczLjA5LDQ4Ni4xNyw0NzZaTTEwMi40LDE2OC45M1Y0MDkuNDdhMjMuNzYsMjMuNzYsMCwwLDEsMzIuMTMtMi4xNFYyNDUuOTRMMzk1LDQ5OS44Nmg0NC44N1ptMzAzLjM2LTU1LjU4YTIzLjg0LDIzLjg0LDAsMCwxLTE2LjY0LTYuNjh2MTYyLjhMMTMzLjQ2LDE1LjU3SDg0TDQyMS4yOCwzNDUuNzlWMTA3LjZBMjMuNzIsMjMuNzIsMCwwLDEsNDA1Ljc2LDExMy4zNVoiLz48cGF0aCBpZD0icGF0aDE4IiBjbGFzcz0iY2xzLTEiIGQ9Ik0zOC4yNywwQTM4LjI1LDM4LjI1LDAsMSwwLDc2LjQ5LDM4LjI3djBBMzguMjgsMzguMjgsMCwwLDAsMzguMjcsMFpNNDEuOSw2MS44YTIyLDIyLDAsMCwxLTMuNjMuMjhBMjMuOTQsMjMuOTQsMCwxLDEsNjIuMTgsMzguMTNWNDBBMjMuOTQsMjMuOTQsMCwwLDEsNDEuOSw2MS44WiIvPjxwYXRoIGlkPSJwYXRoMjAiIGNsYXNzPSJjbHMtMSIgZD0iTTQwNS43Niw1MS4yYTM4LjI0LDM4LjI0LDAsMCwwLDAsNzYuNDYsMzcuNTcsMzcuNTcsMCwwLDAsMTUuNTItMy4zQTM4LjIyLDM4LjIyLDAsMCwwLDQwNS43Niw1MS4yWm0xNS41Miw1Ni40YTIzLjkxLDIzLjkxLDAsMSwxLDguMzktMTguMThBMjMuOTEsMjMuOTEsMCwwLDEsNDIxLjI4LDEwNy42WiIvPjxwYXRoIGlkPSJwYXRoMjIiIGNsYXNzPSJjbHMtMSIgZD0iTTEzNC41OCwzOTAuODFBMzguMjUsMzguMjUsMCwxLDAsMTU3LjkyLDQyNmEzOC4yNCwzOC4yNCwwLDAsMC0yMy4zNC0zNS4yMlptLTE1LDU5LjEzQTIzLjkxLDIzLjkxLDAsMSwxLDE0My41NCw0MjZhMjMuOSwyMy45LDAsMCwxLTIzLjk0LDIzLjkxWiIvPjwvZz48L2c+PC9zdmc+" />

                </button>
                <button onClick={e => handleClick(e, 'eternl')} style={{ padding: "20px", margin: "20px", border: "1px solid black", borderRadius: "10px", cursor: "pointer", width: "200px", height: "90px" }}>
                <img src="https://eternl.io/images/img-logo-small.png" alt="" style={{height: "36px"}} />
                </button>
            </div> : null}
            
            {connected && <div style={{ padding: "20px", border: "1px solid black", marginTop: "50px", borderRadius: "20px" }}>{address}</div>}
            {connected && <h2 style={{ paddingTop: "120px"}}>Demo Mint/Burn Token</h2>}
            {connected && <div>
                <label style={{ fontSize: "1.3rem"}}>{mint ? 'Mint Tokens' : 'Burn Tokens'}</label>
                <input type="text" onChange={handleChange} placeholder="mint tokens" style={{ padding: "10px 20px", borderRadius: "4px", margin: "25px 10px", height: "55px", width: "300px" }} />
                {mint ? <button style={{ border: "none", cursor: "pointer", padding: "10px 20px", borderRadius: "4px", height: "55px", background: "#349EA3", color: "white" }} onClick={onMint}>Mint</button> : <button style={{ cursor: "pointer", border: "none", padding: "10px 20px", borderRadius: "4px", height: "55px", background: "#F05503", color: "white" }} onClick={onMint}>Burn</button>}
            </div>}
            {tx  && <div><a href={`https://preprod.cexplorer.io/tx/${tx}`} target="_blank">{`https://preprod.cexplorer.io/tx/${tx}`}</a></div>}
        </div>
    );
};

export default Mint
