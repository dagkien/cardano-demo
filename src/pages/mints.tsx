
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
const Mint: NextPage = () => {
    const { connected, wallet } = useWallet();
    const [assets, setAssets] = useState<null | any>(null);
    const [address, setAddress] = useState("");
    const [mint, setMint] = useState(true)

    const handleChange = (e: any) => {
        const token = Number(e.target.value)
        if (token >= 0) {
            setMint(true)
        } else {
            setMint(false)
        }
    }
    const onMint = () => {
        alert('Minting...')
    }

    const onBurn = () => {
        alert('Burning...')
    }
    useEffect(() => {
        const getAddress = async () => {
            if (!connected) return
            const addressWallet = await wallet?.getChangeAddress() as string;
            setAddress(addressWallet);
        }
        getAddress()
    }, [connected])
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
            <CardanoWallet label="Connect to wallet" />
            {connected && <div style={{ padding: "20px", border: "1px solid black", marginTop: "50px", borderRadius: "20px" }}>{address}</div>}
            {connected && <h2 style={{ paddingTop: "120px"}}>Demo Mint/Burn Token</h2>}
            {connected && <div>
                <label style={{ fontSize: "1.3rem"}}>{mint ? 'Mint Token' : 'Burn Token'}</label>
                <input type="number" onChange={handleChange} placeholder="token" style={{ padding: "10px 20px", borderRadius: "4px", margin: "25px 10px", height: "55px", width: "300px" }} />
                {mint ? <button style={{ padding: "10px 20px", borderRadius: "4px", height: "55px", background: "#1a4196", color: "white" }} onClick={onMint}>Mint</button> : <button style={{ padding: "10px 20px", borderRadius: "4px", height: "55px", background: "#b31a0c", color: "white" }} onClick={onBurn}>Burn</button>}
            </div>}
        </div>
    );
};

export default Mint;
