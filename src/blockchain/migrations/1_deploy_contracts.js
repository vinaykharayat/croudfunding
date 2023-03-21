const Crowdfunding = artifacts.require("Crowdfunding");

module.exports = function (deployer) {
  deployer.deploy(Crowdfunding, "0xfa648a9799aafc4bc56bb154b007685ef3a74132");
};
