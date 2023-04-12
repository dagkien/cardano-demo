
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
        script: "590b23590b2001000033232323322332232323232323232323232323232332232323232323232323232323233223232222323253353232323232533553353235001222222222222533533355301d12001335021225335002210031001502825335333573466e3c04c0040e40e04d40a8004540a4010840e440dcd400c8800854cd4c8c8ccd54c04848004d405540508d400488ccd54c05448004d4061405c8d400488ccd40048cc0c52000001223303200200123303100148000004cd54c044480048d400488cd540cc008ccd40048cd54c054480048d400488cd540dc008d5405c00400488ccd5540480600080048cd54c054480048d400488cd540dc008d54058004004ccd55403404c008004cd40b4cd540bd400ccd40b4cd540bc0c12080a8d6b907502e502e32323253353001003213350303355032003001503115030320013550322253350011501f22135002225335330190020071350240011300600350035001102b1333573466e20c8c8c8c00400cc8004d540c888cd400520002235002225335333573466e3c00801c0cc0c84c0c40044c01800d400d4005200002b02a102a102b1335738921116d697373696e67207369676e61747572650002a135350022200222222222222200813500122333350012326320273357389201024c680002720012326320273357389201024c68000272326320273357389201024c68000273333573466e1cd55cea80224000466442466002006004646464646464646464646464646666ae68cdc39aab9d500c480008cccccccccccc88888888888848cccccccccccc00403403002c02802402001c01801401000c008cd4084088d5d0a80619a8108111aba1500b33502102335742a014666aa04aeb94090d5d0a804999aa812bae502435742a01066a0420586ae85401cccd540940b5d69aba150063232323333573466e1cd55cea801240004664424660020060046464646666ae68cdc39aab9d5002480008cc8848cc00400c008cd40ddd69aba150023038357426ae8940088c98c80e8cd5ce01d81d01c09aab9e5001137540026ae854008c8c8c8cccd5cd19b8735573aa004900011991091980080180119a81bbad35742a00460706ae84d5d1280111931901d19ab9c03b03a038135573ca00226ea8004d5d09aba2500223263203633573806e06c06826aae7940044dd50009aba1500533502175c6ae854010ccd540940a48004d5d0a801999aa812bae200135742a00460566ae84d5d1280111931901919ab9c033032030135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d55cf280089baa00135742a00860366ae84d5d1280211931901219ab9c0250240223333573466e1cd55ce9baa00548000808c8c98c808ccd5ce0120118109bae005102113263202133573892010350543500021135573ca00226ea8004444888ccd54c010480054090cd54c01c480048d400488cd540a4008d54024004ccd54c0104800488d4008894cd4ccd54c03048004c8cd404488ccd400c88008008004d40048800448cc004894cd400840a8400409c8d400488cc028008014018400c4cd40a001000d4094004cd54c01c480048d400488c8cd540a800cc004014c8004d540ac894cd40044d5402800c884d4008894cd4cc03000802044888cc0080280104c01800c008c8004d5409088448894cd40044008884cc014008ccd54c01c480040140100044484888c00c0104484888c004010c8004d540848844894cd400454088884cd408cc010008cd54c01848004010004c8004d5408088448894cd40044d400c88004884ccd401488008c010008ccd54c01c4800401401000488ccd5cd19b8f00200101c01b112330012253350021001101b01a1233500222333500322002002001350012200112212330010030021232230023758002640026aa038446666aae7c004940708cd406cc010d5d080118019aba2002014232323333573466e1cd55cea8012400046644246600200600460186ae854008c014d5d09aba2500223263201433573802a02802426aae7940044dd50009191919191999ab9a3370e6aae75401120002333322221233330010050040030023232323333573466e1cd55cea80124000466442466002006004602a6ae854008cd4034050d5d09aba2500223263201933573803403202e26aae7940044dd50009aba150043335500875ca00e6ae85400cc8c8c8cccd5cd19b875001480108c84888c008010d5d09aab9e500323333573466e1d4009200223212223001004375c6ae84d55cf280211999ab9a3370ea00690001091100191931900d99ab9c01c01b019018017135573aa00226ea8004d5d0a80119a804bae357426ae8940088c98c8054cd5ce00b00a80989aba25001135744a00226aae7940044dd5000899aa800bae75a224464460046eac004c8004d5406488c8cccd55cf8011280d119a80c99aa80d98031aab9d5002300535573ca00460086ae8800c0484d5d080089119191999ab9a3370ea002900011a80398029aba135573ca00646666ae68cdc3a801240044a00e464c6402466ae7004c04804003c4d55cea80089baa0011212230020031122001232323333573466e1d400520062321222230040053007357426aae79400c8cccd5cd19b875002480108c848888c008014c024d5d09aab9e500423333573466e1d400d20022321222230010053007357426aae7940148cccd5cd19b875004480008c848888c00c014dd71aba135573ca00c464c6402066ae7004404003803403002c4d55cea80089baa001232323333573466e1cd55cea80124000466442466002006004600a6ae854008dd69aba135744a004464c6401866ae700340300284d55cf280089baa0012323333573466e1cd55cea800a400046eb8d5d09aab9e500223263200a33573801601401026ea80048c8c8c8c8c8cccd5cd19b8750014803084888888800c8cccd5cd19b875002480288488888880108cccd5cd19b875003480208cc8848888888cc004024020dd71aba15005375a6ae84d5d1280291999ab9a3370ea00890031199109111111198010048041bae35742a00e6eb8d5d09aba2500723333573466e1d40152004233221222222233006009008300c35742a0126eb8d5d09aba2500923333573466e1d40192002232122222223007008300d357426aae79402c8cccd5cd19b875007480008c848888888c014020c038d5d09aab9e500c23263201333573802802602202001e01c01a01801626aae7540104d55cf280189aab9e5002135573ca00226ea80048c8c8c8c8cccd5cd19b875001480088ccc888488ccc00401401000cdd69aba15004375a6ae85400cdd69aba135744a00646666ae68cdc3a80124000464244600400660106ae84d55cf280311931900619ab9c00d00c00a009135573aa00626ae8940044d55cf280089baa001232323333573466e1d400520022321223001003375c6ae84d55cf280191999ab9a3370ea004900011909118010019bae357426aae7940108c98c8024cd5ce00500480380309aab9d50011375400224464646666ae68cdc3a800a40084244400246666ae68cdc3a8012400446424446006008600c6ae84d55cf280211999ab9a3370ea00690001091100111931900519ab9c00b00a008007006135573aa00226ea80048c8cccd5cd19b8750014800880288cccd5cd19b8750024800080288c98c8018cd5ce00380300200189aab9d37540029309000a481035054310022333573466e1c008004014010c8004d5401c88cd400520002235002225335333573466e3c00803002001c40044c01800c4880084880044488008488488cc00401000c448848cc00400c00922109544f4b55205445535400112323001001223300330020020014c11e581c904f6bca5a78ac622ca35f10ea325d179be2b6e437f0dfb7b46b160f0001"
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
            .addSignerKey(pkh)
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
