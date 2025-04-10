// Transactions page functionality

document.addEventListener('DOMContentLoaded', () => {
    initializeTransactionsPage();
    loadCards();
    setupEventListeners();
});

let currentPage = 1;
const itemsPerPage = 10;
let filteredTransactions = [];

function initializeTransactionsPage() {
    loadTransactions();
    setupInstallmentToggle();
    setDefaultDate();
}

function setDefaultDate() {
    const dateInput = document.querySelector('input[name="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function setupInstallmentToggle() {
    const installmentCheckbox = document.getElementById('isInstallment');
    const installmentFields = document.getElementById('installmentFields');

    installmentCheckbox.addEventListener('change', (e) => {
        installmentFields.classList.toggle('hidden', !e.target.checked);
    });
}

function loadCards() {
    const cards = FinanceApp.DataStructure.getCards();
    const cardSelect = document.getElementById('cardSelect');
    
    // Clear existing options except the first one
    cardSelect.innerHTML = '<option value="">Selecione um cartão</option>';
    
    // Add cards to select
    cards.forEach(card => {
        const option = document.createElement('option');
        option.value = card.id;
        option.textContent = `${card.name} (Limite disponível: ${FinanceApp.formatCurrency(FinanceApp.FinanceCalculations.calculateCardRemainingLimit(card.id))})`;
        cardSelect.appendChild(option);
    });
}

function setupEventListeners() {
    // Form submission
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    
    // Search and filter
    document.getElementById('searchTransaction').addEventListener('input', handleSearch);
    document.getElementById('filterCategory').addEventListener('change', handleFilter);
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const transaction = {
        id: Date.now().toString(),
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date'),
        type: formData.get('type'),
        category: formData.get('category'),
        cardId: formData.get('cardId') || null
    };

    // Handle installments
    if (formData.get('isInstallment')) {
        const totalInstallments = parseInt(formData.get('totalInstallments'));
        if (totalInstallments > 1) {
            const installmentAmount = transaction.amount / totalInstallments;
            const baseDate = new Date(transaction.date);
            
            // Create multiple transactions for installments
            for (let i = 0; i < totalInstallments; i++) {
                const installmentDate = new Date(baseDate);
                installmentDate.setMonth(baseDate.getMonth() + i);
                
                const installmentTransaction = {
                    ...transaction,
                    id: Date.now().toString() + i,
                    amount: installmentAmount,
                    date: installmentDate.toISOString().split('T')[0],
                    description: `${transaction.description} (${i + 1}/${totalInstallments})`
                };
                
                saveTransaction(installmentTransaction);
            }
        }
    } else {
        saveTransaction(transaction);
    }

    // Reset form and reload data
    e.target.reset();
    setDefaultDate();
    loadTransactions();
    
    // Show success message
    showNotification('Transação adicionada com sucesso!', 'success');
}

function saveTransaction(transaction) {
    const transactions = FinanceApp.DataStructure.getTransactions();
    transactions.push(transaction);
    FinanceApp.DataStructure.saveTransactions(transactions);
}

function loadTransactions() {
    const transactions = FinanceApp.DataStructure.getTransactions();
    filteredTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply current filters
    const searchTerm = document.getElementById('searchTransaction').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
    }
    
    displayTransactions();
    updatePagination();
}

function displayTransactions() {
    const tbody = document.getElementById('transactionsList');
    tbody.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(start, end);
    
    paginatedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Get card name if transaction has cardId
        let cardName = '';
        if (transaction.cardId) {
            const cards = FinanceApp.DataStructure.getCards();
            const card = cards.find(c => c.id === transaction.cardId);
            cardName = card ? card.name : '';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${FinanceApp.formatDate(transaction.date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${transaction.description}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${transaction.category}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${cardName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                ${FinanceApp.formatCurrency(transaction.amount)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onclick="deleteTransaction('${transaction.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('transactionCount').textContent = filteredTransactions.length;
}

function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        const transactions = FinanceApp.DataStructure.getTransactions();
        const updatedTransactions = transactions.filter(t => t.id !== id);
        FinanceApp.DataStructure.saveTransactions(updatedTransactions);
        
        loadTransactions();
        showNotification('Transação excluída com sucesso!', 'success');
    }
}

function handleSearch(e) {
    currentPage = 1;
    loadTransactions();
}

function handleFilter(e) {
    currentPage = 1;
    loadTransactions();
}

function changePage(delta) {
    const maxPage = Math.ceil(filteredTransactions.length / itemsPerPage);
    const newPage = currentPage + delta;
    
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        displayTransactions();
        updatePagination();
    }
}

function updatePagination() {
    const maxPage = Math.ceil(filteredTransactions.length / itemsPerPage);
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === maxPage;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Make deleteTransaction available globally
window.deleteTransaction = deleteTransaction;
