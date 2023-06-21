import { Contract, Signer, utils } from "ethers";
import { erc6551AccountAbi, erc6551RegistryAbi} from '../../abis'
import { erc6551AccountImplementationAddress, erc6551RegistryAddress } from "../constants";

// /**
//  * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
//  * @internal
//  */
// export async function prepareCreateAccount(
//   tokenContract: string,
//   tokenId: string,
//   chainId: number
// ): Promise<{
//   to: `0x${string}`
//   value: bigint
//   data: `0x${string}`
// }> {
  
//   // Create an ethers.js Interface for the contract
//   const registryInterface = new utils.Interface(erc6551RegistryAbi);
//   const accountInterface = new utils.Interface([
//     {
//       inputs: [],
//       name: "initialize",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     }
//   ]);

//   // Generate the initialization data
//   const initData = accountInterface.encodeFunctionData("initialize");

//   return {
//     to: erc6551RegistryAddress,
//     value: BigInt(0),
//     data: registryInterface.encodeFunctionData("createAccount", [
//       erc6551AccountImplementationAddress,
//       chainId,
//       tokenContract,
//       tokenId,
//       0,
//       initData,
//     ]) as `0x${string}`,
//   }
// }

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export async function createAccount(
  tokenContract: string,
  tokenId: string,
  signer: Signer
) {
  const registry = new Contract(
    erc6551RegistryAddress,
    erc6551RegistryAbi,
    signer
  );

  if (!signer.provider) throw Error("Signer has no provider");

  const { chainId } = await signer.provider.getNetwork();

  const initData = new utils.Interface([
    "function initialize()",
  ]).encodeFunctionData("initialize");

  return registry.createAccount(
    erc6551AccountImplementationAddress,
    chainId,
    tokenContract,
    tokenId,
    0,
    initData
  );
}

/**
 * @deprecated Direct consumption of this function is deprecated. Consume via TokenboundClient instead.
 * @internal
 */
export async function executeCall(
  account: string,
  to: string,
  value: bigint,
  data: string,
  signer: Signer
) {
  console.log('account', account)
  console.log('erc6551AccountAbi', erc6551AccountAbi)
  console.log('signer', signer)

  const accountContract = new Contract(account, erc6551AccountAbi, signer);

  console.log('accountContract', accountContract)  
  console.log({to,value,data})

  return accountContract.executeCall(to, value, data)

}
