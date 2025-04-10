# Finance App

Aplicativo de controle financeiro pessoal com suporte a múltiplos cartões, transações parceladas e análise detalhada de gastos.

## Funcionalidades

- Dashboard com visão geral financeira
- Gerenciamento de transações (receitas e despesas)
- Controle de cartões de crédito
- Análise financeira detalhada
- Notificações de vencimentos
- Suporte a pagamentos parcelados
- Categorização de despesas
- Relatórios mensais e anuais

## Tecnologias Utilizadas

- HTML5
- Tailwind CSS para estilização
- JavaScript puro para funcionalidades
- Chart.js para gráficos
- LocalStorage para persistência de dados
- Font Awesome para ícones
- Google Fonts para tipografia

## Como Usar

1. Abra o arquivo `index.html` no navegador
2. Configure seu salário e rendas extras em "Configurações"
3. Adicione seus cartões de crédito em "Cartões"
4. Comece a registrar suas transações em "Transações"
5. Acompanhe suas finanças no "Dashboard" e "Análises"

## Recursos

### Dashboard
- Visão geral do saldo total
- Receitas e despesas do mês
- Gráficos de fluxo financeiro
- Transações recentes

### Transações
- Registro de receitas e despesas
- Suporte a pagamentos parcelados
- Categorização de transações
- Filtros e busca avançada

### Cartões
- Gerenciamento de múltiplos cartões
- Controle de limites
- Acompanhamento de faturas
- Visualização de parcelas futuras

### Análises
- Gráficos detalhados
- Análise por categoria
- Comparativos mensais
- Tendências de gastos

### Configurações
- Configuração de salário
- Gestão de rendas extras
- Preferências de notificações
- Personalização de alertas

## Armazenamento

O aplicativo utiliza LocalStorage para salvar todos os dados localmente no navegador. Não há necessidade de banco de dados ou servidor.

## Estrutura de Dados

```javascript
{
    // Transações
    transactions: [
        {
            id: string,
            description: string,
            amount: number,
            date: string,
            type: 'income' | 'expense',
            category: string,
            cardId?: string,
            installments?: {
                total: number,
                current: number
            }
        }
    ],

    // Cartões
    cards: [
        {
            id: string,
            name: string,
            limit: number,
            dueDay: number,
            color: string
        }
    ],

    // Configurações
    settings: {
        salary: number,
        salaryDay: number,
        extraIncome: [
            {
                description: string,
                amount: number
            }
        ],
        notifications: {
            enabled: boolean,
            daysBeforeDue: number[],
            notifyDueDates: boolean,
            notifyLowBalance: boolean,
            notifyHighExpenses: boolean
        }
    }
}
