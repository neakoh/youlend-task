const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');

// Get all loans
router.get('/', authenticateToken, loanController.getAllLoans.bind(loanController));

// Get loan by ID
router.get('/id', authenticateToken, loanController.getLoanById.bind(loanController));

// Get loan by borrower name
router.get('/name', authenticateToken, loanController.getLoansByBorrowerName.bind(loanController));

// Create a new loan
router.post('/', authenticateToken, loanController.createLoan.bind(loanController));

// Update a loan
router.put('/', authenticateToken, loanController.updateLoan.bind(loanController));

// Delete a loan
router.delete('/', authenticateToken, loanController.deleteLoan.bind(loanController));

// Simulate an error
router.get('/error', loanController.simulateError.bind(loanController));

module.exports = router; 
