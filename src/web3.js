import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        window.ethereum.enable().then(() => {
          resolve(web3);
        });
      } catch (error) {
        reject(error);
      }
    } else if (window.web3) {
      resolve(window.web3);
    } else {
      reject("No web3 provider found");
    }
  });

export default getWeb3;
