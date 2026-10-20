package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.MaterialStockMovement;
import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.entity.RawMaterial;
import Production.Cost.Analysis.System.repository.MaterialStockMovementRepository;
import Production.Cost.Analysis.System.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final MaterialStockMovementRepository stockMovementRepository;

    public RawMaterialService(RawMaterialRepository rawMaterialRepository,
                              MaterialStockMovementRepository stockMovementRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    public List<RawMaterial> getAllMaterials() {
        return rawMaterialRepository.findAll();
    }

    public Optional<RawMaterial> getMaterialById(Long id) {
        return rawMaterialRepository.findById(id);
    }

    public List<RawMaterial> getLowStockMaterials() {
        return rawMaterialRepository.findLowStockMaterials();
    }

    public List<RawMaterial> searchMaterials(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllMaterials();
        }
        return rawMaterialRepository.searchMaterials(keyword.trim());
    }

    public RawMaterial saveMaterial(RawMaterial material) {
        if (material.getMaterialCode() == null || material.getMaterialCode().trim().isEmpty()) {
            material.setMaterialCode(generateUniqueMaterialCode());
        }

        boolean isNew = (material.getId() == null);

        if (material.getCurrentStock() == null) {
            material.setCurrentStock(material.getOpeningStock() != null ? material.getOpeningStock() : BigDecimal.ZERO);
        }

        if (material.getCurrentStock().signum() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative.");
        }

        RawMaterial saved = rawMaterialRepository.save(material);

        if (isNew && material.getOpeningStock() != null && material.getOpeningStock().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal totalCost = material.getOpeningStock().multiply(material.getUnitPrice());
            MaterialStockMovement mov = new MaterialStockMovement(
                    saved, null, "OPENING", material.getOpeningStock(), material.getUnitPrice(), totalCost, "Initial opening stock"
            );
            stockMovementRepository.save(mov);
        }

        return saved;
    }

    /**
     * Atomically adds stock from a purchase transaction
     */
    public MaterialStockMovement recordPurchase(Long materialId, BigDecimal quantity, BigDecimal unitPrice, String notes) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Purchase quantity must be positive.");
        }
        RawMaterial material = rawMaterialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Raw material not found: " + materialId));

        material.setCurrentStock(material.getCurrentStock().add(quantity));
        if (unitPrice != null && unitPrice.compareTo(BigDecimal.ZERO) > 0) {
            material.setUnitPrice(unitPrice); // Update latest purchasing price
        }
        rawMaterialRepository.save(material);

        BigDecimal effectivePrice = (unitPrice != null) ? unitPrice : material.getUnitPrice();
        BigDecimal totalCost = quantity.multiply(effectivePrice);

        MaterialStockMovement mov = new MaterialStockMovement(
                material, null, "PURCHASE", quantity, effectivePrice, totalCost, notes
        );
        return stockMovementRepository.save(mov);
    }

    /**
     * Atomically consumes material for production, strictly preventing negative stock
     * and preventing duplicate deductions for the same production run.
     */
    public MaterialStockMovement consumeForProduction(Long materialId, MachineProduction production, BigDecimal quantity, String notes) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Consumption quantity must be greater than zero.");
        }

        // Prevent duplicate deduction for the exact same material in the same production order
        if (production != null && production.getId() != null) {
            boolean alreadyConsumed = stockMovementRepository
                    .existsByRawMaterialIdAndMachineProductionIdAndMovementType(materialId, production.getId(), "PRODUCTION_CONSUMPTION");
            if (alreadyConsumed) {
                throw new IllegalStateException("Material " + materialId + " has already been deducted for production #" + production.getProductionCode());
            }
        }

        RawMaterial material = rawMaterialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Raw material not found: " + materialId));

        // Strict guard against negative stock
        if (material.getCurrentStock().compareTo(quantity) < 0) {
            throw new IllegalStateException(String.format(
                    "Insufficient stock for material '%s' (%s). Available: %s, Requested: %s",
                    material.getName(), material.getMaterialCode(), material.getCurrentStock(), quantity
            ));
        }

        material.setCurrentStock(material.getCurrentStock().subtract(quantity));
        rawMaterialRepository.save(material);

        BigDecimal totalCost = quantity.multiply(material.getUnitPrice());
        MaterialStockMovement mov = new MaterialStockMovement(
                material, production, "PRODUCTION_CONSUMPTION", quantity, material.getUnitPrice(), totalCost, notes
        );
        return stockMovementRepository.save(mov);
    }

    public List<MaterialStockMovement> getMovementsForMaterial(Long materialId) {
        return stockMovementRepository.findByRawMaterialIdOrderByCreatedAtDesc(materialId);
    }

    public List<MaterialStockMovement> getMovementsForProduction(Long productionId) {
        return stockMovementRepository.findByMachineProductionId(productionId);
    }

    public synchronized String generateUniqueMaterialCode() {
        long count = rawMaterialRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("MAT-%03d", count++);
        } while (rawMaterialRepository.existsByMaterialCode(candidate));
        return candidate;
    }
}
