#!/usr/bin/env python3
import os

BASE = "production_cost_springboot"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

def build_services_and_models():
    # Model / DTO
    dash_dto = '''package Production.Cost.Analysis.System.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.entity.RawMaterial;

public class DashboardSummaryDTO {
    private long totalProducts;
    private long totalMaterials;
    private long lowStockCount;
    private long totalProductions;
    private long totalUnitsProduced;
    private long totalUnitsRejected;
    private BigDecimal totalProductionCosts;
    private BigDecimal totalMaterialCosts;
    private BigDecimal totalLabourCosts;
    private BigDecimal totalMachineCosts;
    private BigDecimal totalOtherExpenses;
    private BigDecimal totalRealizedRevenue;
    private BigDecimal totalRealizedProfit;
    private BigDecimal inventoryValue;
    private List<RawMaterial> lowStockList;
    private List<MachineProduction> recentProductions;
    private List<Map<String, Object>> monthlyTrends;

    public DashboardSummaryDTO() {}

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalMaterials() { return totalMaterials; }
    public void setTotalMaterials(long totalMaterials) { this.totalMaterials = totalMaterials; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getTotalProductions() { return totalProductions; }
    public void setTotalProductions(long totalProductions) { this.totalProductions = totalProductions; }

    public long getTotalUnitsProduced() { return totalUnitsProduced; }
    public void setTotalUnitsProduced(long totalUnitsProduced) { this.totalUnitsProduced = totalUnitsProduced; }

    public long getTotalUnitsRejected() { return totalUnitsRejected; }
    public void setTotalUnitsRejected(long totalUnitsRejected) { this.totalUnitsRejected = totalUnitsRejected; }

    public BigDecimal getTotalProductionCosts() { return totalProductionCosts; }
    public void setTotalProductionCosts(BigDecimal totalProductionCosts) { this.totalProductionCosts = totalProductionCosts; }

    public BigDecimal getTotalMaterialCosts() { return totalMaterialCosts; }
    public void setTotalMaterialCosts(BigDecimal totalMaterialCosts) { this.totalMaterialCosts = totalMaterialCosts; }

    public BigDecimal getTotalLabourCosts() { return totalLabourCosts; }
    public void setTotalLabourCosts(BigDecimal totalLabourCosts) { this.totalLabourCosts = totalLabourCosts; }

    public BigDecimal getTotalMachineCosts() { return totalMachineCosts; }
    public void setTotalMachineCosts(BigDecimal totalMachineCosts) { this.totalMachineCosts = totalMachineCosts; }

    public BigDecimal getTotalOtherExpenses() { return totalOtherExpenses; }
    public void setTotalOtherExpenses(BigDecimal totalOtherExpenses) { this.totalOtherExpenses = totalOtherExpenses; }

    public BigDecimal getTotalRealizedRevenue() { return totalRealizedRevenue; }
    public void setTotalRealizedRevenue(BigDecimal totalRealizedRevenue) { this.totalRealizedRevenue = totalRealizedRevenue; }

    public BigDecimal getTotalRealizedProfit() { return totalRealizedProfit; }
    public void setTotalRealizedProfit(BigDecimal totalRealizedProfit) { this.totalRealizedProfit = totalRealizedProfit; }

    public BigDecimal getInventoryValue() { return inventoryValue; }
    public void setInventoryValue(BigDecimal inventoryValue) { this.inventoryValue = inventoryValue; }

    public List<RawMaterial> getLowStockList() { return lowStockList; }
    public void setLowStockList(List<RawMaterial> lowStockList) { this.lowStockList = lowStockList; }

    public List<MachineProduction> getRecentProductions() { return recentProductions; }
    public void setRecentProductions(List<MachineProduction> recentProductions) { this.recentProductions = recentProductions; }

    public List<Map<String, Object>> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<Map<String, Object>> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/model/DashboardSummaryDTO.java", dash_dto)

    # 1. CustomUserDetailsService.java
    uds = '''package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.User;
