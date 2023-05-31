import {
  Asset,
  Transaction
} from "@meshsdk/core"
import { CardanoWallet, useWallet } from "@meshsdk/react"
import { NextPage } from "next"
import { useEffect, useState } from "react"

export interface INFTPayload {
  assetName: string
  fingerprint: string
  policyId: string
  quantity: string
  unit: string
}

const Deposit: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<INFTPayload[]>([]);
  const [nftsDeposit, setNftsDeposit] = useState<INFTPayload[]>([]);
  const [txHashSuccess, setTxHashSuccess] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const policyID = 'aa9f5167ed1854712495a894199967261b64620fe45de56ff2ed9887'

  async function getUserNFTs() {
    const results = await wallet.getAssets()
    const assets = results.filter(r => {
      return r.policyId === policyID
    })
    setAssets(assets)
  }

  const getAddress = async () => {
    if (!connected) return
    const addressWallet = await wallet?.getChangeAddress() as string;
    setAddress(addressWallet);
  }

  const getInventory = async () => {
    await getUserNFTs()
  }

  useEffect(() => {
    getAddress()
    if (connected) {
      getInventory()
    }
  }, [connected])

  async function depositNFTs() {
    const adminAddress = process.env.NEXT_PUBLIC_SC_ADDRESS || ''
    try {
      const sendAssets = nftsDeposit.map(nft => {
        const asset: Asset = {
          unit: nft.unit,
          quantity: nft.quantity
        }
        return asset
      })
      const tx = new Transaction({ initiator: wallet }).sendAssets(adminAddress, sendAssets)
      const unsignedTx = await tx.build()
      const signedTx = await wallet.signTx(unsignedTx)
      const txHash = await wallet.submitTx(signedTx)
      if (txHash) {
        alert(`Your transaction #${txHash} is being processed! Please refresh after 20 - 60 seconds to confirm your order`)
      }
      setTxHashSuccess(txHash)
    } catch (error: unknown) {
      alert(`Create order failed with error: ${(error as Error).message}`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const value = e.target.value
    if (Number(value) < 1) return
    const chosen = nftsDeposit.find(nft => nft.unit === id)
    if (chosen) {
      const asset = assets.find(e => e.unit === id)
      if (!asset) {
        alert('Not found assetID!')
        e.target.value = ''
        return
      }
      nftsDeposit.forEach(nft => {
        if (nft.unit === id) {
          nft.quantity = `${value}`
        }
      })
      setNftsDeposit(nftsDeposit)
    } else {
      const asset = assets.find(e => e.unit === id)
      if (!asset) {
        alert('Not found assetID!')
        e.target.value = ''
        return
      }
      const newBuyNFT: INFTPayload = {
        unit: asset.unit,
        quantity: `${value}`,
        assetName: asset.assetName,
        fingerprint: asset.fingerprint,
        policyId: asset.policyId

      }
      const newNftsDeposit = [...nftsDeposit, newBuyNFT]
      setNftsDeposit(newNftsDeposit)
    }
  }

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
        {!connected && !address}
        <CardanoWallet label="Connect to wallet"/>
        {connected && (
        <>
          <table>
            <thead>
              <tr>
                <th style={{ border: '1px solid white', padding: '10px' }}>ID #</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>NFT Name</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>NFT Asset ID</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Quantity</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Deposit Quantity</th>
              </tr>
            </thead>
            <tbody>
            {assets?.map((item, index) => (
                <tr key={item.unit}>
                  <th style={{ border: '1px solid white', padding: '10px' }}>{index + 1}</th>
                  <th style={{ border: '1px solid white', padding: '10px' }}>{item.assetName}</th>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.unit}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>
                    <input type="number" min="1" onChange={e => handleChange(e, item.unit)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={depositNFTs}
            style={{ padding: "10px", borderRadius: "10px", cursor: 'pointer' }}
          >
            Deposit NFTs
          </button>
          {txHashSuccess ? <p>Transaction {txHashSuccess}</p> : null}
        </>
        )}
      </div>
    </>
  );
};

export default Deposit;
