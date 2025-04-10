// Analytics page functionality

document.addEventListener('DOMContentLoaded', () => {
    initializeAnalyticsPage();
    setupEventListeners();
});

let currentYear;
let currentMonth;
let incomeExpensesChart;
let expensesByCategoryChart;
let monthlyTrendsChart;

function initializeAnalyticsPage() {
    setupDateSelectors();
    loadAnalytics();
}

function setupDateSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const transactions = FinanceApp.DataStructure.getTransactions();
    
    // Get unique years from transactions
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];
    
    // If no transactions, add current year
    if (years.length === 0) {
        years.push(new Date().getFullYear());
    }
    
    // Sort years in descending order
    years.sort((a, b) => b - a);
    
    // Populate year select
    yearSelect.innerHTML = years.map(year => 
        `<option value="${year}">${year}</option>`
    ).join('');
    
    // Set current year and month
    currentYear = years[0];
    currentMonth = ''; // Empty string means entire year
}

function setupEventListeners() {
    document.getElementById('yearSelect').addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        loadAnalytics();
    });

    document.getElementById('monthSelect').addEventListener('change', (e) => {
        currentMonth = e.target.value;
        loadAnalytics();
    });
}

function loadAnalytics() {
    updateKPIs();
    updateCharts();
    updateTopExpenses();
}

function updateKPIs() {
    const transactions = filterTransactionsByDate(FinanceApp.DataStructure.getTransactions());
    
    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const netResult = totalIncome - totalExpenses;
    
    // Calculate savings rate
    const savingsRate = totalIncome > 0 
        ? ((totalIncome - totalExpenses) / totalIncome) * 100 
        : 0;

    // Update KPI displays
    document.getElementById('totalIncome').textContent = FinanceApp.formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = FinanceApp.formatCurrency(totalExpenses);
    document.getElementById('netResult').textContent = FinanceApp.formatCurrency(netResult);
    document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;
}

function updateCharts() {
    updateIncomeExpensesChart();
    updateExpensesByCategoryChart();
    updateMonthlyTrendsChart();
}

function updateIncomeExpensesChart() {
    const ctx = document.getElementById('incomeExpensesChart').getContext('2d');
    const transactions = filterTransactionsByDate(FinanceApp.DataStructure.getTransactions());
    
    // Prepare data
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const income = new Array(12).fill(0);
    const expenses = new Array(12).fill(0);
    
    transactions.forEach(transaction => {
        const month = new Date(transaction.date).getMonth();
        if (transaction.type === 'income') {
            income[month] += transaction.amount;
        } else {
            expenses[month] += transaction.amount;
        }
    });

    // Destroy existing chart if it exists
    if (incomeExpensesChart) {
        incomeExpensesChart.destroy();
    }

    // Create new chart
    incomeExpensesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Receitas',
                    data: income,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: expenses,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
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

function updateExpensesByCategoryChart() {
    const ctx = document.getElementById('expensesByCategoryChart').getContext('2d');
    const transactions = filterTransactionsByDate(FinanceApp.DataStructure.getTransactions());
    
    // Calculate expenses by category
    const categoryExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    // Prepare data for chart
    const categories = Object.keys(categoryExpenses);
    const amounts = Object.values(categoryExpenses);
    
    // Color palette for categories
    const colors = [
        'rgba(239, 68, 68, 0.7)',   // Red
        'rgba(34, 197, 94, 0.7)',   // Green
        'rgba(59, 130, 246, 0.7)',  // Blue
        'rgba(168, 85, 247, 0.7)',  // Purple
        'rgba(251, 191, 36, 0.7)',  // Yellow
        'rgba(236, 72, 153, 0.7)',  // Pink
        'rgba(14, 165, 233, 0.7)',  // Sky
        'rgba(249, 115, 22, 0.7)',  // Orange
        'rgba(139, 92, 246, 0.7)',  // Violet
        'rgba(20, 184, 166, 0.7)'   // Teal
    ];

    // Destroy existing chart if it exists
    if (expensesByCategoryChart) {
        expensesByCategoryChart.destroy();
    }

    // Create new chart
    expensesByCategoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${FinanceApp.formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateMonthlyTrendsChart() {
    const ctx = document.getElementById('monthlyTrendsChart').getContext('2d');
    const transactions = filterTransactionsByDate(FinanceApp.DataStructure.getTransactions());
    
    // Calculate monthly net result
    const monthlyData = new Array(12).fill(0);
    transactions.forEach(transaction => {
        const month = new Date(transaction.date).getMonth();
        monthlyData[month] += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    });

    // Destroy existing chart if it exists
    if (monthlyTrendsChart) {
        monthlyTrendsChart.destroy();
    }

    // Create new chart
    monthlyTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Resultado Mensal',
                data: monthlyData,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        callback: value => FinanceApp.formatCurrency(value)
                    }
                }
            }
        }
    });
}

function updateTopExpenses() {
    const transactions = filterTransactionsByDate(FinanceApp.DataStructure.getTransactions());
    
    // Get top 5 expenses
    const topExpenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const container = document.getElementById('topExpenses');
    container.innerHTML = '';

    topExpenses.forEach(expense => {
        const percentage = (expense.amount / transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0) * 100).toFixed(1);

        const div = document.createElement('div');
        div.className = 'flex items-center justify-between';
        div.innerHTML = `
            <div>
                <p class="text-sm font-medium text-gray-900">${expense.description}</p>
                <p class="text-sm text-gray-500">${expense.category}</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-medium text-gray-900">${FinanceApp.formatCurrency(expense.amount)}</p>
                <p class="text-sm text-gray-500">${percentage}% do total</p>
            </div>
        `;
        container.appendChild(div);
    });

    // Show message if no expenses
    if (topExpenses.length === 0) {
        container.innerHTML = `
            <p class="text-sm text-gray-500 text-center">
                Nenhuma despesa registrada no período
            </p>
        `;
    }
}

function filterTransactionsByDate(transactions) {
    return transactions.filter(transaction => {
        const date = new Date(transaction.date);
        const year = date.getFullYear();
        const month = date.getMonth();

        if (currentMonth === '') {
            // Filter by year only
            return year === currentYear;
        } else {
            // Filter by year and month
            return year === currentYear && month === parseInt(currentMonth);
        }
    });
}
