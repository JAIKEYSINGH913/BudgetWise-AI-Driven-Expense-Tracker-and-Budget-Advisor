import { handleError } from '../utils';
import { API_BASE_URL } from './apiConfig';

const BASE_URL = `${API_BASE_URL}/api`;
const STORAGE_KEYS = {
    INCOME: 'budgetwise_income',
    GOALS: 'budgetwise_goals',
    USER: 'budgetwise_user_profile'
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token
    };
};

const DataManager = {
    // --- Categories ---
    getCategories: async () => {
        try {
            const response = await fetch(`${BASE_URL}/categories`, {
                headers: getHeaders()
            });
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch categories');
            }
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    addCategory: async (categoryName) => {
        try {
            const response = await fetch(`${BASE_URL}/categories/add`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ name: categoryName })
            });
            const result = await response.json();
            if (result.success) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return true;
            }
            throw new Error(result.message);
        } catch (error) {
            handleError(error.message);
            return false;
        }
    },
    deleteCategory: async (categoryName) => {
        try {
            const response = await fetch(`${BASE_URL}/categories/delete?name=${encodeURIComponent(categoryName)}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const result = await response.json();
            if (result.success) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return true;
            }
            throw new Error(result.message);
        } catch (error) {
            handleError(error.message);
            return false;
        }
    },

    // --- Expenses ---
    getExpenses: async () => {
        try {
            const response = await fetch(`${BASE_URL}/expenses`, {
                headers: getHeaders()
            });
            if (response.ok) return await response.json();
            throw new Error('Failed to fetch expenses');
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    addExpense: async (expense) => {
        try {
            const response = await fetch(`${BASE_URL}/expenses`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(expense)
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return await response.json();
            }
            throw new Error('Failed to add expense');
        } catch (error) {
            handleError(error.message);
            return null;
        }
    },
    updateExpense: async (id, expense) => {
        try {
            const response = await fetch(`${BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(expense)
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return true;
            }
            throw new Error('Failed to update expense');
        } catch (error) {
            handleError(error.message);
            return false;
        }
    },
    deleteExpense: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/expenses/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return true;
            }
            throw new Error('Failed to delete expense');
        } catch (error) {
            handleError(error.message);
            return false;
        }
    },

    // --- Income ---
    getIncome: async () => {
        try {
            const response = await fetch(`${BASE_URL}/incomes`, { headers: getHeaders() });
            if (response.ok) return await response.json();
            throw new Error('Failed to fetch income');
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    addIncome: async (income) => {
        try {
            const response = await fetch(`${BASE_URL}/incomes`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(income)
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return await response.json();
            }
            throw new Error('Failed to add income');
        } catch (error) {
            handleError(error.message);
            return null;
        }
    },
    deleteIncome: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/incomes/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return true;
            }
            throw new Error('Failed to delete income');
        } catch (error) {
            handleError(error.message);
            return false;
        }
    },
    getTotalIncome: async () => {
        const incomeList = await DataManager.getIncome();
        return incomeList.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
    },

    // --- Goals ---
    getGoals: async () => {
        try {
            const response = await fetch(`${BASE_URL}/goals`, { headers: getHeaders() });
            if (response.ok) return await response.json();
            throw new Error('Failed to fetch goals');
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    addGoal: async (goal) => {
        try {
            const response = await fetch(`${BASE_URL}/goals`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(goal)
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return await response.json();
            }
            throw new Error('Failed to add goal');
        } catch (error) {
            handleError(error.message);
            return null;
        }
    },
    updateGoal: async (id, goal) => {
        try {
            const response = await fetch(`${BASE_URL}/goals/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(goal)
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return true;
            }
            throw new Error('Failed to update goal');
        } catch (error) {
            handleError(error.message);
            return false;
        }
    },
    deleteGoal: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/goals/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (response.ok) {
                window.dispatchEvent(new Event('budgetwise_data_change'));
                return true;
            }
            throw new Error('Failed to delete goal');
        } catch (error) {
            handleError(error.message);
            return false;
        }
    },

    // --- Calculations ---
    getTotalExpenses: async () => {
        const expenses = await DataManager.getExpenses();
        return expenses.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
    },
    getRemainingBalance: async () => {
        const income = await DataManager.getTotalIncome();
        const expenses = await DataManager.getTotalExpenses();
        return income - expenses;
    },
    canAddExpense: async (amount) => {
        const balance = await DataManager.getRemainingBalance();
        return (balance - amount) >= 0;
    },

    // --- Import / Export ---

    // Helper for Auto-Categorization
    autoCategorize: (description) => {
        const desc = description.toLowerCase();
        if (desc.includes('uber') || desc.includes('lyft') || desc.includes('gas') || desc.includes('fuel') || desc.includes('bus') || desc.includes('train') || desc.includes('flight')) return 'Travel';
        if (desc.includes('food') || desc.includes('burger') || desc.includes('pizza') || desc.includes('restaurant') || desc.includes('coffee') || desc.includes('starbucks') || desc.includes('grocery') || desc.includes('mart')) return 'Food';
        if (desc.includes('rent') || desc.includes('lease')) return 'Rent';
        if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('store') || desc.includes('mall') || desc.includes('cloth')) return 'Shopping';
        if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('wifi') || desc.includes('bill') || desc.includes('utility')) return 'Utilities';
        if (desc.includes('health') || desc.includes('doctor') || desc.includes('pharmacy') || desc.includes('med') || desc.includes('hospital')) return 'Health';
        if (desc.includes('school') || desc.includes('college') || desc.includes('course') || desc.includes('book') || desc.includes('tuition')) return 'Education';
        if (desc.includes('movie') || desc.includes('cinema') || desc.includes('netflix') || desc.includes('spotify') || desc.includes('game')) return 'Entertainment';
        return 'General';
    },

    exportData: async () => {
        // Default to JSON for backward compatibility if needed, but UI calls specific methods now.
        // Keeping JSON export as fallback or specific option
        const expenses = await DataManager.getExpenses();
        const income = await DataManager.getIncome();
        const goals = await DataManager.getGoals();
        const user = localStorage.getItem(STORAGE_KEYS.USER) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) : {};

        const data = { expenses, income, goals, user, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budgetwise_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    exportDataExcel: async () => {
        const XLSX = await import('xlsx');
        const expenses = await DataManager.getExpenses();
        const income = await DataManager.getIncome();
        const goals = await DataManager.getGoals();

        const wb = XLSX.utils.book_new();

        // Expenses Sheet
        const wsExpenses = XLSX.utils.json_to_sheet(expenses.map(e => ({
            Date: e.date,
            Title: e.title,
            Category: e.category,
            Amount: e.amount
        })));
        XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");

        // Income Sheet
        const wsIncome = XLSX.utils.json_to_sheet(income.map(i => ({
            Date: i.date,
            Source: i.source,
            Amount: i.amount
        })));
        XLSX.utils.book_append_sheet(wb, wsIncome, "Income");

        // Goals Sheet
        const wsGoals = XLSX.utils.json_to_sheet(goals.map(g => ({
            Title: g.title,
            Target: g.targetAmount,
            Current: g.currentAmount,
            Deadline: g.deadline
        })));
        XLSX.utils.book_append_sheet(wb, wsGoals, "Goals");

        XLSX.writeFile(wb, `budgetwise_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    },

    exportDataPDF: async () => {
        const { jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("BudgetWise Financial Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const expenses = await DataManager.getExpenses();
        const income = await DataManager.getIncome();

        // Income Table
        doc.text("Income Sources", 14, 45);
        autoTable(doc, {
            startY: 50,
            head: [['Date', 'Source', 'Amount']],
            body: income.map(i => [i.date, i.source, `$${parseFloat(i.amount).toFixed(2)}`]),
        });

        // Expenses Table
        doc.text("Expenses", 14, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Date', 'Title', 'Category', 'Amount']],
            body: expenses.map(e => [e.date, e.title, e.category, `$${parseFloat(e.amount).toFixed(2)}`]),
        });

        doc.save(`budgetwise_report_${new Date().toISOString().split('T')[0]}.pdf`);
    },

    exportStatementPDF: async (transactions, startDate, endDate) => {
        const { jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("Account Statement", 14, 22);

        doc.setFontSize(11);
        doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

        // Table
        const tableColumn = ["Date", "Description", "Category", "Debit", "Credit", "Balance"];
        const tableRows = transactions.map(t => {
            const debit = t.type === 'expense' ? `$${t.amount.toFixed(2)}` : '-';
            const credit = t.type === 'income' ? `$${t.amount.toFixed(2)}` : '-';
            const balance = `$${t.balance.toFixed(2)}`;
            return [t.date, t.text || t.source, t.category || t.source, debit, credit, balance];
        });

        autoTable(doc, {
            startY: 45,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185] }, // Blue header
            columnStyles: {
                3: { halign: 'right', textColor: [231, 76, 60] }, // Debit Red
                4: { halign: 'right', textColor: [46, 204, 113] }, // Credit Green
                5: { halign: 'right', fontStyle: 'bold' } // Balance Bold
            }
        });

        doc.save(`Statement_${startDate}_to_${endDate}.pdf`);
    },

    importData: async (jsonData) => {
        try {
            // JSON Import
            if (jsonData.income && Array.isArray(jsonData.income)) {
                for (const item of jsonData.income) await DataManager.addIncome(item);
            }
            if (jsonData.goals && Array.isArray(jsonData.goals)) {
                for (const item of jsonData.goals) await DataManager.addGoal(item);
            }
            if (jsonData.expenses && Array.isArray(jsonData.expenses)) {
                for (const exp of jsonData.expenses) await DataManager.addExpense(exp);
            }

            window.dispatchEvent(new Event('budgetwise_data_change'));
            return true;
        } catch (error) {
            console.error("Import failed:", error);
            return false;
        }
    },

    importDataExcel: async (file) => {
        try {
            const XLSX = await import('xlsx');
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    try {
                        const data = e.target.result;
                        const workbook = XLSX.read(data, { type: 'array' });

                        // Parse Expenses
                        const expenseSheet = workbook.Sheets['Expenses'];
                        if (expenseSheet) {
                            const expenses = XLSX.utils.sheet_to_json(expenseSheet);
                            for (const row of expenses) {
                                // Map Excel columns to Object. Auto-categorize if needed.
                                const title = row['Title'] || row['Description'] || 'Unknown Expense';
                                const category = row['Category'] || DataManager.autoCategorize(title);

                                const expense = {
                                    title: title,
                                    amount: parseFloat(row['Amount'] || 0),
                                    category: category,
                                    date: row['Date'] || new Date().toISOString().split('T')[0]
                                };
                                await DataManager.addExpense(expense);
                            }
                        }

                        // Parse Income
                        const incomeSheet = workbook.Sheets['Income'];
                        if (incomeSheet) {
                            const incomes = XLSX.utils.sheet_to_json(incomeSheet);
                            for (const row of incomes) {
                                const income = {
                                    source: row['Source'] || 'Unknown Source',
                                    amount: parseFloat(row['Amount'] || 0),
                                    date: row['Date'] || new Date().toISOString().split('T')[0]
                                };
                                await DataManager.addIncome(income);
                            }
                        }

                        // Parse Goals
                        const goalSheet = workbook.Sheets['Goals'];
                        if (goalSheet) {
                            const goals = XLSX.utils.sheet_to_json(goalSheet);
                            for (const row of goals) {
                                const goal = {
                                    title: row['Title'] || 'New Goal',
                                    targetAmount: parseFloat(row['Target'] || 0),
                                    currentAmount: parseFloat(row['Current'] || 0),
                                    deadline: row['Deadline']
                                };
                                await DataManager.addGoal(goal);
                            }
                        }

                        window.dispatchEvent(new Event('budgetwise_data_change'));
                        resolve(true);

                    } catch (error) {
                        console.error("Excel Import Failed", error);
                        resolve(false);
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        } catch (err) {
            console.error("Failed to load xlsx library", err);
            return false;
        }
    }
};

export default DataManager;
