// Backup functionality

const BackupSystem = {
    exportData() {
        const data = {
            transactions: FinanceApp.DataStructure.getTransactions(),
            cards: FinanceApp.DataStructure.getCards(),
            settings: FinanceApp.DataStructure.getSettings(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!data.transactions || !data.cards || !data.settings) {
                        throw new Error('Arquivo de backup inválido');
                    }

                    // Import data
                    FinanceApp.DataStructure.saveTransactions(data.transactions);
                    FinanceApp.DataStructure.saveCards(data.cards);
                    FinanceApp.DataStructure.saveSettings(data.settings);

                    resolve('Dados importados com sucesso!');
                } catch (error) {
                    reject('Erro ao importar dados: ' + error.message);
                }
            };

            reader.onerror = () => reject('Erro ao ler arquivo');
            reader.readAsText(file);
        });
    }
};

// Make backup system available globally
window.BackupSystem = BackupSystem;
