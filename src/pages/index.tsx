import { AssetMetadata, ForgeScript, Mint, Transaction } from "@meshsdk/core";
import { CardanoWallet, MeshBadge, useWallet } from "@meshsdk/react";
import { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState("");
  const [transferTo, setTransferTo] = useState({ address: null, amount: null });

  async function getAssets() {
    if (connected) {
      setLoading(true);
      const _assets = await wallet.getAssets();
      setAssets(_assets);
      setLoading(false);
      const address_wallet = await wallet?.getChangeAddress();
      setAddress(address_wallet);
    }
  }
  async function SendADA() {
    const { address, amount } = transferTo;
    if (!address || !amount) {
      alert("Please enter Address and amount...");
      return;
    }
    if (amount < 1000000) {
      alert("Amount must be than or equal 1000000 lovelace");
      return;
    }
    const tx = new Transaction({ initiator: wallet }).sendLovelace(
      address,
      amount
    );
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
  }

  const handleChange = (e: any) => {
    setTransferTo({
      ...transferTo,
      [e.target.name]: e.target.value,
    });
  };

  // async function mintNFT() {
  //   const forgingScript = ForgeScript.withOneSignature(address);

  //   const tx = new Transaction({ initiator: wallet });

  //   const assetMetadata: AssetMetadata = {
  //     name: "Sky G",
  //     image: "https://skyg.tech/assets/images/logo.png",
  //     mediaType: "image/jpg",
  //     description: "Just a purple coin.",
  //     artist: "This NFT is minted by Mesh (https://meshjs.dev/).",
  //   };
  //   const asset: Mint = {
  //     assetName: assetMetadata.name,
  //     assetQuantity: "1",
  //     metadata: assetMetadata,
  //     label: "721",
  //     recipient:
  //       "addr_test1qpucdy7muswj0jrxfj9n72r73ul8hfrxd54lrk3advl4v4pedc3j93xrhm4vqngjkgw9cp6ggz24w75azp98fv9axzxqxcyvnw",
  //   };

  //   tx.mintAsset(forgingScript, asset);

  //   const unsignedTx = await tx.build();
  //   const signedTx = await wallet.signTx(unsignedTx);
  //   const txHash = await wallet.submitTx(signedTx);
  // }

  return (
    <>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "50px",
        }}
      >
        <MeshBadge dark={true} />
        {connected && address}
        <CardanoWallet />
        {connected && assets && (
          <>
            <h3>NFT Listing</h3>
            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
              }}
            >
              {assets?.map((item: any) => (
                <div
                  key={item?.fingerprint}
                  style={{
                    height: "200px",
                    width: "fit-content",
                    border: "1px solid white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "20px",
                    padding: "10px",
                  }}
                >
                  <div>NFT: {item?.assetName}</div>
                  <a
                    style={{ color: "greenyellow" }}
                    href={`https://preprod.cexplorer.io/asset/${item?.fingerprint}`}
                  >
                    {item?.fingerprint}
                  </a>
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <h3>Transfer TADA</h3>
                <div
                  style={{
                    border: "1px solid white",
                    padding: "20px",
                    display: "flex",
                    gap: "30px",
                    height: "85px",
                  }}
                >
                  <input
                    name="address"
                    placeholder="address"
                    onChange={handleChange}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      width: "260px",
                    }}
                  />
                  <input
                    name="amount"
                    placeholder="amount"
                    onChange={handleChange}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      width: "260px",
                    }}
                  />
                  <button
                    onClick={SendADA}
                    style={{ padding: "10px", borderRadius: "10px" }}
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>
            {/* <div>
              <button onClick={() => mintNFT()} style={{ padding: "20px" }}>
                Mint NFT
              </button>
            </div> */}
          </>
        )}
      </div>

      <button onClick={() => getAssets()} style={{ padding: "20px" }}>
        Get Assets
      </button>
    </>
  );
};

export default Home;
