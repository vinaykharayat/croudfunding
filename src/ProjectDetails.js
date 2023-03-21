import React, { useState, useEffect } from "react";
import { Button, Alert } from "react-bootstrap";
import getWeb3 from "./web3";

function ProjectDetails({ project, metaCoin, crowdfunding, accounts }) {
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const loadBalance = async () => {
      const _web3 = await getWeb3();
      setWeb3(_web3);
      const result = await crowdfunding.methods.getBalance(project.id).call();
      console.log("result", result);
      setBalance(result.toString());
    };
    loadBalance();
  }, [project, crowdfunding.methods]);

  const handleWithdrawAmountChange = (event) => {
    setWithdrawAmount(event.target.value);
  };

  const handleWithdraw = async () => {
    try {
      const amount = web3.utils.toWei(withdrawAmount.toString(), "ether");
      await crowdfunding.methods
        .withdraw(project.id, amount)
        .send({ from: accounts[0] });
      const result = await crowdfunding.methods.getBalance(project.id).call();
      setBalance(result);
      setWithdrawAmount(0);
      alert("Withdrawal successful");
    } catch (error) {
      console.log(error);
      alert("Withdrawal failed");
    }
  };

  if (!web3) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <p>Goal: {web3.utils.fromWei(project.goal, "ether")} MetaCoin</p>
      <p>Deadline: {new Date(project.deadline * 1000).toLocaleString()}</p>
      <p>Balance: {web3.utils.fromWei(balance.toString(), "ether")} MetaCoin</p>
      {balance >= project.goal ? (
        <Alert variant="success">Funding goal reached</Alert>
      ) : (
        <Alert variant="warning">Funding goal not yet reached</Alert>
      )}
      <h3>Withdraw funds</h3>
      <p>
        Available balance: {web3.utils.fromWei(balance.toString(), "ether")}{" "}
        MetaCoin
      </p>
      <input
        type="number"
        step="0.0001"
        value={withdrawAmount}
        onChange={handleWithdrawAmountChange}
      />
      <Button
        variant="primary"
        disabled={balance === "0"}
        onClick={handleWithdraw}
      >
        Withdraw
      </Button>
    </>
  );
}

export default ProjectDetails;
