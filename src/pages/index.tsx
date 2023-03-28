import {
  KoiosProvider,
  Quantity,
  resolveDataHash,
  Transaction,
  Unit
} from "@meshsdk/core";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { keepRelevant } from '@meshsdk/core';
import {Data} from "@meshsdk/core/dist/common/types/Data";
import {script} from "@/config/contract";


const TADA_LOVELACE = 1000000
const SC_ADDRESS = 'addr_test1wq955cvne75hz2cal0q3wfmlqe5jv3w0vs7kaxkc0twef0gmhhqwg'


const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [lockedTADA, setLockedTADA] = useState<string>('');
  const [unlockTx, setUnlockTx] = useState<string>('');
  // const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState("");
  const [transferTo, setTransferTo] = useState({ address: null, amount: null });

  // async function getAssets() {
  //   if (connected) {
  //     setLoading(true);
  //     const _assets = await wallet.getAssets();
  //     setAssets(_assets);
  //     setLoading(false);
  //     const address_wallet = await wallet?.getChangeAddress();
  //     setAddress(address_wallet);
  //   }
  // }

  useEffect(() => {
    const getAddress = async () => {
      if (!connected) return
      const addressWallet = await wallet?.getChangeAddress() as string;
      setAddress(addressWallet);
    }
    getAddress()
  }, [connected])

  async function lockToken() {
    if (!address || !lockedTADA) {
      alert("Please enter amount to lock TADA ...");
      return;
    }
    if (+lockedTADA < 1) {
      alert("Lock TADA must be greater than or equal 1 TADA");
      return;
    }
    const koios = new KoiosProvider('preprod');
    const scUtxos = await koios.fetchAddressUTxOs(SC_ADDRESS)
    console.log(scUtxos)
    const utxos = await wallet.getUtxos();
    const costLovelace = `${+lockedTADA * TADA_LOVELACE}`
    const assetMap = new Map<Unit, Quantity>()
    assetMap.set(
      'lovelace',
      costLovelace
    );
    const selectedUtxos = keepRelevant(assetMap, utxos)
    console.log(selectedUtxos)
    const tx = new Transaction({ initiator: wallet })
    tx.setChangeAddress(address)
    tx.setTxInputs(selectedUtxos)
    tx.sendLovelace({
      address: SC_ADDRESS,
      datum: {
        value: resolveDataHash(100)
      },
      script: script
    }, costLovelace)
    const unsignedTx = await tx.build();
    // const unsignedTx ="84a3008182582087d104fe2964f84184037b09947d3c5358a88ac4ccef9b4c9753c0a6e6f3a8a0000182a300581d700b4a6193cfa9712b1dfbc117277f06692645cf643d6e9ad87add94bd011a0016e3600282005820748f2aaa7f4f9915c4f0489b3e8813f8de03239c067357eb3b7ce56033191d6ba2005839008caa580675ca4a9f45e36d3ae22ba2c110a8fd06dd61085e9e67e83e9457983da9c748d62ec255ba44f7d27df3134c9b4963a02106403ac4011b0000000253f26e1b021a00029285a0f5f6"
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    if (txHash) {
      setLockedTADA('')
      console.log(`TADA locked successfully!\nTX# ${txHash}`)
      alert(`TADA locked successfully!\n#${txHash}`)
    }
  }

  async function unlockToken() {

    const koios = new KoiosProvider('preprod');

    const utxos = await koios.fetchAddressUTxOs(SC_ADDRESS)
    const selectedUtxos = utxos.find(u => {
      return u.input?.txHash === unlockTx
    })
    if (!selectedUtxos) {
      alert("No matched transactions in smart contract !")
      return
    }
    const redeem: Data = { alternative: 0,
      fields: ['int', 100],
    };
    const redeemer = {
      data: redeem,
    };
    const tx = new Transaction({ initiator: wallet })
      .redeemValue({
        value: selectedUtxos,
        script,
        datum: redeem,
        redeemer: redeemer
      })
      .setChangeAddress(address)
      .setRequiredSigners([address]);
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    if (txHash) {
      setLockedTADA('')
      console.log(`TADA unlocked successfully!\nTX# ${txHash}`)
      alert(`TADA unlocked successfully!\n#${txHash}`)
    }
  }


  async function sendADA() {
    const { address, amount } = transferTo;
    if (!address || !amount) {
      alert("Please enter Address and amount...");
      return;
    }
    if (amount < 1) {
      alert("Amount must be greater than or equal 1 TADA");
      return;
    }
    const lovelace = amount * TADA_LOVELACE
    const tx = new Transaction({ initiator: wallet }).sendLovelace(
      address,
      `${lovelace}`
    );
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    if (txHash) {
      alert(`TADA sent successfully!\n#${txHash}`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferTo({
      ...transferTo,
      [e.target.name]: e.target.value,
    });
  };

  const handleLockChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLockedTADA(e.target.value)
  };

  const handleUnlockChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnlockTx(e.target.value)
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
        {connected && address}
        <CardanoWallet label="Connect to wallet"/>
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

            {/* <div>
              <button onClick={() => mintNFT()} style={{ padding: "20px" }}>
                Mint NFT
              </button>
            </div> */}
          </>
        )}
        {connected && (
        <>
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
                    placeholder="TADA amount"
                    onChange={handleChange}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      width: "260px",
                    }}
                  />
                  <button
                    onClick={sendADA}
                    style={{ padding: "10px", borderRadius: "10px" }}
                  >
                    Transfer
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <h3>Lock TADA</h3>
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
                    name="amount"
                    placeholder="TADA amount"
                    onChange={handleLockChanged}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      width: "260px",
                    }}
                  />
                  <button
                    onClick={lockToken}
                    style={{ padding: "10px", borderRadius: "10px" }}
                  >
                    Lock Token
                  </button>
                </div>
              </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3>Unlock TADA</h3>
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
                name="transaction"
                placeholder="TX"
                onChange={handleUnlockChanged}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  width: "260px",
                }}
              />
              <button
                onClick={unlockToken}
                style={{ padding: "10px", borderRadius: "10px" }}
              >
                Unlock
              </button>
            </div>
          </div>
        </>
        )}

      </div>

      {/* <button onClick={() => getAssets()} style={{ padding: "20px" }}>
        Get Assets
      </button> */}
    </>
  );
};

export default Home;
