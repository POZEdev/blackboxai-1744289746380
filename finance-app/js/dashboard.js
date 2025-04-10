// Dashboard functionality

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupCharts();
    loadRecentTransactions();
});

function initializeDashboard() {
    // Update summary cards
    updateSummaryCards();
    
    // Check for notifications
    checkNotifications();
}

function updateSummaryCards() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Update total balance
    const totalBalance = FinanceApp.FinanceCalculations.calculateTotalBalance();
    document.getElementById('totalBalance').textContent = FinanceApp.formatCurrency(totalBalance);

    // Update monthly income
    const monthlyIncome = FinanceApp.FinanceCalculations.calculateMonthlyIncome(currentMonth, currentYear);
    document.getElementById('monthlyIncome').textContent = FinanceApp.formatCurrency(monthlyIncome);

    // Update monthly expenses
    const monthlyExpenses = FinanceApp.FinanceCalculations.calculateMonthlyExpenses(currentMonth, currentYear);
    document.getElementById('monthlyExpenses').textContent = FinanceApp.formatCurrency(monthlyExpenses);

    // Update monthly result
    const monthlyResult = monthlyIncome - monthlyExpenses;
    document.getElementById('monthlyResult').textContent = FinanceApp.formatCurrency(monthlyResult);
}

function setupCharts() {
    setupMonthlyChart();
    setupYearlyChart();
}

function setupMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get daily data for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    const transactions = FinanceApp.DataStructure.getTransactions();
    const dailyIncome = Array(daysInMonth).fill(0);
    const dailyExpenses = Array(daysInMonth).fill(0);
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const day = date.getDate() - 1;
            if (transaction.type === 'income') {
                dailyIncome[day] += transaction.amount;
            } else {
                dailyExpenses[day] += transaction.amount;
            }
        }
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: dailyIncome,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: dailyExpenses,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Fluxo Financeiro Diário'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => FinanceApp.formatCurrency(value)
                    }
                }
            }
        }
    });
}

function setupYearlyChart() {
    const ctx = document.getElementById('yearlyChart').getContext('2d');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Get monthly data for the current year
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);
    const monthlyBalance = Array(12).fill(0);

    for (let month = 0; month < 12; month++) {
        monthlyIncome[month] = FinanceApp.FinanceCalculations.calculateMonthlyIncome(month, currentYear);
        monthlyExpenses[month] = FinanceApp.FinanceCalculations.calculateMonthlyExpenses(month, currentYear);
        monthlyBalance[month] = monthlyIncome[month] - monthlyExpenses[month];
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Receitas',
                    data: monthlyIncome,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)'
                },
                {
                    label: 'Despesas',
                    data: monthlyExpenses,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)'
                },
                {
                    label: 'Saldo',
                    data: monthlyBalance,
                    type: 'line',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Visão Anual'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => FinanceApp.formatCurrency(value)
                    }
                }
            }
        }
    });
}

function loadRecentTransactions() {
    const transactions = FinanceApp.DataStructure.getTransactions()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5); // Get only the 5 most recent transactions

    const tbody = document.getElementById('recentTransactions');
    tbody.innerHTML = ''; // Clear existing content

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
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
            <td class="px-6 py-4 whitespace-nowrap text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                ${FinanceApp.formatCurrency(transaction.amount)}
            </td>
        `;
        tbody.appendChild(row);
    });

    // If no transactions, show a message
    if (transactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                Nenhuma transação encontrada
            </td>
        `;
        tbody.appendChild(row);
    }
}

function checkNotifications() {
    const notifications = FinanceApp.NotificationSystem.checkUpcomingDueDates();
    
    // If there are notifications, we could show them in a notification area
    // For now, we'll just log them to console
    notifications.forEach(notification => {
        console.log(`Lembrete: ${notification.transaction.description} vence em ${notification.daysUntilDue} dias`);
    });
}

// Update dashboard data every minute
setInterval(initializeDashboard, 60000);
