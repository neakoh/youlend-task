const loanService = require('../services/loanService');
const { setupLogging } = require('../middleware/logging');

// Get logger instance
const { logger } = setupLogging();

class LoanController {
  getAllLoans(req, res) {
    logger.info('Controller: Fetching all loans');
    const loans = loanService.getAllLoans();
    res.json(loans);
  }

  getLoanById(req, res) {
    const id = parseInt(req.body.id);
    logger.info(`Controller: Fetching loan with ID: ${id}`);
    
    const loan = loanService.getLoanById(id);
    
    if (!loan) {
      logger.warn(`Controller: Loan with ID ${id} not found`);
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    res.json(loan);
  }

  getLoanByBorrowerName(req, res) {
    const name = req.body.borrower_name;
    logger.info(`Controller: Fetching loan with borrower name: ${name}`);
    
    const loan = loanService.getLoanByBorrowerName(name);
    
    if (!loan) {
      logger.warn(`Controller: Loan with borrower name ${name} not found`);
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    res.json(loan);
  }

  createLoan(req, res) {
    const { borrower_name, funding_amount } = req.body;
    
    // Validate request
    if (!borrower_name || !funding_amount) {
      logger.warn('Controller: Invalid loan creation request', { body: req.body });
      return res.status(400).json({ message: 'Please provide borrower_name and funding_amount' });
    }
    
    const newLoan = loanService.createLoan({ borrower_name, funding_amount });
    logger.info('Controller: New loan created', { loanId: newLoan.id });
    
    res.status(201).json(newLoan);
  }

  updateLoan(req, res) {
    const id = parseInt(req.body.id);
    const repayment_amount = req.body.repayment_amount;
    
    logger.info(`Controller: Updating loan with ID: ${id}`);
    
    const updatedLoan = loanService.updateLoan(id, { repayment_amount });
    
    if (!updatedLoan) {
      logger.warn(`Controller: Loan with ID ${id} not found for update`);
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    res.json(updatedLoan);
  }

  deleteLoan(req, res) {
    const id = parseInt(req.body.id);
    logger.info(`Controller: Deleting loan with ID: ${id}`);
    
    const deleted = loanService.deleteLoan(id);
    
    if (!deleted) {
      logger.warn(`Controller: Loan with ID ${id} not found for deletion`);
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    res.status(204).send();
  }

  simulateError(req, res, next) {
    logger.info('Controller: Simulating an error');
    const error = new Error('This is a simulated error');
    error.statusCode = 500;
    next(error);
  }
}

module.exports = new LoanController();