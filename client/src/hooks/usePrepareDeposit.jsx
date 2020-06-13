import { useAsync } from "react-async-hook";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import useConstant from "use-constant";
import { deposit as tornado } from "../utils/TornadoUtils";
import priceConversion from "../utils/PricingUtils";

export default function usePrepareDeposit(web3, ethToRetrieve) {
  const prepareDeposit = async (web3, ethToRetrieve) => {
    let {
      btcToTransfer,
      ethReserveInWei,
      priceImpact,
      price,
    } = await priceConversion(web3, ethToRetrieve);
    const enoughLiquidity = ethReserveInWei > ethToRetrieve;
    let { note, commitment } = await tornado(web3, ethToRetrieve);
    return {
      enoughLiquidity,
      btcToTransfer,
      ethReserveInWei,
      note,
      commitment,
      priceImpact,
      price,
    };
  };

  const debouncedPrepareDeposit = useConstant(() =>
    AwesomeDebouncePromise((web3, ethToRetrieve) => {
      return prepareDeposit(web3, ethToRetrieve);
    }, 300)
  );

  // Call debounced function asynchronously...
  return useAsync(debouncedPrepareDeposit, [web3, ethToRetrieve], {
    // ...refresh state only after call returns
    setLoading: (state) => ({ ...state, loading: true }),
  });
}
