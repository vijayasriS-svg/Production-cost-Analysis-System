package Production.Cost.Analysis.System.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import java.util.List;
import java.util.Map;

@Repository
public interface DashboardRepository extends JpaRepository<ProductionCostAnalysis, Long> {

    @Query(value = "SELECT " +
           "DATE_FORMAT(analysis_date, '%b %Y') as monthName, " +
           "COALESCE(SUM(total_production_cost), 0) as costSum, " +
           "COALESCE(SUM(revenue), 0) as revenueSum, " +
           "COALESCE(SUM(profit), 0) as profitSum " +
           "FROM production_cost_analyses " +
           "GROUP BY DATE_FORMAT(analysis_date, '%b %Y'), YEAR(analysis_date), MONTH(analysis_date) " +
           "ORDER BY YEAR(analysis_date) ASC, MONTH(analysis_date) ASC LIMIT 6", nativeQuery = true)
    List<Map<String, Object>> getMonthlyTrends();
}
