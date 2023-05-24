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
import { checkoutOrder, createOrder, getAdminNfts, getUserInventory, login } from "./api/smartcontract";


const TADA_LOVELACE = 1000000
const SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS || ''

interface INFTGroupAsset {
  id: number
  assetId: string
  authorId: number
  availableNfts: number
  name: string
  price: string
  currency: string
  onSale: boolean
  quantity: string
  rarity: string
  status: string
  hasNfts: number
}

interface IFields {
  address: string
  assetName: string
  assetID: string
  quantity: string
}

interface IBuyNFTs {
  id: number
  quantity: number
  price: number
  currency: string
}

const DEFAULT: IFields = {
  address: '',
  assetName: '',
  assetID: '',
  quantity: '',
}

interface IOrderGroup {
  id: number
  quantity: number
}

export interface IOrderPayload {
  orderGroups: IOrderGroup[]
  description: string
}

export interface IOrderCheckout {
  txHash: string
  orderId: number
}

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<INFTGroupAsset[]>([]);
  const [buyNFTs, setBuyNFTs] = useState<IBuyNFTs[]>([]);
  const [inventoryAssets, setInventoryAssets] = useState<INFTGroupAsset[]>([]);
  const [accessToken, setAccessToken] = useState<string>('');
  const [txHashSuccess, setTxHashSuccess] = useState<string>('');
  const [lockedTADA, setLockedTADA] = useState<string>('');
  const [unlockTx, _] = useState<string>('');
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState<string>('')
  const [membership, setMembership] = useState<string>('N')
  const [transferTo, setTransferTo] = useState({ address: null, amount: null });

  async function getAssets(token: string) {
    if (!connected) return
    const results = await getAdminNfts(token);
    const nftGroup = results.data as INFTGroupAsset[]
    setAssets(nftGroup.filter(group => group.currency === 'ADA' && group.onSale))
  }

  async function getUserNFTs(token: string) {
    const results = await getUserInventory(token);
    const nftGroup = results.data as INFTGroupAsset[]
    setInventoryAssets(nftGroup.filter(group => group.currency === 'ADA' && group.onSale))
  }

  const signMessage = async (message: string, walletname: string) => {
    const api = await window.cardano[walletname].enable();
    const hexAddresses = await api.getRewardAddresses();
    const hexAddress = hexAddresses[0];
    let hexMessage = '';
  
    for (var i = 0, l = message.length; i < l; i++) {
      hexMessage += message.charCodeAt(i).toString(16);
    }
  
    try {
      const { signature, key } = await api.signData(hexAddress, hexMessage);
      console.log('signature', signature, 'key', key);
    } catch (error) {
      console.warn(error);
    }
  };
  const getAddress = async () => {
    if (!connected) return
    const addressWallet = await wallet?.getChangeAddress() as string;
    setAddress(addressWallet);
  }

  const adminLogin = async () => {
    const email = 'admin@gmail.com'
    const password = '123456'
    const result = await login({ email, password })
    const accessToken = result?.accessToken || ''
    await getAssets(accessToken)
  }

  const getInventory = async () => {
    const email = 'phdang.tk@gmail.com'
    const password = '123456'
    const result = await login({ email, password })
    setEmail(result?.user?.email || '')
    setMembership(result?.user?.membership || '')
    const token = result?.accessToken || ''
    await getUserNFTs(token)
    setAccessToken(token)
  }

  useEffect(() => {
    getAddress()
    if (connected) {
      adminLogin()
      getInventory()
    }
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
    const orderGroups = buyNFTs.filter(nft => nft.quantity > 0).map(nft => {
      return { id: nft.id, quantity: nft.quantity }
    }) as IOrderGroup[]
    const adaAmount = buyNFTs.filter(nft => nft.quantity > 0 && nft.currency === 'ADA').reduce((acc: number, el: IBuyNFTs) => {
      return Number(acc) + Number(el.price) * el.quantity
    }, 0)
    const lovelace = adaAmount * TADA_LOVELACE
    const adminAddress = process.env.NEXT_PUBLIC_SC_ADDRESS || ''
    const order: IOrderPayload = {
      orderGroups,
      description: 'Test order buying by ADA'
    }
    try {
      const result = await createOrder(accessToken, order)
      if (!result?.id) {
        alert('Could not create order!')
        return
      }
  
      const orderId = Number(result?.id)
      const tx = new Transaction({ initiator: wallet }).setMetadata(0, { orderId }).sendLovelace(adminAddress, `${lovelace}`)
      const unsignedTx = await tx.build()
      const signedTx = await wallet.signTx(unsignedTx)
      const txHash = await wallet.submitTx(signedTx)
      
      const payload: IOrderCheckout = {
        txHash,
        orderId
      }
      const resultOrder = await checkoutOrder(accessToken, payload)
      if (resultOrder) {
        alert(`Your order #${orderId} is being processed! Please refresh after 20 - 60 seconds to confirm your order`)
      }
      setTxHashSuccess(txHash)
    } catch (error: unknown) {
      alert(`Create order failed with error: ${(error as Error).message}`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const value = e.target.value
    if (Number(value) < 1) return
    const chosen = buyNFTs.find(nft => Number(nft.id) === Number(id))
    if (chosen) {
      const asset = assets.find(e => Number(e.id) === Number(id))
      if (Number(asset?.availableNfts) < Number(value)) {
        alert('Not enough quantity to buy!')
        e.target.value = ''
        return
      }
      buyNFTs.forEach(nft => {
        if (Number(nft.id) === Number(id)) {
          nft.quantity = Number(value)
        }
      })
      setBuyNFTs(buyNFTs)
    } else {
      const asset = assets.find(e => Number(e.id) === Number(id))
      if (Number(asset?.availableNfts) < Number(value)) {
        alert('Not enough quantity to buy!')
        e.target.value = ''
        return
      }
      const newBuyNFT: IBuyNFTs = {
        id,
        quantity: Number(value),
        price: Number(asset?.price || 0),
        currency: asset?.currency || ''
      }
      const newBuyNFTs = [...buyNFTs, newBuyNFT]
      setBuyNFTs(newBuyNFTs)
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
                <th style={{ border: '1px solid white', padding: '10px' }}>Category</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Quantity</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Available</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Price</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Currency</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Buy Quantity</th>
              </tr>
            </thead>
            <tbody>
            {assets?.map((item) => (
                <tr key={item.id}>
                  <th style={{ border: '1px solid white', padding: '10px' }}>{item.id}</th>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.name}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.assetId}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.rarity}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.availableNfts}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.price}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.currency}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>
                    <input type="number" min="1" onChange={e => handleChange(e, Number(item.id))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={sendADA}
            style={{ padding: "10px", borderRadius: "10px", cursor: 'pointer' }}
          >
            Buy NFTs
          </button>
          { txHashSuccess !== '' ? <p>txHash: {txHashSuccess}</p> : null }
          <p>Email: {email}</p>
          <p>Membership: {membership}</p>
          <table>
            <thead>
              <tr>
                <th style={{ border: '1px solid white', padding: '10px' }}>ID #</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>NFT Name</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>NFT Asset ID</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Category</th>
                <th style={{ border: '1px solid white', padding: '10px' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
            {inventoryAssets?.map((item) => (
                <tr key={item.id}>
                  <th style={{ border: '1px solid white', padding: '10px' }}>{item.id}</th>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.name}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.assetId}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.rarity}</td>
                  <td style={{ border: '1px solid white', padding: '10px' }}>{item.hasNfts}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
