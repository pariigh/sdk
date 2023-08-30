import { ConnectKitButton } from 'connectkit'
import { useAccount, WindowProvider } from 'wagmi'

import { Account } from './components'

import { createWalletClient, http, custom, WalletClient } from 'viem'
import { goerli } from 'viem/chains'
import { TokenboundClient } from '@tokenbound/sdk'

import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    ethereum?: WindowProvider
  }
}

export function App() {
  const { isConnected, address } = useAccount()

  const walletClient: WalletClient = createWalletClient({
    chain: goerli,
    account: address,
    transport: window.ethereum ? custom(window.ethereum) : http(),
  })

  const tokenboundClient = new TokenboundClient({ walletClient, chainId: goerli.id })

  useEffect(() => {
    async function testTokenboundClass() {
      if (!tokenboundClient) return

      const tokenboundAccount = tokenboundClient.getAccount({
        tokenContract: '0xe7134a029cd2fd55f678d6809e64d0b6a0caddcb',
        tokenId: '9',
      })

      const preparedExecuteCall = await tokenboundClient.prepareExecuteCall({
        account: tokenboundAccount,
        to: tokenboundAccount,
        value: 0n,
        data: '',
      })

      const preparedCreateAccount = await tokenboundClient.prepareCreateAccount({
        tokenContract: '0xe7134a029cd2fd55f678d6809e64d0b6a0caddcb',
        tokenId: '1',
      })

      console.log('getAccount', tokenboundAccount)
      console.log('preparedExecuteCall', preparedExecuteCall)
      console.log('preparedAccount', preparedCreateAccount)

      // if (address) {
      //   walletClient?.sendTransaction(preparedCreateAccount)
      //   walletClient?.sendTransaction(preparedExecuteCall)
      // }
    }

    testTokenboundClass()
  }, [])

  const createAccount = useCallback(async () => {
    if (!tokenboundClient || !address) return
    const createdAccount = await tokenboundClient.createAccount({
      tokenContract: '0xe7134a029cd2fd55f678d6809e64d0b6a0caddcb',
      tokenId: '1',
    })
    alert(`new account: ${createdAccount}`)
  }, [tokenboundClient])

  const transferNFT = useCallback(async () => {
    if (!tokenboundClient || !address) return

    const bjGoerliSapienz = tokenboundClient.getAccount({
      // BJ's Goerli Sapienz
      tokenContract: '0x26c55c8d83d657b2fc1df497f0c991e3612bc6b2',
      tokenId: '5',
    })

    console.log('goerli sapienz tbaccount', bjGoerliSapienz)

    const transferredNFTHash = await tokenboundClient.transferNFT({
      account: bjGoerliSapienz,
      tokenType: 'ERC721',
      tokenContract: '0xbbabef539cad957f1ecc9ee56f38588e24b3dcf3',
      tokenId: '0',
      recipientAddress: '0x9FefE8a875E7a9b0574751E191a2AF205828dEA4', // BJ's main wallet
    })
    // const createdAccount = await tokenboundClient.createAccount({
    //   tokenContract: '0xe7134a029cd2fd55f678d6809e64d0b6a0caddcb',
    //   tokenId: '1',
    // })
    alert(`transferred: ${transferredNFTHash}`)
  }, [tokenboundClient])

  const executeCall = useCallback(async () => {
    if (!tokenboundClient || !address) return
    const executedCall = await tokenboundClient.executeCall({
      account: address,
      to: address,
      value: 0n,
      data: '0x',
    })
  }, [tokenboundClient])

  return (
    <>
      <h1>viem walletClient + ConnectKit + Vite</h1>
      <ConnectKitButton />
      {isConnected && <Account />}
      {address && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            margin: '32px 0 0',
            maxWidth: '320px',
          }}
        >
          <button onClick={() => executeCall()}>EXECUTE CALL</button>
          <button onClick={() => createAccount()}>CREATE ACCOUNT</button>
          <button onClick={() => transferNFT()}>Transfer NFT</button>
        </div>
      )}
    </>
  )
}
