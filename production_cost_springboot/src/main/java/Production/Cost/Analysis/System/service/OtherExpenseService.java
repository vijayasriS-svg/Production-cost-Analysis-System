package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.OtherExpense;
import Production.Cost.Analysis.System.repository.OtherExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OtherExpenseService {

    private final OtherExpenseRepository otherExpenseRepository;

    public OtherExpenseService(OtherExpenseRepository otherExpenseRepository) {
        this.otherExpenseRepository = otherExpenseRepository;
    }

    public List<OtherExpense> getAllExpenses() {
        return otherExpenseRepository.findAll();
    }

    public Optional<OtherExpense> getExpenseById(Long id) {
        return otherExpenseRepository.findById(id);
    }

    public List<OtherExpense> getExpensesByProduction(Long productionId) {
        return otherExpenseRepository.findByMachineProductionId(productionId);
    }

    public List<OtherExpense> searchExpenses(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllExpenses();
        }
        return otherExpenseRepository.searchExpenses(keyword.trim());
    }

    public OtherExpense saveExpense(OtherExpense expense) {
        if (expense.getExpenseCode() == null || expense.getExpenseCode().trim().isEmpty()) {
            expense.setExpenseCode(generateUniqueExpenseCode());
        }

        BigDecimal qty = expense.getQuantity() != null ? expense.getQuantity() : BigDecimal.ONE;
        BigDecimal price = expense.getUnitPrice() != null ? expense.getUnitPrice() : BigDecimal.ZERO;
        expense.setTotalExpenseAmount(qty.multiply(price));

        if (expense.getTotalExpenseAmount().signum() < 0) {
            throw new IllegalArgumentException("Expense total cannot be negative.");
        }

        return otherExpenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        otherExpenseRepository.deleteById(id);
    }

    public synchronized String generateUniqueExpenseCode() {
        long count = otherExpenseRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("EXP-%04d", count++);
        } while (otherExpenseRepository.existsByExpenseCode(candidate));
        return candidate;
    }
}
