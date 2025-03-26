const { setupLogging } = require('../middleware/logging');
const memoryStore = require('../utils/memoryStore');
const { v4: uuidv4 } = require('uuid');

const { logger } = setupLogging();

// Initialize loans in memory store
const initialLoans = [
  { id: 1, borrower_name: 'ABC Corp', initial_funding_amount: 10000, current_loan_balance: 10000, borrower_id: uuidv4(), created_at: new Date().toISOString() },
  { id: 2, borrower_name: 'XYZ Ltd', initial_funding_amount: 25000, current_loan_balance: 25000, borrower_id: uuidv4(), created_at: new Date().toISOString() },
  { id: 3, borrower_name: '123 Industries', initial_funding_amount: 50000, current_loan_balance: 50000, borrower_id: uuidv4(), created_at: new Date().toISOString() }
];

// Store initial loans
memoryStore.set('loans', initialLoans);

class LoanService {
  getAllLoans(isAdmin, userId) {
    logger.info('Service: Fetching all loans');
    const loans = memoryStore.get('loans') || [];
    const repayments = memoryStore.get('repayments') || [];
    if (!isAdmin) {
      logger.error('Service: Unauthorized access attempt from user: ', { userId });
      throw new Error('Unauthorized: You can only view your own loans');
    }
    // Map loans and include their repayments
    const loansWithRepayments = loans.map(loan => ({
      ...loan,
      repayments: repayments.filter(repayment => repayment.loan_id === loan.id)
    }));

    return loansWithRepayments;
  }

  getLoanById(id, userId, isAdmin) {
    logger.info('Service: Fetching loan', { loanId: id });
    const loans = memoryStore.get('loans') || [];
    const loan = loans.find(loan => loan.id === id);

    if (!loan) {
      logger.warn('Service: Loan not found', { loanId: id });
      return null;
    }

    // Check if user owns this loan
    if (!isAdmin && loan.borrower_id !== userId) {
      logger.error('Service: Unauthorized loan access attempt', { loanId: id, requestedBy: userId });
      throw new Error('Unauthorized: You can only view your own loans');
    }

    const repayments = memoryStore.get('repayments') || [];
    return { ...loan, repayments: repayments.filter(r => r.loan_id === id) };
  }

  getLoansByBorrowerName(name, isAdmin, userId) {
    logger.info('Service: Fetching loans', { borrowerName: name, isAdmin, userId });
    const loans = memoryStore.get('loans') || [];
    const repayments = memoryStore.get('repayments') || [];
    const matchingLoans = loans.filter(loan => loan.borrower_name === name);

    if (!matchingLoans.length) {
      logger.warn('Service: No loans found', { borrowerName: name }); 
      return [];
    }

    // Add repayments to each loan
    const loansWithRepayments = matchingLoans.map(loan => ({
      ...loan,
      repayments: repayments.filter(r => r.loan_id === loan.id)
    }));

    // For non-admin users, only return their own loans
    if (!isAdmin) {
      const userLoans = loansWithRepayments.filter(loan => loan.borrower_id === userId);
      if (!userLoans.length) {
        logger.error('Service: Unauthorized access attempt', { userId });
        throw new Error('Unauthorized: You can only view your own loans');
      }
      return userLoans;
    }

    return loansWithRepayments;
  }

  createLoan({ borrower_name, initial_funding_amount, user }) {
    const loans = memoryStore.get('loans') || [];
    const newId = loans.length + 1;
    const userId = user.id;
    const isAdmin = user.role === 'admin';

    const users = memoryStore.get('users') || [];
    const borrower_id = users.find(user => user.username === borrower_name)?.id;
    
    if (borrower_id != userId && !isAdmin) {
      logger.error('Service: Unauthorized loan creation attempt', { borrowerId: borrower_id, requestedBy: userId });
      throw new Error('Unauthorized: You can only create your own loans');
    }

    logger.info('Service: Creating new loan', { borrowerName: borrower_name });

    const newLoan = {
      id: newId,
      borrower_name,
      borrower_id,
      initial_funding_amount,
      current_loan_balance: initial_funding_amount,
      created_at: new Date().toISOString()
    };

    loans.push(newLoan);
    memoryStore.set('loans', loans);
    logger.info('Service: Loan created successfully', { loanId: newId });

    return newLoan;
  }

  updateLoan(loan_id, { repayment_amount, borrower_id }, isAdmin) {
    const loans = memoryStore.get('loans') || [];
    const loan = loans.find(l => l.id === loan_id);

    if (!loan) {
      logger.warn('Service: Loan not found', { loanId: loan_id });
      return null;
    }

    // Check if the user owns this loan
    if (!isAdmin && loan.borrower_id !== borrower_id) {
      logger.error('Service: Unauthorized loan update attempt', { loanId: loan_id, requestedBy: borrower_id });
      throw new Error('Unauthorized: You can only update your own loans');
    }

    // Calculate new funding amount
    const new_funding_amount = loan.current_loan_balance - repayment_amount;
    if (new_funding_amount < 0) {
      logger.error('Service: Invalid repayment amount', { 
        loanId: loan_id, 
        currentAmount: loan.current_loan_balance, 
        repaymentAmount: repayment_amount 
      });
      throw new Error('Repayment amount cannot exceed remaining loan amount');
    }

    // Update loan funding amount
    const loanIndex = loans.findIndex(l => l.id === loan_id);
    loans[loanIndex] = {
      ...loan,
      current_loan_balance: new_funding_amount,
      updated_at: new Date().toISOString()
    };
    memoryStore.set('loans', loans);

    // Add repayment record
    const repayments = memoryStore.get('repayments') || [];
    const newRepayment = {
      loan_id: loan_id,
      repayment_amount,
      created_at: new Date().toISOString()
    };

    repayments.push(newRepayment);
    memoryStore.set('repayments', repayments);
    
    logger.info('Service: Loan updated successfully', { 
      loanId: loan_id, 
      newFundingAmount: new_funding_amount 
    });
    
    return { 
      ...loans[loanIndex], 
      repayments: repayments.filter(r => r.loan_id === loan_id) 
    };
  }

  deleteLoan(id, userId, isAdmin) {
    const loans = memoryStore.get('loans') || [];
    const loan = loans.find(loan => loan.id === id);

    if (!loan) {
      logger.warn('Service: Loan not found', { loanId: id });
      return null;
    }

    // Check if user owns this loan
    if (!isAdmin && loan.borrower_id !== userId) {
      logger.error('Service: Unauthorized loan deletion attempt', { loanId: id, requestedBy: userId });
      throw new Error('Unauthorized: You can only delete your own loans');
    }

    const updatedLoans = loans.filter(loan => loan.id !== id);
    memoryStore.set('loans', updatedLoans);

    // Also remove associated repayments
    const repayments = memoryStore.get('repayments') || [];
    const updatedRepayments = repayments.filter(repayment => repayment.loan_id !== id);
    memoryStore.set('repayments', updatedRepayments);

    logger.info('Service: Loan deleted successfully', { loanId: id });
    return true;
  }
}

module.exports = new LoanService();