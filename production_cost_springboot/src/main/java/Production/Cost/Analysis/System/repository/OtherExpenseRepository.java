package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.OtherExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtherExpenseRepository extends JpaRepository<OtherExpense, Long> {
    Optional<OtherExpense> findByExpenseCode(String expenseCode);
    boolean existsByExpenseCode(String expenseCode);
    List<OtherExpense> findByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(oe.totalExpenseAmount), 0) FROM OtherExpense oe WHERE oe.machineProduction.id = :prodId")
    java.math.BigDecimal calculateTotalExpensesForProduction(@Param("prodId") Long prodId);

    @Query("SELECT COALESCE(SUM(oe.totalExpenseAmount), 0) FROM OtherExpense oe")
    java.math.BigDecimal calculateTotalGlobalExpenses();

    @Query("SELECT oe FROM OtherExpense oe WHERE LOWER(oe.description) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(oe.expenseType) LIKE LOWER(CONCAT('%', :kw, '%'))")
    List<OtherExpense> searchExpenses(@Param("kw") String keyword);
}
