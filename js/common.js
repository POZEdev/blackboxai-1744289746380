// Utility functions for the Finance App

// Format currency values
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Format date to Brazilian format
const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

// Local Storage Keys
const STORAGE_KEYS = {
    TRANSACTIONS: 'finance_transactions',
    CARDS: 'finance_cards',
    SETTINGS: 'finance_settings'
};

// Data Structure
const DataStructure = {
    // Get all transactions
    getTransactions() {
        try {
            const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
            return transactions ? JSON.parse(transactions) : [];
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },

    // Save transactions
    saveTransactions(transactions) {
        try {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
            return true;
        } catch (error) {
            console.error('Error saving transactions:', error);
            return false;
        }
    },

    // Get all cards
    getCards() {
        try {
            const cards = localStorage.getItem(STORAGE_KEYS.CARDS);
            return cards ? JSON.parse(cards) : [];
        } catch (error) {
            console.error('Error getting cards:', error);
            return [];
        }
    },

    // Save cards
    saveCards(cards) {
        try {
            localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
            return true;
        } catch (error) {
            console.error('Error saving cards:', error);
            return false;
        }
    },

    // Get settings
    getSettings() {
        try {
            const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : {
                salary: 0,
                extraIncome: 0,
                notifications: {
                    enabled: true,
                    daysBeforeDue: [1, 2, 3]
                }
            };
        } catch (error) {
            console.error('Error getting settings:', error);
            return {
                salary: 0,
                extraIncome: 0,
                notifications: {
                    enabled: true,
                    daysBeforeDue: [1, 2, 3]
                }
            };
        }
    },

    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
};

// Financial Calculations
const FinanceCalculations = {
    // Calculate total balance
    calculateTotalBalance() {
        const transactions = DataStructure.getTransactions();
        return transactions.reduce((total, transaction) => {
            return transaction.type === 'income' 
                ? total + transaction.amount 
                : total - transaction.amount;
        }, 0);
    },

    // Calculate monthly income
    calculateMonthlyIncome(month, year) {
        const transactions = DataStructure.getTransactions();
        const date = new Date(year, month);
        
        return transactions
            .filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transaction.type === 'income' &&
                    transactionDate.getMonth() === month &&
                    transactionDate.getFullYear() === year;
            })
            .reduce((total, transaction) => total + transaction.amount, 0);
    },

    // Calculate monthly expenses
    calculateMonthlyExpenses(month, year) {
        const transactions = DataStructure.getTransactions();
        const date = new Date(year, month);
        
        return transactions
            .filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transaction.type === 'expense' &&
                    transactionDate.getMonth() === month &&
                    transactionDate.getFullYear() === year;
            })
            .reduce((total, transaction) => total + transaction.amount, 0);
    },

    // Calculate card remaining limit
    calculateCardRemainingLimit(cardId) {
        const cards = DataStructure.getCards();
        const transactions = DataStructure.getTransactions();
        
        const card = cards.find(c => c.id === cardId);
        if (!card) return 0;

        const cardExpenses = transactions
            .filter(t => t.cardId === cardId && t.type === 'expense')
            .reduce((total, t) => total + t.amount, 0);

        return card.limit - cardExpenses;
    }
};

// Notification System
const NotificationSystem = {
    // Check for upcoming due dates
    checkUpcomingDueDates() {
        const settings = DataStructure.getSettings();
        if (!settings.notifications.enabled) return [];

        const transactions = DataStructure.getTransactions();
        const today = new Date();
        const notifications = [];

        transactions.forEach(transaction => {
            if (transaction.dueDate) {
                const dueDate = new Date(transaction.dueDate);
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                if (settings.notifications.daysBeforeDue.includes(daysUntilDue)) {
                    notifications.push({
                        transaction,
                        daysUntilDue
                    });
                }
            }
        });

        return notifications;
    }
};

// Export the utilities
window.FinanceApp = {
    formatCurrency,
    formatDate,
    DataStructure,
    FinanceCalculations,
    NotificationSystem
};
