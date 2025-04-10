// Settings page functionality

document.addEventListener('DOMContentLoaded', () => {
    initializeSettingsPage();
    setupEventListeners();
});

function initializeSettingsPage() {
    loadSettings();
    setupNotificationsToggle();
}

function setupEventListeners() {
    document.getElementById('addExtraIncome').addEventListener('click', addExtraIncomeField);
    document.getElementById('saveSettings').addEventListener('click', saveAllSettings);
    document.getElementById('notificationsToggle').addEventListener('click', toggleNotifications);
}

function loadSettings() {
    const settings = FinanceApp.DataStructure.getSettings();
    
    // Load income settings
    document.getElementById('salary').value = settings.salary || '';
    document.getElementById('salaryDay').value = settings.salaryDay || '';
    
    // Load extra income
    const container = document.getElementById('extraIncomeContainer');
    container.innerHTML = ''; // Clear existing fields
    
    if (settings.extraIncome && settings.extraIncome.length > 0) {
        settings.extraIncome.forEach(income => {
            addExtraIncomeField(income);
        });
    } else {
        addExtraIncomeField(); // Add one empty field by default
    }
    
    // Load notification settings
    const notificationsEnabled = settings.notifications?.enabled ?? true;
    updateNotificationsToggle(notificationsEnabled);
    document.getElementById('notificationOptions').style.display = notificationsEnabled ? 'block' : 'none';
    
    // Set notification checkboxes
    const daysBeforeDue = settings.notifications?.daysBeforeDue || [1, 2, 3];
    document.querySelectorAll('input[name="daysBeforeDue"]').forEach(checkbox => {
        checkbox.checked = daysBeforeDue.includes(parseInt(checkbox.value));
    });
    
    document.querySelector('input[name="notifyDueDates"]').checked = settings.notifications?.notifyDueDates ?? true;
    document.querySelector('input[name="notifyLowBalance"]').checked = settings.notifications?.notifyLowBalance ?? true;
    document.querySelector('input[name="notifyHighExpenses"]').checked = settings.notifications?.notifyHighExpenses ?? true;
}

function addExtraIncomeField(existingIncome = null) {
    const container = document.getElementById('extraIncomeContainer');
    const incomeId = Date.now();
    
    const incomeField = document.createElement('div');
    incomeField.className = 'flex space-x-4 items-start';
    incomeField.innerHTML = `
        <div class="flex-grow">
            <input type="text" placeholder="Descrição"
                value="${existingIncome?.description || ''}"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
        </div>
        <div class="w-1/3">
            <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input type="number" step="0.01" min="0" placeholder="Valor"
                    value="${existingIncome?.amount || ''}"
                    class="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            </div>
        </div>
        <button type="button" onclick="removeExtraIncomeField(this)"
            class="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(incomeField);
}

function removeExtraIncomeField(button) {
    const field = button.parentElement;
    const container = field.parentElement;
    
    // Don't remove if it's the last field
    if (container.children.length > 1) {
        field.remove();
    } else {
        // Clear the inputs if it's the last field
        field.querySelectorAll('input').forEach(input => input.value = '');
    }
}

function setupNotificationsToggle() {
    const toggle = document.getElementById('notificationsToggle');
    const settings = FinanceApp.DataStructure.getSettings();
    
    updateNotificationsToggle(settings.notifications?.enabled ?? true);
}

function updateNotificationsToggle(enabled) {
    const toggle = document.getElementById('notificationsToggle');
    const toggleSpan = toggle.querySelector('span');
    
    if (enabled) {
        toggle.classList.add('bg-indigo-600');
        toggle.classList.remove('bg-gray-200');
        toggleSpan.classList.add('translate-x-5');
        toggleSpan.classList.remove('translate-x-0');
    } else {
        toggle.classList.remove('bg-indigo-600');
        toggle.classList.add('bg-gray-200');
        toggleSpan.classList.remove('translate-x-5');
        toggleSpan.classList.add('translate-x-0');
    }
}

function toggleNotifications() {
    const notificationOptions = document.getElementById('notificationOptions');
    const isEnabled = notificationOptions.style.display === 'none';
    
    notificationOptions.style.display = isEnabled ? 'block' : 'none';
    updateNotificationsToggle(isEnabled);
}

function saveAllSettings() {
    // Gather all settings
    const settings = {
        salary: parseFloat(document.getElementById('salary').value) || 0,
        salaryDay: parseInt(document.getElementById('salaryDay').value) || 1,
        extraIncome: getExtraIncomeSettings(),
        notifications: {
            enabled: document.getElementById('notificationOptions').style.display !== 'none',
            daysBeforeDue: Array.from(document.querySelectorAll('input[name="daysBeforeDue"]:checked'))
                .map(checkbox => parseInt(checkbox.value)),
            notifyDueDates: document.querySelector('input[name="notifyDueDates"]').checked,
            notifyLowBalance: document.querySelector('input[name="notifyLowBalance"]').checked,
            notifyHighExpenses: document.querySelector('input[name="notifyHighExpenses"]').checked
        }
    };

    // Save settings
    FinanceApp.DataStructure.saveSettings(settings);
    
    // Show success message
    showNotification('Configurações salvas com sucesso!');
}

function getExtraIncomeSettings() {
    const extraIncomeFields = document.getElementById('extraIncomeContainer').children;
    const extraIncome = [];
    
    Array.from(extraIncomeFields).forEach(field => {
        const description = field.querySelector('input[type="text"]').value;
        const amount = parseFloat(field.querySelector('input[type="number"]').value);
        
        if (description && amount > 0) {
            extraIncome.push({ description, amount });
        }
    });
    
    return extraIncome;
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

// Make functions available globally
window.removeExtraIncomeField = removeExtraIncomeField;
