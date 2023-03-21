// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MetaCoin.sol";

contract Crowdfunding {
    struct Project {
        uint256 id;
        address owner;
        uint256 deadline;
        string title;
        uint256 goal;
        uint256 balance;
        bool completed;
    }

    MetaCoin public metaCoin;
    mapping(uint256 => Project) public projects;
    uint256 public numProjects = 0;

    mapping(uint256 => mapping(address => uint256)) public contributions;

    event ProjectCreated(
        uint256 indexed id,
        address creator,
        uint256 deadline,
        string title,
        uint256 goal
    );

    constructor(MetaCoin _metaCoin) {
        metaCoin = _metaCoin;
    }

    function createProject(
        uint256 _deadline,
        string memory _title,
        uint256 _goal
    ) public {
        projects[numProjects] = Project(
            numProjects,
            msg.sender,
            _deadline,
            _title,
            _goal,
            0,
            false
        );
        emit ProjectCreated(numProjects, msg.sender, _deadline, _title, _goal);
        numProjects++;
    }

    function contribute(uint256 _projectId, uint256 _amount) public {
        require(_projectId < numProjects, "Invalid project ID");
        Project storage project = projects[_projectId];
        require(!project.completed, "Project is already completed");
        require(
            project.deadline >= block.timestamp,
            "Project deadline has passed"
        );

        contributions[_projectId][msg.sender] += _amount;
        project.balance += _amount;
        metaCoin.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _projectId, uint256 _amount) public {
        require(_projectId < numProjects, "Invalid project ID");

        Project storage project = projects[_projectId];
        require(
            project.completed || project.deadline < block.timestamp,
            "Project is not completed yet"
        );

        uint256 contribution = contributions[_projectId][msg.sender];
        require(contribution > 0, "Sender has no contributions");

        if (project.completed) {
            // If project is completed, contributors can withdraw their remaining contributions
            require(
                _amount <= contribution,
                "Withdrawal amount is greater than contribution"
            );
        } else {
            // If project is not completed and deadline has passed, contributors can withdraw their contributions
            require(
                _amount == contribution,
                "Withdrawal amount does not match contribution"
            );
        }

        require(
            project.completed && (project.balance < project.goal),
            "Cannot withdraw because goal completed"
        );

        contributions[_projectId][msg.sender] -= _amount;
        project.balance -= _amount;
        metaCoin.transfer(msg.sender, _amount);
    }

    function completeProject(uint256 _projectId) public {
        require(_projectId < numProjects, "Invalid project ID");

        Project storage project = projects[_projectId];
        require(
            msg.sender == project.owner,
            "Only project owner can complete the project"
        );
        require(!project.completed, "Project is already completed");

        require(
            project.deadline > block.timestamp,
            "Project deadline has not passed yet"
        );

        project.completed = true;
        uint256 balance = project.balance;
        if (project.balance >= project.goal) {
            metaCoin.transfer(project.owner, balance);
        }
    }

    function getBalance(uint256 _projectId) public view returns (uint256) {
        require(_projectId < numProjects, "Invalid project ID");

        Project storage project = projects[_projectId];
        return project.balance;
    }

    function getContribution(
        uint256 _projectId,
        address _contributor
    ) public view returns (uint256) {
        require(_projectId < numProjects, "Invalid project ID");

        return contributions[_projectId][_contributor];
    }
}
