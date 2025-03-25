const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');

// Get all loans
router.get('/loans', loanController.getAllLoans.bind(loanController));

// Get loan by ID
router.get('/loans/id', authenticateToken, loanController.getLoanById.bind(loanController));

// Get loan by borrower name
router.get('/loans/name', loanController.getLoanByBorrowerName.bind(loanController));

// Create a new loan
router.post('/loans', authenticateToken, loanController.createLoan.bind(loanController));

// Update a loan
router.put('/loans', authenticateToken, loanController.updateLoan.bind(loanController));

// Delete a loan
router.delete('/loans', authenticateToken, loanController.deleteLoan.bind(loanController));

// Simulate an error
router.get('/error', loanController.simulateError.bind(loanController));

module.exports = router;
