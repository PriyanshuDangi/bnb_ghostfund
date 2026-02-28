// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * GhostPaymaster accepts BEP-20 fee payments from users and reimburses
 * the relayer for BNB gas spent on unshield transactions.
 *
 * Phase 1 (hackathon): Fees are deducted from the unshielded WBNB amount
 *   inside the Railgun SDK — this contract is not used in Phase 1.
 *
 * Phase 2: This contract provides a trustless, on-chain alternative
 *   where users deposit fee tokens and the relayer claims reimbursement.
 */
contract GhostPaymaster is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public relayer;
    uint256 public feeBasisPoints; // e.g., 50 = 0.5%

    mapping(address => mapping(address => uint256)) public feeDeposits; // user => token => amount

    event FeeDeposited(address indexed user, address indexed token, uint256 amount);
    event GasReimbursed(address indexed relayer, uint256 amount);
    event RelayerUpdated(address indexed oldRelayer, address indexed newRelayer);
    event FeeBasisPointsUpdated(uint256 oldBps, uint256 newBps);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "GhostPaymaster: caller is not relayer");
        _;
    }

    constructor(address _relayer, uint256 _feeBasisPoints) Ownable(msg.sender) {
        require(_relayer != address(0), "GhostPaymaster: zero relayer address");
        require(_feeBasisPoints <= 1000, "GhostPaymaster: fee too high"); // max 10%
        relayer = _relayer;
        feeBasisPoints = _feeBasisPoints;
    }

    /// @notice User deposits BEP-20 tokens as fee payment
    function depositFee(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "GhostPaymaster: zero amount");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        feeDeposits[msg.sender][token] = feeDeposits[msg.sender][token] + amount;
        emit FeeDeposited(msg.sender, token, amount);
    }

    /// @notice Relayer claims BNB reimbursement for gas spent
    function claimGasReimbursement(uint256 gasUsed, uint256 gasPrice) external onlyRelayer nonReentrant {
        uint256 reimbursement = gasUsed * gasPrice;
        require(address(this).balance >= reimbursement, "GhostPaymaster: insufficient BNB");
        (bool success, ) = relayer.call{value: reimbursement}("");
        require(success, "GhostPaymaster: BNB transfer failed");
        emit GasReimbursed(relayer, reimbursement);
    }

    /// @notice Calculate fee for a given amount
    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * feeBasisPoints) / 10000;
    }

    /// @notice Owner updates the relayer address
    function setRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "GhostPaymaster: zero address");
        emit RelayerUpdated(relayer, _relayer);
        relayer = _relayer;
    }

    /// @notice Owner updates the fee basis points
    function setFeeBasisPoints(uint256 _feeBasisPoints) external onlyOwner {
        require(_feeBasisPoints <= 1000, "GhostPaymaster: fee too high");
        emit FeeBasisPointsUpdated(feeBasisPoints, _feeBasisPoints);
        feeBasisPoints = _feeBasisPoints;
    }

    /// @notice Owner withdraws accumulated fee tokens
    function withdrawFeeTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /// @notice Accept BNB deposits (for gas reimbursement pool)
    receive() external payable {}
}
