const loanService = require('../services/loanService');
const { setupLogging } = require('../middleware/logging');

// Get logger instance
const { logger } = setupLogging();

class LoanController {
  getAllLoans(req, res) {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;
    logger.info('Controller: Fetching all loans');
    const loans = loanService.getAllLoans(isAdmin, userId);
    res.json(loans);
  }

  getLoanById(req, res) {
    const id = req.body.id;  
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!id) {
      logger.warn('Controller: Missing loan ID');
      return res.status(400).json({ message: 'Please provide a loan ID' });
    }
    
    logger.info(`Controller: Fetching loan with id: ${id}`);
    
    try {
      const loan = loanService.getLoanById(id, userId, isAdmin);
      
      if (!loan) {
        logger.warn(`Controller: Loan not found with id: ${id}`);
        return res.status(404).json({ message: 'Loan not found' });
      }
      
      res.json(loan);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        logger.error(`Controller: Unauthorized loan access attempt for loan id: ${id}`);
        return res.status(403).json({ message: error.message });
      }
      logger.error(`Controller: Error fetching loan with id: ${id}. Error: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  getLoansByBorrowerName(req, res) {
    const name = req.body.borrower_name || req.user.username;
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    logger.info(`Controller: Fetching loans by borrower name: ${name}, role: ${req.user.role}`);
    
    const loans = loanService.getLoansByBorrowerName(name, isAdmin, userId);

    res.json(loans);
  }

  createLoan(req, res) {
    const initial_funding_amount = req.body.initial_funding_amount;  
    const borrower_name = req.body.borrower_name || req.user.username;
    const user = req.user

    if (!borrower_name || !initial_funding_amount) {
      logger.warn('Controller: Invalid loan creation request', { body: req.body });
      return res.status(400).json({ message: 'Please provide initial_funding_amount' });
    }

    // Validate funding amount is a number
    const amount = parseFloat(initial_funding_amount);
    if (isNaN(amount) || amount <= 0) {
      logger.warn('Controller: Invalid funding amount', { initial_funding_amount });
      return res.status(400).json({ message: 'Initial funding amount must be a positive number' });
    }
    
    const newLoan = loanService.createLoan({ borrower_name, initial_funding_amount: amount, user });
    logger.info('Controller: New loan created', { loanId: newLoan.id });
    
    res.status(201).json(newLoan);
  }

  updateLoan(req, res) {
    const loan_id = req.body.loan_id;  
    const repayment_amount = req.body.repayment_amount;
    const borrower_id = req.user.id;  
    const isAdmin = req.user.role === 'admin';
    
    if (!loan_id) {
      logger.warn('Controller: Missing loan ID');
      return res.status(400).json({ message: 'Please provide a loan ID' });
    }
    
    logger.info(`Controller: Processing loan update request for loan id: ${loan_id}`);
    
    try {
      const updatedLoan = loanService.updateLoan(loan_id, { repayment_amount, borrower_id }, isAdmin);
      
      if (!updatedLoan) {
        logger.warn(`Controller: Loan not found for update for loan id: ${loan_id}`);
        return res.status(404).json({ message: 'Loan not found' });
      }
      
      logger.info(`Controller: Loan updated successfully for loan id: ${loan_id}`);
      res.json(updatedLoan);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        logger.error(`Controller: Unauthorized loan update attempt for loan id: ${loan_id} by user id: ${borrower_id}`);
        return res.status(403).json({ message: error.message });
      }
      logger.error(`Controller: Error updating loan for loan id: ${loan_id}. Error: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  deleteLoan(req, res) {
    const id = req.body.id;  
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!id) {
      logger.warn('Controller: Missing loan ID');
      return res.status(400).json({ message: 'Please provide a loan ID' });
    }

    logger.info(`Controller: Processing loan deletion request for loan id: ${id}`);

    try {
      const result = loanService.deleteLoan(id, userId, isAdmin);
      
      if (result === null) {
        logger.warn(`Controller: Loan not found for deletion for loan id: ${id}`);
        return res.status(404).json({ message: 'Loan not found' });
      }
      
      logger.info(`Controller: Loan deleted successfully for loan id: ${id}`);
      res.status(200).json({ message: 'Loan deleted successfully' });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        logger.error(`Controller: Unauthorized loan deletion attempt for loan id: ${id} by user id: ${userId}`);
        return res.status(403).json({ message: error.message });
      }
      logger.error(`Controller: Error deleting loan for loan id: ${id}. Error: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new LoanController();