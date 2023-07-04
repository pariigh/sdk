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
import { AbstractEthersSigner } from "./types"

export type TokenboundClientOptions = {
  chainId: number
  signer?: any
  walletClient?: WalletClient
  customImplementation?: Custom6551Implementation
}

export type Custom6551Implementation = {
  implementationAddress: `0x${string}`
  registryAddress: `0x${string}`
}

export type TBAccountParams = {
  tokenContract: `0x${string}`
  tokenId: string
}

export type GetAccountParams = TBAccountParams & Partial<Custom6551Implementation>
export type PrepareCreateAccountParams = TBAccountParams & Partial<Custom6551Implementation>
export type CreateAccountParams = TBAccountParams & Partial<Custom6551Implementation>

export type ExecuteCallParams = {
  account: string
  to: string
  value: bigint
  data: string
}

export type PrepareExecuteCallParams = ExecuteCallParams

export type ComputeAccountParams = TBAccountParams & {
  chainId: number
} & Custom6551Implementation

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
  private customImplementation?: Custom6551Implementation

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

    if (options.customImplementation) {
      this.customImplementation = options.customImplementation
    }

    this.isInitialized = true

  }


/**
 * Returns the tokenbound account address for a given token contract and token ID.
 * @param {`0x${string}`} params.tokenContract The address of the token contract.
 * @param {string} params.tokenId The token ID.
 * @param {`0x${string}`} [params.implementationAddress] The address of the implementation contract.
 * @param {`0x${string}`} [params.registryAddress] The address of the registry contract.
 * @returns The tokenbound account address.
 */
  public getAccount(params: GetAccountParams): `0x${string}` {
    const { tokenContract, tokenId, implementationAddress, registryAddress } = params;
    const implementation = this.customImplementation?.implementationAddress || implementationAddress
    
    try {
      // Here we call computeAccount rather than getAccount to avoid
      // making an async contract call via publicClient
      return computeAccount(tokenContract, tokenId, this.chainId, implementation, registryAddress)
    } catch (error) {
      throw error
    }
  }

/**
 * Returns the prepared transaction to create a tokenbound account for a given token contract and token ID.
 * @param {`0x${string}`} params.tokenContract The address of the token contract.
 * @param {string} params.tokenId The token ID.
 * @param {`0x${string}`} [params.implementationAddress] The address of the implementation contract.
 * @param {`0x${string}`} [params.registryAddress] The address of the registry contract.
 * @returns The prepared transaction to create a tokenbound account. Can be sent via `sendTransaction` on an Ethers signer or viem WalletClient.
 */
  public async prepareCreateAccount(params: PrepareCreateAccountParams): Promise<{
    to: `0x${string}`
    value: bigint
    data: `0x${string}`
  }> {
    const { tokenContract, tokenId, implementationAddress, registryAddress } = params
    const implementation = this.customImplementation?.implementationAddress || implementationAddress

    return prepareCreateAccount(tokenContract, tokenId, this.chainId, implementation, registryAddress)
  }

/**
 * Returns the transaction hash of the transaction that created the tokenbound account for a given token contract and token ID.
 * @param {`0x${string}`} params.tokenContract The address of the token contract.
 * @param {string} params.tokenId The token ID.
 * @param {`0x${string}`} [params.implementationAddress] The address of the implementation contract.
 * @param {`0x${string}`} [params.registryAddress] The address of the registry contract.
 * @returns a Promise that resolves to the transaction hash of the transaction that created the tokenbound account.
 */
  public async createAccount(params: CreateAccountParams): Promise<`0x${string}`> {
    const { tokenContract, tokenId, implementationAddress, registryAddress } = params
    const implementation = this.customImplementation?.implementationAddress || implementationAddress


    try {
      if(this.signer) { // Ethers
        const prepareCreateAccount = await this.prepareCreateAccount({tokenContract: tokenContract as `0x${string}`, tokenId: tokenId, implementationAddress: implementation, registryAddress})
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

/**
 * Returns prepared transaction to execute a call on a tokenbound account
 * @param {string} params.account The tokenbound account address
 * @param {string} params.to The recipient address
 * @param {bigint} params.value The value to send, in wei
 * @param {string} params.data The data to send
 * @returns a Promise with prepared transaction to execute a call on a tokenbound account. Can be sent via `sendTransaction` on an Ethers signer or viem WalletClient.
 */
  public async prepareExecuteCall(params: PrepareExecuteCallParams): Promise<{
    to: `0x${string}`
    value: bigint
    data: `0x${string}`
  }> {
    const { account, to, value, data } = params
    return prepareExecuteCall(account, to, value, data)
  }

/**
 * Returns a hash of the transaction that executed a call on a tokenbound account
 * @param {string} params.account The tokenbound account address
 * @param {string} params.to The recipient address
 * @param {bigint} params.value The value to send, in wei
 * @param {string} params.data The data to send
 * @returns a Promise with prepared transaction to execute a call on a tokenbound account. Can be sent via `sendTransaction` on an Ethers signer or viem WalletClient.
 */
  public async executeCall(params: ExecuteCallParams): Promise<`0x${string}`> {
    const { account, to, value, data } = params
    try {
      if(this.signer) { // Ethers
        return await this.signer.sendTransaction({
          to: to,
          value: value,
          data: data
        })

      }
      else if(this.walletClient) {
        return executeCall(account, to, value, data, this.walletClient)
      }
      else {
        throw new Error("No wallet client or signer available.")
      }  
    } catch (error) {
      throw error
    }
  }
  
}

export { 
  TokenboundClient,
  erc6551AccountAbi, 
  erc6551RegistryAbi,
  getAccount,
  createAccount,
  getCreationCode,
  computeAccount,
  prepareExecuteCall,
  executeCall
}