const { setupLogging } = require('../middleware/logging');
const memoryStore = require('../utils/memoryStore');

// Get logger instance
const { logger } = setupLogging();

// Initialize loans in memory store
const initialLoans = [
  { id: 1, borrower_name: 'ABC Corp', funding_amount: 10000 },
  { id: 2, borrower_name: 'XYZ Ltd', funding_amount: 25000 },
  { id: 3, borrower_name: '123 Industries', funding_amount: 50000 }
];

// Store initial loans
memoryStore.set('loans', initialLoans);

class LoanService {
  getAllLoans() {
    logger.info('Service: Fetching all loans');
    const loans = memoryStore.get('loans') || [];
    const repayments = memoryStore.get('repayments') || [];

    // Map loans and include their repayments
    const loansWithRepayments = loans.map(loan => ({
      ...loan,
      repayments: repayments
        .filter(repayment => repayment.loan_id === loan.id)
        .map(({ repayment_amount, created_at }) => ({
          repayment_amount,
          created_at
        }))
    }));

    return loansWithRepayments;
  }

  getLoanById(id) {
    logger.info(`Service: Fetching loan with ID: ${id}`);
    const loans = memoryStore.get('loans') || [];
    const repayments = (memoryStore.get('repayments') || [])
      .filter(repayment => repayment.loan_id === id)
      .map(({ repayment_amount, created_at }) => ({
        repayment_amount,
        created_at
      }));
    const loan = loans.find(loan => loan.id === id);
    return loan ? { ...loan, repayments } : null;
  }

  getLoanByBorrowerName(name) {
    logger.info(`Service: Fetching loan with borrower name: ${name}`);
    const loans = memoryStore.get('loans') || [];
    const repayments = (memoryStore.get('repayments') || [])
      .filter(repayment => repayment.borrower_name === name)
      .map(({ repayment_amount, created_at }) => ({
        repayment_amount,
        created_at
      }));
    return { loan: loans.find(loan => loan.borrower_name === name), repayments } || null;
  }

  createLoan(loanData) {
    const loans = memoryStore.get('loans') || [];
    const newId = loans.length > 0 ? Math.max(...loans.map(loan => loan.id)) + 1 : 1;
    
    const newLoan = {
      id: newId,
      borrower_name: loanData.borrower_name,
      funding_amount: loanData.funding_amount,
      created_at: new Date().toISOString()
    };

    loans.push(newLoan);
    memoryStore.set('loans', loans);
    logger.info(`Service: Created new loan with ID: ${newId}`);
    
    return newLoan;
  }

  updateLoan(id, loanData) {
    const loans = memoryStore.get('loans') || [];
    const index = loans.findIndex(loan => loan.id === id);
    
    if (index === -1) {
      logger.error(`Service: Loan with ID ${id} not found`);
      return null;
    }
    const new_funding_amount = loans[index].funding_amount - loanData.repayment_amount;

    const updatedLoan = {
      ...loans[index],
      ...loanData,
      funding_amount: new_funding_amount,
      id: id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    const repayment = {
      loan_id: id,
      borrower_name: loans[index].borrower_name,
      repayment_amount: loanData.repayment_amount,
      created_at: new Date().toISOString()
    };

    const repayments = memoryStore.get('repayments') || [];
    repayments.push(repayment);
    memoryStore.set('repayments', repayments);

    loans[index] = updatedLoan;
    memoryStore.set('loans', loans);
    logger.info(`Service: Updated loan with ID: ${id}`);
    
    return updatedLoan;
  }

  deleteLoan(id) {
    const loans = memoryStore.get('loans') || [];
    const filteredLoans = loans.filter(loan => loan.id !== id);
    
    if (filteredLoans.length === loans.length) {
      logger.error(`Service: Loan with ID ${id} not found`);
      return false;
    }

    memoryStore.set('loans', filteredLoans);
    logger.info(`Service: Deleted loan with ID: ${id}`);
    return true;
  }
}

module.exports = new LoanService();