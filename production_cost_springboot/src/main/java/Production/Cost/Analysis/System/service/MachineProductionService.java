package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.repository.MachineProductionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MachineProductionService {

    private final MachineProductionRepository machineProductionRepository;

    public MachineProductionService(MachineProductionRepository machineProductionRepository) {
        this.machineProductionRepository = machineProductionRepository;
    }

    public List<MachineProduction> getAllProductions() {
        return machineProductionRepository.findAll();
    }

    public Optional<MachineProduction> getProductionById(Long id) {
        return machineProductionRepository.findById(id);
    }

    public Optional<MachineProduction> getProductionByCode(String code) {
        return machineProductionRepository.findByProductionCode(code);
    }

    public List<MachineProduction> searchProductions(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProductions();
        }
        return machineProductionRepository.searchProductions(keyword.trim());
    }

    public MachineProduction saveProduction(MachineProduction production) {
        if (production.getProductionCode() == null || production.getProductionCode().trim().isEmpty()) {
            production.setProductionCode(generateUniqueProductionCode());
        }

        if (production.getQuantityProduced() == null || production.getQuantityProduced() <= 0) {
            throw new IllegalArgumentException("Quantity produced must be at least 1.");
        }

        if (production.getQuantityRejected() == null) {
            production.setQuantityRejected(0);
        }

        if (production.getQuantityRejected() > production.getQuantityProduced()) {
            throw new IllegalArgumentException("Rejected quantity cannot exceed total quantity produced.");
        }

        // Net good quantity auto-computed
        production.setNetGoodQuantity(production.getQuantityProduced() - production.getQuantityRejected());

        // Machine cost calculation
        BigDecimal hours = production.getMachineHours() != null ? production.getMachineHours() : BigDecimal.ZERO;
        BigDecimal rate = production.getMachineHourlyRate() != null ? production.getMachineHourlyRate() : BigDecimal.ZERO;
        production.setTotalMachineCost(hours.multiply(rate));

        return machineProductionRepository.save(production);
    }

    public void deleteProduction(Long id) {
        machineProductionRepository.deleteById(id);
    }

    public synchronized String generateUniqueProductionCode() {
        int year = LocalDate.now().getYear();
        long count = machineProductionRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("PROD-%d-%03d", year, count++);
        } while (machineProductionRepository.existsByProductionCode(candidate));
        return candidate;
    }
}
