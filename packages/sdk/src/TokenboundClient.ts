import { WalletClient } from "viem"
import { erc6551AccountAbi, erc6551RegistryAbi } from '../abis'
import { 
  getAccount,
  computeAccount,
  createAccount,
  getCreationCode,
  prepareExecuteCall,
  executeCall,
  prepareCreateAccount
} from './functions'
// import { loadEthersImplementation } from "./loaders"
import { AbstractEthersSigner } from "./types"

export type TokenboundClientOptions = {
  chainId: number
  signer?: any
  walletClient?: WalletClient
}

export type GetAccountParams = {
  tokenContract: string
  tokenId: string
}

export type PrepareCreateAccountParams = {
  tokenContract: `0x${string}`
  tokenId: string
}

export type CreateAccountParams = {
  tokenContract: string
  tokenId: string
}

export type PrepareExecuteCallParams = {
  account: string
  to: string
  value: bigint
  data: string
}

export type ExecuteCallParams = {
  account: string
  to: string
  value: bigint
  data: string
}

export type ComputeAccountParams = {
  tokenContract: `0x${string}`
  tokenId: string
  chainId: number
}

export type GetCreationCodeParams = {
  implementation_: `0x${string}`
  chainId_: number
  tokenContract_: string
  tokenId_: string
  salt_: string
}

class TokenboundClient {
  private chainId: number
  public isInitialized: boolean = false
  private signer?: AbstractEthersSigner
  private walletClient?: WalletClient

  constructor(options: TokenboundClientOptions) {

    if(!options.chainId) {
      throw new Error("chainId is required.")
    }

    if (options.signer && options.walletClient) {
      throw new Error("Only one of `signer` or `walletClient` should be provided.")
    }
    
    this.chainId = options.chainId

    if (options.signer) {
      this.signer = options.signer
    } else if (options.walletClient) {
      this.walletClient = options.walletClient
    }

    this.isInitialized = true

  }

  public getAccount(params: GetAccountParams): `0x${string}` {
    const { tokenContract, tokenId } = params;
    
    try {
      // Here we call computeAccount rather than getAccount to avoid
      // making an async contract call via publicClient
      return computeAccount(tokenContract, tokenId, this.chainId)
    } catch (error) {
      throw error
    }
  }

  public async prepareCreateAccount(params: PrepareCreateAccountParams): Promise<{
    to: `0x${string}`
    value: bigint
    data: `0x${string}`
  }> {
    const { tokenContract, tokenId } = params

    return prepareCreateAccount(tokenContract, tokenId, this.chainId)
  }

  public async createAccount(params: CreateAccountParams): Promise<`0x${string}`> {
    const { tokenContract, tokenId } = params

    try {
      if(this.signer) { // Ethers
        console.log('--> Ethers version of createAccount', this.signer)
        const prepareCreateAccount = await this.prepareCreateAccount({tokenContract: tokenContract as `0x${string}`, tokenId: tokenId})
        return await this.signer.sendTransaction(prepareCreateAccount)

      }
      else if(this.walletClient) {
        return createAccount(tokenContract, tokenId, this.walletClient)
      }    
      else {
        throw new Error("No wallet client or signer available.")
      }  
    } catch (error) {
      throw error
    }

  }

  public async prepareExecuteCall(params: PrepareExecuteCallParams): Promise<{
    to: `0x${string}`
    value: bigint
    data: `0x${string}`
  }> {
    const { account, to, value, data } = params
    return prepareExecuteCall(account, to, value, data)
  }

  public async executeCall(params: ExecuteCallParams): Promise<`0x${string}`> {
    const { account, to, value, data } = params
    try {
      if(this.signer) { // Ethers
        console.log('--> Ethers version of executeCall')
        return await this.signer.sendTransaction({
          to: to,
          value: value,
          data: data
        })

      }
      else if(this.walletClient) {
        console.log('walletClient in executeCall', this.walletClient, account)
        return executeCall(account, to, value, data, this.walletClient)
      }
      else {
        throw new Error("No wallet client or signer available.")
      }  
    } catch (error) {
      throw error
    }
  }

  public getCreationCode(params: GetCreationCodeParams): Uint8Array {
    const { implementation_, chainId_, tokenContract_, tokenId_, salt_ } = params
    return getCreationCode(implementation_, chainId_, tokenContract_, tokenId_, salt_)
  }
  
}

export { 
  TokenboundClient,
  erc6551AccountAbi, 
  erc6551RegistryAbi,
  getAccount,
  createAccount,
  getCreationCode,
  prepareExecuteCall,
  executeCall
}