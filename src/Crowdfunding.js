import React, { useState, useEffect } from "react";
import getWeb3 from "./web3";
import CrowdfundingContract from "./blockchain/build/contracts/Crowdfunding.json";
import MetaCoinContract from "./blockchain/build/contracts/MetaCoin.json";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import ProjectDetails from "./ProjectDetails";

const Crowdfunding = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [crowdfunding, setCrowdfunding] = useState(null);
  const [metaCoin, setMetaCoin] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    id: 0,
    title: "",
    goal: 0,
    deadline: 0,
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [contributionAmount, setContributionAmount] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();

        const crowdfunding = new web3.eth.Contract(
          CrowdfundingContract,
          "0xa50Ea5ff6D01DC627e8Bd35FE2388b31EC387563"
        );

        const metaCoin = new web3.eth.Contract(
          MetaCoinContract.abi,
          "0xa2768A0B59708Eb00D14f29B63791f6c5960Bdf1"
        );

        setWeb3(web3);
        setAccounts(accounts);
        setCrowdfunding(crowdfunding);
        setMetaCoin(metaCoin);

        const numProjects = await crowdfunding.methods.numProjects().call();
        const projects = [];
        for (let i = 0; i < numProjects; i++) {
          const project = await crowdfunding.methods.projects(i).call();
          projects.push(project);
        }
        console.log(projects);
        console.log(projects);
        setProjects(projects);
      } catch (error) {
        console.log(error);
      }
    };

    init();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;
    console.log("newvalue", newValue);
    setNewProject({ ...newProject, [name]: newValue });
  };

  const handleContributionAmountChange = (event) => {
    setContributionAmount(event.target.value);
  };

  const handleSelectProject = (event) => {
    console.log("selectedProject:", event.target.value);
    setSelectedProject(event.target.value);
  };

  const handleContribute = async () => {
    try {
      const amount = web3.utils.toWei(contributionAmount.toString(), "ether");
      await metaCoin.methods
        .approve(crowdfunding.options.address, amount)
        .send({ from: accounts[0] });
      await crowdfunding.methods
        .contribute(selectedProject, amount)
        .send({ from: accounts[0] });
      const balance = await metaCoin.methods.balanceOf(accounts[0]).call();
      console.log(`New MetaCoin balance: ${balance}`);
      setContributionAmount(0);
      setSelectedProject(null);
      alert("Contribution successful");
    } catch (error) {
      console.log(error);
      alert("Contribution failed");
    }
  };

  const handleNewProject = async (event) => {
    event.preventDefault();
    try {
      const title = newProject.title;
      const goal = web3.utils.toWei(newProject.goal.toString(), "ether");
      const deadline = newProject.deadline;
      console.log(newProject);
      await crowdfunding.methods
        .createProject(deadline, title, goal)
        .send({ from: accounts[0] });
      const numProjects = await crowdfunding.methods.numProjects().call();
      const projects = [];
      for (let i = 0; i < numProjects; i++) {
        const project = await crowdfunding.methods.projects(i).call();
        projects.push(project);
      }
      setProjects(projects);
      setNewProject({ title: "", goal: 0, deadline: 0 });
      alert("Project created");
    } catch (error) {
      console.log(error);
      alert("Project creation failed");
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Crowdfunding</h1>
          <p>Account: {accounts[0]}</p>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h2>Create new project</h2>
          <Form onSubmit={handleNewProject}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newProject.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="goal">
              <Form.Label>Goal (in MetaCoin)</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                name="goal"
                value={newProject.goal}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="deadline">
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                type="number"
                name="deadline"
                value={newProject.deadline}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Form>
        </Col>
        <Col md={4}>
          <h2>Projects</h2>
          <Form.Group controlId="project">
            <Form.Label>Select project to contribute</Form.Label>
            <Form.Control
              as="select"
              value={selectedProject}
              onChange={handleSelectProject}
            >
              <option value={null}>Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="amount">
            <Form.Label>Contribution amount (in MetaCoin)</Form.Label>
            <Form.Control
              type="number"
              step="0.0001"
              value={contributionAmount}
              onChange={handleContributionAmountChange}
            />
          </Form.Group>
          <Button
            variant="primary"
            disabled={!selectedProject || contributionAmount <= 0}
            onClick={handleContribute}
          >
            Contribute
          </Button>
        </Col>
        <Col md={4}>
          <h2>Project details</h2>
          {selectedProject && (
            <ProjectDetails
              project={projects.find((p) => p.id === selectedProject)}
              metaCoin={metaCoin}
              crowdfunding={crowdfunding}
              accounts={accounts}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Crowdfunding;
