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
const SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS || ''


const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [lockedTADA, setLockedTADA] = useState<string>('');
  const [unlockTx, setUnlockTx] = useState<string>('');
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
    const utxos = await wallet.getUtxos();
    const koios = new KoiosProvider('preprod');
    const costLovelace = `${+lockedTADA * TADA_LOVELACE}`
    const assetMap = new Map<Unit, Quantity>()
    assetMap.set(
      'lovelace',
      costLovelace
    );
    const selectedUtxos = keepRelevant(assetMap, utxos)
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
    // const unsignedTx ="84a300818258202501cc3a56ea06061716e8d24b1f8d5180f43c74847c097d7bffc2968100ce8b010182a300581d700b4a6193cfa9712b1dfbc117277f06692645cf643d6e9ad87add94bd01821a001e8480a2581cc5ca5c9778912e21fdbdc382d683b1f8477231cbd58ff2040c9c9569a3542d6d205465636877697a54657374746f6b656e0a1a000f4240515465636877697a54657374746f6b656e0a1a000f424056e2809c5465636877697a54657374746f6b656ee2809d02581ccc5ab2cb82c3dbd1e7c9cada80fbe4ad95aa187b717935ed5393610ba24444616e67014b44616e6744656d6f4e4654010282005820748f2aaa7f4f9915c4f0489b3e8813f8de03239c067357eb3b7ce56033191d6ba2005839008caa580675ca4a9f45e36d3ae22ba2c110a8fd06dd61085e9e67e83e9457983da9c748d62ec255ba44f7d27df3134c9b4963a02106403ac4011b0000000247486edd021a0002ad55a0f5f6"
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
    console.log(unsignedTx)
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
    console.log(unsignedTx)
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
