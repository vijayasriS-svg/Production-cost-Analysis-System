package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.LabourCost;
import Production.Cost.Analysis.System.repository.LabourCostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LabourCostService {

    private final LabourCostRepository labourCostRepository;

    public LabourCostService(LabourCostRepository labourCostRepository) {
        this.labourCostRepository = labourCostRepository;
    }

    public List<LabourCost> getAllLabourCosts() {
        return labourCostRepository.findAll();
    }

    public Optional<LabourCost> getLabourCostById(Long id) {
        return labourCostRepository.findById(id);
    }

    public List<LabourCost> getLabourByProduction(Long productionId) {
        return labourCostRepository.findByMachineProductionId(productionId);
    }

    public List<LabourCost> searchLabour(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllLabourCosts();
        }
        return labourCostRepository.searchLabour(keyword.trim());
    }

    public LabourCost saveLabourCost(LabourCost labourCost) {
        if (labourCost.getLabourCode() == null || labourCost.getLabourCode().trim().isEmpty()) {
            labourCost.setLabourCode(generateUniqueLabourCode());
        }

        // Automatic authoritative calculation based on calculation method
        if ("HOURLY_RATE".equalsIgnoreCase(labourCost.getCalculationMethod())) {
            int workers = labourCost.getWorkerCount() != null ? labourCost.getWorkerCount() : 1;
            BigDecimal hours = labourCost.getHoursWorked() != null ? labourCost.getHoursWorked() : BigDecimal.ZERO;
            BigDecimal rate = labourCost.getHourlyRate() != null ? labourCost.getHourlyRate() : BigDecimal.ZERO;
            labourCost.setTotalLabourCost(BigDecimal.valueOf(workers).multiply(hours).multiply(rate));
        }

        if (labourCost.getTotalLabourCost() == null || labourCost.getTotalLabourCost().signum() < 0) {
            throw new IllegalArgumentException("Total labour cost cannot be negative.");
        }

        return labourCostRepository.save(labourCost);
    }

    public void deleteLabourCost(Long id) {
        labourCostRepository.deleteById(id);
    }

    public synchronized String generateUniqueLabourCode() {
        long count = labourCostRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("LBR-%04d", count++);
        } while (labourCostRepository.existsByLabourCode(candidate));
        return candidate;
    }
}