import Production.Cost.Analysis.System.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        if (!user.isEnabled()) {
            throw new DisabledException("User account is disabled");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isEnabled(),
                true, true, true,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/service/CustomUserDetailsService.java", uds)

    # 2. ProductService.java
    prod_svc = '''package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.Product;
import Production.Cost.Analysis.System.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Optional<Product> getProductByCode(String code) {
        return productRepository.findByProductCode(code);
    }

    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(keyword.trim());
    }

    public Product saveProduct(Product product) {
        // Automatically generate unique product code if empty
        if (product.getProductCode() == null || product.getProductCode().trim().isEmpty()) {
            product.setProductCode(generateUniqueProductCode());
        }

        // Business validations
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty.");
        }
        if (product.getStandardCost() == null || product.getStandardCost().signum() < 0) {
            throw new IllegalArgumentException("Standard cost cannot be negative.");
        }
        if (product.getStandardSellingPrice() == null || product.getStandardSellingPrice().signum() < 0) {
            throw new IllegalArgumentException("Standard selling price cannot be negative.");
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product with ID " + id + " does not exist."));
        // Soft delete or safe deactivate to protect historical production records
        p.setActive(false);
        productRepository.save(p);
    }

    public synchronized String generateUniqueProductCode() {
        long count = productRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("PRD-%03d", count++);
        } while (productRepository.existsByProductCode(candidate));
        return candidate;
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/service/ProductService.java", prod_svc)

    # 3. RawMaterialService.java
    mat_svc = '''package Production.Cost.Analysis.System.service;

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
'''
    write("src/main/java/Production/Cost/Analysis/System/service/RawMaterialService.java", mat_svc)

    # 4. LabourCostService.java
    lbr_svc = '''package Production.Cost.Analysis.System.service;

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
'''
    write("src/main/java/Production/Cost/Analysis/System/service/LabourCostService.java", lbr_svc)

    # 5. MachineProductionService.java
    mach_svc = '''package Production.Cost.Analysis.System.service;

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
'''
    write("src/main/java/Production/Cost/Analysis/System/service/MachineProductionService.java", mach_svc)

    # 6. OtherExpenseService.java
    exp_svc = '''package Production.Cost.Analysis.System.service;

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
'''
    write("src/main/java/Production/Cost/Analysis/System/service/OtherExpenseService.java", exp_svc)

    # 7. ProductionCostAnalysisService.java
    pca_svc = '''package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import Production.Cost.Analysis.System.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductionCostAnalysisService {

    private final ProductionCostAnalysisRepository analysisRepository;
    private final MachineProductionRepository machineProductionRepository;
    private final MaterialStockMovementRepository stockMovementRepository;
    private final LabourCostRepository labourCostRepository;
    private final OtherExpenseRepository otherExpenseRepository;

    public ProductionCostAnalysisService(
            ProductionCostAnalysisRepository analysisRepository,
            MachineProductionRepository machineProductionRepository,
            MaterialStockMovementRepository stockMovementRepository,
            LabourCostRepository labourCostRepository,
            OtherExpenseRepository otherExpenseRepository) {
        this.analysisRepository = analysisRepository;
        this.machineProductionRepository = machineProductionRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.labourCostRepository = labourCostRepository;
        this.otherExpenseRepository = otherExpenseRepository;
    }

    public List<ProductionCostAnalysis> getAllAnalyses() {
        return analysisRepository.findAllOrderByDateDesc();
    }

    public Optional<ProductionCostAnalysis> getAnalysisById(Long id) {
        return analysisRepository.findById(id);
    }

    public Optional<ProductionCostAnalysis> getAnalysisByProductionId(Long productionId) {
        return analysisRepository.findByMachineProductionId(productionId);
    }

    /**
     * Fully automates the cost calculation for a given production order
     * by pulling authoritative data directly from all connected modules:
     * - Raw Materials consumed from stock movements
     * - Labour records linked to this production
     * - Machine operational cost from machine hours & hourly rate
     * - Other expenses allocated to this production
     */
    public ProductionCostAnalysis calculateOrUpdateForProduction(Long productionId, Integer actualSoldQty, BigDecimal sellingPrice, String notes) {
        MachineProduction production = machineProductionRepository.findById(productionId)
                .orElseThrow(() -> new IllegalArgumentException("Production not found: " + productionId));

        ProductionCostAnalysis analysis = analysisRepository.findByMachineProductionId(productionId)
                .orElse(new ProductionCostAnalysis());

        if (analysis.getAnalysisCode() == null) {
            analysis.setAnalysisCode(generateUniqueAnalysisCode());
        }
        analysis.setMachineProduction(production);

        // Fetch live aggregated totals from connected database tables
        BigDecimal matCost = stockMovementRepository.calculateTotalMaterialCostForProduction(productionId);
        BigDecimal labCost = labourCostRepository.calculateTotalLabourCostForProduction(productionId);
        BigDecimal machCost = (production.getTotalMachineCost() != null) ? production.getTotalMachineCost() : BigDecimal.ZERO;
        BigDecimal expCost = otherExpenseRepository.calculateTotalExpensesForProduction(productionId);

        analysis.setRawMaterialCost(matCost != null ? matCost : BigDecimal.ZERO);
        analysis.setLabourCost(labCost != null ? labCost : BigDecimal.ZERO);
        analysis.setMachineCost(machCost != null ? machCost : BigDecimal.ZERO);
        analysis.setOtherExpenseCost(expCost != null ? expCost : BigDecimal.ZERO);
        analysis.setProducedQuantity(production.getQuantityProduced());

        // Set selling price (default from Product standard price if not supplied)
        if (sellingPrice != null && sellingPrice.compareTo(BigDecimal.ZERO) > 0) {
            analysis.setSellingPricePerUnit(sellingPrice);
        } else if (production.getProduct() != null && production.getProduct().getStandardSellingPrice() != null) {
            analysis.setSellingPricePerUnit(production.getProduct().getStandardSellingPrice());
        }

        // Handle actual sales data safely:
        // Unsold items are NOT treated as realized revenue
        if (actualSoldQty != null && actualSoldQty > 0) {
            analysis.setActualSoldQuantity(actualSoldQty);
            analysis.setSalesRecorded(true);
        } else {
            analysis.setActualSoldQuantity(0);
            analysis.setSalesRecorded(false);
        }

        analysis.setAnalysisDate(LocalDate.now());
        if (notes != null) analysis.setNotes(notes);

        // Trigger comprehensive formula recalculation
        analysis.recalculateFormulas();

        return analysisRepository.save(analysis);
    }

    public ProductionCostAnalysis saveAnalysis(ProductionCostAnalysis analysis) {
        if (analysis.getAnalysisCode() == null || analysis.getAnalysisCode().trim().isEmpty()) {
            analysis.setAnalysisCode(generateUniqueAnalysisCode());
        }
        analysis.recalculateFormulas();
        return analysisRepository.save(analysis);
    }

    public void deleteAnalysis(Long id) {
        analysisRepository.deleteById(id);
    }

    public synchronized String generateUniqueAnalysisCode() {
        int year = LocalDate.now().getYear();
        long count = analysisRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("PCA-%d-%03d", year, count++);
        } while (analysisRepository.existsByAnalysisCode(candidate));
        return candidate;
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/service/ProductionCostAnalysisService.java", pca_svc)

    # 8. DashboardService.java
    dash_svc = '''package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.model.DashboardSummaryDTO;
import Production.Cost.Analysis.System.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final MachineProductionRepository machineProductionRepository;
    private final LabourCostRepository labourCostRepository;
    private final OtherExpenseRepository otherExpenseRepository;
    private final ProductionCostAnalysisRepository analysisRepository;
    private final DashboardRepository dashboardRepository;

    public DashboardService(
            ProductRepository productRepository,
            RawMaterialRepository rawMaterialRepository,
            MachineProductionRepository machineProductionRepository,
            LabourCostRepository labourCostRepository,
            OtherExpenseRepository otherExpenseRepository,
            ProductionCostAnalysisRepository analysisRepository,
            DashboardRepository dashboardRepository) {
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.machineProductionRepository = machineProductionRepository;
        this.labourCostRepository = labourCostRepository;
        this.otherExpenseRepository = otherExpenseRepository;
        this.analysisRepository = analysisRepository;
        this.dashboardRepository = dashboardRepository;
    }

    public DashboardSummaryDTO getDashboardMetrics() {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();

        dto.setTotalProducts(productRepository.countActiveProducts());
        dto.setTotalMaterials(rawMaterialRepository.count());
        dto.setLowStockCount(rawMaterialRepository.countLowStockMaterials());
        dto.setTotalProductions(machineProductionRepository.count());
        dto.setTotalUnitsProduced(machineProductionRepository.calculateTotalProducedQuantity());
        dto.setTotalUnitsRejected(machineProductionRepository.calculateTotalRejectedQuantity());

        dto.setTotalProductionCosts(analysisRepository.calculateTotalProductionCostAll());
        dto.setTotalLabourCosts(labourCostRepository.calculateTotalGlobalLabourCost());
        dto.setTotalMachineCosts(machineProductionRepository.calculateTotalMachineCosts());
        dto.setTotalOtherExpenses(otherExpenseRepository.calculateTotalGlobalExpenses());
        dto.setInventoryValue(rawMaterialRepository.calculateTotalInventoryValue());

        dto.setTotalRealizedRevenue(analysisRepository.calculateTotalRealizedRevenue());
        dto.setTotalRealizedProfit(analysisRepository.calculateTotalRealizedProfit());

        dto.setLowStockList(rawMaterialRepository.findLowStockMaterials());
        dto.setRecentProductions(machineProductionRepository.findTop10ByOrderByProductionDateDesc());

        try {
            List<Map<String, Object>> trends = dashboardRepository.getMonthlyTrends();
            dto.setMonthlyTrends(trends);
        } catch (Exception e) {
            dto.setMonthlyTrends(List.of());
        }

        return dto;
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/service/DashboardService.java", dash_svc)

if __name__ == "__main__":
    build_services_and_models()
