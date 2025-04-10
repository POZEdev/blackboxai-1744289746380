// Cards page functionality

document.addEventListener('DOMContentLoaded', () => {
    initializeCardsPage();
    setupEventListeners();
});

function initializeCardsPage() {
    loadCards();
    checkDueNotifications();
}

function setupEventListeners() {
    document.getElementById('cardForm').addEventListener('submit', handleCardSubmit);
}

function handleCardSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const card = {
        id: Date.now().toString(),
        name: formData.get('name'),
        limit: parseFloat(formData.get('limit')),
        dueDay: parseInt(formData.get('dueDay')),
        color: formData.get('color'),
        createdAt: new Date().toISOString()
    };

    // Save new card
    const cards = FinanceApp.DataStructure.getCards();
    cards.push(card);
    FinanceApp.DataStructure.saveCards(cards);

    // Reset form and reload cards
    e.target.reset();
    loadCards();
    
    // Show success message
    showNotification('Cartão adicionado com sucesso!', 'success');
}

function loadCards() {
    const cards = FinanceApp.DataStructure.getCards();
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';

    cards.forEach(card => {
        const usedLimit = calculateUsedLimit(card.id);
        const availableLimit = card.limit - usedLimit;
        const usagePercentage = (usedLimit / card.limit) * 100;

        const cardElement = document.createElement('div');
        cardElement.className = `bg-${card.color}-50 rounded-lg shadow-lg overflow-hidden`;
        cardElement.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${card.name}</h3>
                        <p class="text-sm text-gray-600">Vencimento: dia ${card.dueDay}</p>
                    </div>
                    <button onclick="deleteCard('${card.id}')" class="text-gray-400 hover:text-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">Limite Utilizado</span>
                            <span class="text-gray-900">${FinanceApp.formatCurrency(usedLimit)}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-${card.color}-600 h-2 rounded-full" style="width: ${usagePercentage}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Limite Total</p>
                            <p class="text-lg font-semibold text-gray-900">${FinanceApp.formatCurrency(card.limit)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Disponível</p>
                            <p class="text-lg font-semibold ${availableLimit < 0 ? 'text-red-600' : 'text-green-600'}">
                                ${FinanceApp.formatCurrency(availableLimit)}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <button onclick="showInstallments('${card.id}')"
                        class="text-sm text-${card.color}-600 hover:text-${card.color}-700">
                        <i class="fas fa-clock mr-1"></i>
                        Ver Parcelas Futuras
                    </button>
                </div>
            </div>
        `;
        
        cardsGrid.appendChild(cardElement);
    });

    // Show message if no cards
    if (cards.length === 0) {
        cardsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-credit-card text-gray-400 text-4xl mb-4"></i>
                <p class="text-gray-500">Nenhum cartão cadastrado</p>
                <p class="text-sm text-gray-400">Adicione um cartão usando o formulário acima</p>
            </div>
        `;
    }
}

function calculateUsedLimit(cardId) {
    const transactions = FinanceApp.DataStructure.getTransactions();
    return transactions
        .filter(t => t.cardId === cardId && t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);
}

function deleteCard(cardId) {
    if (confirm('Tem certeza que deseja excluir este cartão? Todas as transações associadas serão mantidas.')) {
        const cards = FinanceApp.DataStructure.getCards();
        const updatedCards = cards.filter(c => c.id !== cardId);
        FinanceApp.DataStructure.saveCards(updatedCards);
        
        loadCards();
        showNotification('Cartão excluído com sucesso!', 'success');
    }
}

function showInstallments(cardId) {
    const transactions = FinanceApp.DataStructure.getTransactions();
    const futureInstallments = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const today = new Date();
        return t.cardId === cardId && 
               t.type === 'expense' && 
               transactionDate > today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const tbody = document.getElementById('installmentsList');
    tbody.innerHTML = '';

    futureInstallments.forEach(installment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${FinanceApp.formatDate(installment.date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${installment.description}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${FinanceApp.formatCurrency(installment.amount)}
            </td>
        `;
        tbody.appendChild(row);
    });

    // Show message if no installments
    if (futureInstallments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma parcela futura encontrada
                </td>
            </tr>
        `;
    }

    document.getElementById('installmentsModal').classList.remove('hidden');
}

function closeInstallmentsModal() {
    document.getElementById('installmentsModal').classList.add('hidden');
}

function checkDueNotifications() {
    const cards = FinanceApp.DataStructure.getCards();
    const today = new Date();
    const currentDay = today.getDate();
    
    cards.forEach(card => {
        const daysUntilDue = getDaysUntilDue(currentDay, card.dueDay);
        if (daysUntilDue <= 3 && daysUntilDue > 0) {
            showNotification(
                `Fatura do cartão ${card.name} vence em ${daysUntilDue} dias!`,
                'warning'
            );
        }
    });
}

function getDaysUntilDue(currentDay, dueDay) {
    if (dueDay < currentDay) {
        // Due date is in next month
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return (lastDayOfMonth - currentDay) + dueDay;
    }
    return dueDay - currentDay;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Make functions available globally
window.deleteCard = deleteCard;
window.showInstallments = showInstallments;
window.closeInstallmentsModal = closeInstallmentsModal;
