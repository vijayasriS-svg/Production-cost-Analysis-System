#!/usr/bin/env python3
import os

BASE = "production_cost_springboot"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

def build_entities():
    user = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "Password is required")
    @Column(nullable = false, length = 255)
    private String password;

    @NotBlank(message = "Full name is required")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 30)
    private String role = "ROLE_STAFF"; // ROLE_ADMIN, ROLE_MANAGER, ROLE_PRODUCTION_STAFF

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String username, String password, String fullName, String email, String role) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.enabled = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/User.java", user)

    product = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_code", nullable = false, unique = true, length = 30)
    private String productCode;

    @NotBlank(message = "Product name cannot be empty")
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 80)
    private String category;

    @NotNull(message = "Standard cost is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Standard cost must be >= 0")
    @Column(name = "standard_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal standardCost = BigDecimal.ZERO;

    @NotNull(message = "Standard selling price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Standard selling price must be >= 0")
    @Column(name = "standard_selling_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal standardSellingPrice = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Product() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getStandardCost() { return standardCost; }
    public void setStandardCost(BigDecimal standardCost) { this.standardCost = standardCost; }

    public BigDecimal getStandardSellingPrice() { return standardSellingPrice; }
    public void setStandardSellingPrice(BigDecimal standardSellingPrice) { this.standardSellingPrice = standardSellingPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/Product.java", product)

    raw_mat = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "raw_materials")
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_code", nullable = false, unique = true, length = 30)
    private String materialCode;

    @NotBlank(message = "Material name is required")
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 80)
    private String category;

    @NotBlank(message = "Unit of measurement is required")
    @Column(nullable = false, length = 20)
    private String unit; // Sheets, Reams, Kg, Liters, Rolls, etc.

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit price cannot be negative")
    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @NotNull(message = "Opening stock is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Opening stock cannot be negative")
    @Column(name = "opening_stock", precision = 12, scale = 2, nullable = false)
    private BigDecimal openingStock = BigDecimal.ZERO;

    @NotNull(message = "Current stock is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Current stock cannot be negative")
    @Column(name = "current_stock", precision = 12, scale = 2, nullable = false)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @NotNull(message = "Minimum stock alert is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Alert threshold cannot be negative")
    @Column(name = "minimum_stock_alert", precision = 12, scale = 2, nullable = false)
    private BigDecimal minimumStockAlert = BigDecimal.TEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public RawMaterial() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isLowStock() {
        return this.currentStock != null && this.minimumStockAlert != null 
            && this.currentStock.compareTo(this.minimumStockAlert) <= 0;
    }

    public BigDecimal getTotalInventoryValue() {
        if (currentStock == null || unitPrice == null) return BigDecimal.ZERO;
        return currentStock.multiply(unitPrice);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getOpeningStock() { return openingStock; }
    public void setOpeningStock(BigDecimal openingStock) { this.openingStock = openingStock; }

    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }

    public BigDecimal getMinimumStockAlert() { return minimumStockAlert; }
    public void setMinimumStockAlert(BigDecimal minimumStockAlert) { this.minimumStockAlert = minimumStockAlert; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/RawMaterial.java", raw_mat)

    stock_mov = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_stock_movements")
public class MaterialStockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "material_id", nullable = false)
    private RawMaterial rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_id")
    private MachineProduction machineProduction;

    @Column(name = "movement_type", nullable = false, length = 30)
    private String movementType; // PURCHASE, PRODUCTION_CONSUMPTION, ADJUSTMENT, OPENING

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @Column(name = "reference_note", length = 255)
    private String referenceNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MaterialStockMovement() {}

    public MaterialStockMovement(RawMaterial rawMaterial, MachineProduction machineProduction,
                                 String movementType, BigDecimal quantity, BigDecimal unitPrice,
                                 BigDecimal totalCost, String referenceNote) {
        this.rawMaterial = rawMaterial;
        this.machineProduction = machineProduction;
        this.movementType = movementType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalCost = totalCost;
        this.referenceNote = referenceNote;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RawMaterial getRawMaterial() { return rawMaterial; }
    public void setRawMaterial(RawMaterial rawMaterial) { this.rawMaterial = rawMaterial; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public String getMovementType() { return movementType; }
    public void setMovementType(String movementType) { this.movementType = movementType; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public String getReferenceNote() { return referenceNote; }
    public void setReferenceNote(String referenceNote) { this.referenceNote = referenceNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/MaterialStockMovement.java", stock_mov)

    machine_prod = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "machine_productions")
public class MachineProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "production_code", nullable = false, unique = true, length = 30)
    private String productionCode;

    @NotNull(message = "Product selection is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank(message = "Batch number is required")
    @Column(name = "batch_number", nullable = false, length = 50)
    private String batchNumber;

    @NotNull(message = "Produced quantity is required")
    @Min(value = 1, message = "Produced quantity must be at least 1")
    @Column(name = "quantity_produced", nullable = false)
    private Integer quantityProduced;

    @Min(value = 0, message = "Rejected quantity cannot be negative")
    @Column(name = "quantity_rejected", nullable = false)
    private Integer quantityRejected = 0;

    @Column(name = "net_good_quantity", nullable = false)
    private Integer netGoodQuantity;

    @NotBlank(message = "Machine name is required")
    @Column(name = "machine_name", nullable = false, length = 100)
    private String machineName;

    @NotNull(message = "Machine hours is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Machine hours must be >= 0")
    @Column(name = "machine_hours", precision = 8, scale = 2, nullable = false)
    private BigDecimal machineHours = BigDecimal.ZERO;

    @NotNull(message = "Machine hourly rate is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Machine hourly rate must be >= 0")
    @Column(name = "machine_hourly_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal machineHourlyRate = BigDecimal.ZERO;

    @Column(name = "total_machine_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalMachineCost = BigDecimal.ZERO;

    @NotNull(message = "Production date is required")
    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED"; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MachineProduction() {}

    @PrePersist
    @PreUpdate
    public void calculateDerivedValues() {
        if (quantityProduced == null) quantityProduced = 0;
        if (quantityRejected == null) quantityRejected = 0;
        this.netGoodQuantity = Math.max(0, quantityProduced - quantityRejected);

        if (machineHours != null && machineHourlyRate != null) {
            this.totalMachineCost = machineHours.multiply(machineHourlyRate);
        } else {
            this.totalMachineCost = BigDecimal.ZERO;
        }
    }

    public double getRejectionRatePercentage() {
        if (quantityProduced == null || quantityProduced == 0) return 0.0;
        return ((double) (quantityRejected != null ? quantityRejected : 0) / quantityProduced) * 100.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductionCode() { return productionCode; }
    public void setProductionCode(String productionCode) { this.productionCode = productionCode; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public Integer getQuantityProduced() { return quantityProduced; }
    public void setQuantityProduced(Integer quantityProduced) { this.quantityProduced = quantityProduced; }

    public Integer getQuantityRejected() { return quantityRejected; }
    public void setQuantityRejected(Integer quantityRejected) { this.quantityRejected = quantityRejected; }

    public Integer getNetGoodQuantity() { return netGoodQuantity; }
    public void setNetGoodQuantity(Integer netGoodQuantity) { this.netGoodQuantity = netGoodQuantity; }

    public String getMachineName() { return machineName; }
    public void setMachineName(String machineName) { this.machineName = machineName; }

    public BigDecimal getMachineHours() { return machineHours; }
    public void setMachineHours(BigDecimal machineHours) { this.machineHours = machineHours; }

    public BigDecimal getMachineHourlyRate() { return machineHourlyRate; }
    public void setMachineHourlyRate(BigDecimal machineHourlyRate) { this.machineHourlyRate = machineHourlyRate; }

    public BigDecimal getTotalMachineCost() { return totalMachineCost; }
    public void setTotalMachineCost(BigDecimal totalMachineCost) { this.totalMachineCost = totalMachineCost; }

    public LocalDate getProductionDate() { return productionDate; }
    public void setProductionDate(LocalDate productionDate) { this.productionDate = productionDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/MachineProduction.java", machine_prod)

    labour_cost = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "labour_costs")
public class LabourCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "labour_code", nullable = false, unique = true, length = 30)
    private String labourCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "production_id")
    private MachineProduction machineProduction;

    @NotBlank(message = "Work description is required")
    @Column(name = "work_description", nullable = false, length = 200)
    private String workDescription;

    @NotNull(message = "Worker count is required")
    @Min(value = 1, message = "Worker count must be at least 1")
    @Column(name = "worker_count", nullable = false)
    private Integer workerCount = 1;

    @NotNull(message = "Hours worked is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Hours worked cannot be negative")
    @Column(name = "hours_worked", precision = 8, scale = 2, nullable = false)
    private BigDecimal hoursWorked = BigDecimal.ZERO;

    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Hourly rate cannot be negative")
    @Column(name = "hourly_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    @NotBlank(message = "Calculation method is required")
    @Column(name = "calculation_method", nullable = false, length = 40)
    private String calculationMethod = "HOURLY_RATE"; // HOURLY_RATE, PIECE_RATE, FIXED_CONTRACT

    @Column(name = "total_labour_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalLabourCost = BigDecimal.ZERO;

    @NotNull(message = "Recorded date is required")
    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LabourCost() {}

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if ("HOURLY_RATE".equalsIgnoreCase(calculationMethod)) {
            if (workerCount != null && hoursWorked != null && hourlyRate != null) {
                this.totalLabourCost = BigDecimal.valueOf(workerCount)
                        .multiply(hoursWorked)
                        .multiply(hourlyRate);
            }
        } else {
            // For fixed or manual rates, ensure it doesn't stay null
            if (this.totalLabourCost == null) {
                this.totalLabourCost = BigDecimal.ZERO;
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabourCode() { return labourCode; }
    public void setLabourCode(String labourCode) { this.labourCode = labourCode; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public String getWorkDescription() { return workDescription; }
    public void setWorkDescription(String workDescription) { this.workDescription = workDescription; }

    public Integer getWorkerCount() { return workerCount; }
    public void setWorkerCount(Integer workerCount) { this.workerCount = workerCount; }

    public BigDecimal getHoursWorked() { return hoursWorked; }
    public void setHoursWorked(BigDecimal hoursWorked) { this.hoursWorked = hoursWorked; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getCalculationMethod() { return calculationMethod; }
    public void setCalculationMethod(String calculationMethod) { this.calculationMethod = calculationMethod; }

    public BigDecimal getTotalLabourCost() { return totalLabourCost; }
    public void setTotalLabourCost(BigDecimal totalLabourCost) { this.totalLabourCost = totalLabourCost; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/LabourCost.java", labour_cost)

    other_exp = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "other_expenses")
public class OtherExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expense_code", nullable = false, unique = true, length = 30)
    private String expenseCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "production_id")
    private MachineProduction machineProduction;

    @NotBlank(message = "Expense type is required")
    @Column(name = "expense_type", nullable = false, length = 60)
    private String expenseType; // Electricity, Transport, Packaging, Plates/Chemicals, Maintenance, Overhead

    @NotBlank(message = "Description is required")
    @Column(nullable = false, length = 255)
    private String description;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ONE;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit price cannot be negative")
    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total_expense_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalExpenseAmount = BigDecimal.ZERO;

    @NotNull(message = "Expense date is required")
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public OtherExpense() {}

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if (quantity != null && unitPrice != null) {
            this.totalExpenseAmount = quantity.multiply(unitPrice);
        } else {
            this.totalExpenseAmount = BigDecimal.ZERO;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExpenseCode() { return expenseCode; }
    public void setExpenseCode(String expenseCode) { this.expenseCode = expenseCode; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public String getExpenseType() { return expenseType; }
    public void setExpenseType(String expenseType) { this.expenseType = expenseType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalExpenseAmount() { return totalExpenseAmount; }
    public void setTotalExpenseAmount(BigDecimal totalExpenseAmount) { this.totalExpenseAmount = totalExpenseAmount; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/OtherExpense.java", other_exp)

    pca = '''package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_cost_analyses")
public class ProductionCostAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analysis_code", nullable = false, unique = true, length = 30)
    private String analysisCode;

    @NotNull(message = "Production reference is required")
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "production_id", nullable = false, unique = true)
    private MachineProduction machineProduction;

    @Column(name = "raw_material_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal rawMaterialCost = BigDecimal.ZERO;

    @Column(name = "labour_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal labourCost = BigDecimal.ZERO;

    @Column(name = "machine_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal machineCost = BigDecimal.ZERO;

    @Column(name = "other_expense_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal otherExpenseCost = BigDecimal.ZERO;

    @Column(name = "total_production_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalProductionCost = BigDecimal.ZERO;

    @Column(name = "produced_quantity", nullable = false)
    private Integer producedQuantity = 0;

    @Column(name = "cost_per_unit", precision = 12, scale = 4, nullable = false)
    private BigDecimal costPerUnit = BigDecimal.ZERO;

    @Column(name = "actual_sold_quantity", nullable = false)
    private Integer actualSoldQuantity = 0;

    @Column(name = "selling_price_per_unit", precision = 12, scale = 2, nullable = false)
    private BigDecimal sellingPricePerUnit = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal revenue = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal cogs = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal profit = BigDecimal.ZERO;

    @Column(name = "profit_margin_pct", precision = 6, scale = 2, nullable = false)
    private BigDecimal profitMarginPct = BigDecimal.ZERO;

    @Column(name = "is_sales_recorded", nullable = false)
    private boolean isSalesRecorded = false;

    @NotNull(message = "Analysis date is required")
    @Column(name = "analysis_date", nullable = false)
    private LocalDate analysisDate;

    @Column(nullable = false, length = 30)
    private String status = "CALCULATED";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ProductionCostAnalysis() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        recalculateFormulas();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        recalculateFormulas();
    }

    /**
     * Executes authoritative automated formula calculations according to specifications:
     * Total Production Cost = Raw Material Cost + Labour Cost + Machine Cost + Other Expenses
     * Cost Per Unit = Total Production Cost / Produced Quantity (or 0 if quantity is 0)
     * Revenue = Actual Sold Quantity * Selling Price Per Unit (only if sales are recorded)
     * COGS = Cost Per Unit * Actual Sold Quantity
     * Profit = Revenue - COGS
     * Profit Margin (%) = (Profit / Revenue) * 100
     */
    public void recalculateFormulas() {
        if (rawMaterialCost == null) rawMaterialCost = BigDecimal.ZERO;
        if (labourCost == null) labourCost = BigDecimal.ZERO;
        if (machineCost == null) machineCost = BigDecimal.ZERO;
        if (otherExpenseCost == null) otherExpenseCost = BigDecimal.ZERO;
        if (sellingPricePerUnit == null) sellingPricePerUnit = BigDecimal.ZERO;
        if (actualSoldQuantity == null) actualSoldQuantity = 0;

        // 1. Total Production Cost
        this.totalProductionCost = rawMaterialCost.add(labourCost).add(machineCost).add(otherExpenseCost);

        // 2. Cost Per Unit
        if (producedQuantity != null && producedQuantity > 0) {
            this.costPerUnit = this.totalProductionCost.divide(BigDecimal.valueOf(producedQuantity), 4, RoundingMode.HALF_UP);
        } else {
            this.costPerUnit = BigDecimal.ZERO;
        }

        // 3. Sales, Revenue, COGS, and Profit (Handling unsold / projected safely)
        if (isSalesRecorded && actualSoldQuantity > 0 && sellingPricePerUnit.compareTo(BigDecimal.ZERO) > 0) {
            this.revenue = sellingPricePerUnit.multiply(BigDecimal.valueOf(actualSoldQuantity)).setScale(2, RoundingMode.HALF_UP);
            this.cogs = this.costPerUnit.multiply(BigDecimal.valueOf(actualSoldQuantity)).setScale(2, RoundingMode.HALF_UP);
            this.profit = this.revenue.subtract(this.cogs).setScale(2, RoundingMode.HALF_UP);

            if (this.revenue.compareTo(BigDecimal.ZERO) > 0) {
                this.profitMarginPct = this.profit.multiply(BigDecimal.valueOf(100))
                        .divide(this.revenue, 2, RoundingMode.HALF_UP);
            } else {
                this.profitMarginPct = BigDecimal.ZERO;
            }
        } else {
            // Unsold inventory is not counted as realized revenue
            this.revenue = BigDecimal.ZERO;
            this.cogs = BigDecimal.ZERO;
            this.profit = BigDecimal.ZERO;
            this.profitMarginPct = BigDecimal.ZERO;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnalysisCode() { return analysisCode; }
    public void setAnalysisCode(String analysisCode) { this.analysisCode = analysisCode; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public BigDecimal getRawMaterialCost() { return rawMaterialCost; }
    public void setRawMaterialCost(BigDecimal rawMaterialCost) { this.rawMaterialCost = rawMaterialCost; }

    public BigDecimal getLabourCost() { return labourCost; }
    public void setLabourCost(BigDecimal labourCost) { this.labourCost = labourCost; }

    public BigDecimal getMachineCost() { return machineCost; }
    public void setMachineCost(BigDecimal machineCost) { this.machineCost = machineCost; }

    public BigDecimal getOtherExpenseCost() { return otherExpenseCost; }
    public void setOtherExpenseCost(BigDecimal otherExpenseCost) { this.otherExpenseCost = otherExpenseCost; }

    public BigDecimal getTotalProductionCost() { return totalProductionCost; }
    public void setTotalProductionCost(BigDecimal totalProductionCost) { this.totalProductionCost = totalProductionCost; }

    public Integer getProducedQuantity() { return producedQuantity; }
    public void setProducedQuantity(Integer producedQuantity) { this.producedQuantity = producedQuantity; }

    public BigDecimal getCostPerUnit() { return costPerUnit; }
    public void setCostPerUnit(BigDecimal costPerUnit) { this.costPerUnit = costPerUnit; }

    public Integer getActualSoldQuantity() { return actualSoldQuantity; }
    public void setActualSoldQuantity(Integer actualSoldQuantity) { this.actualSoldQuantity = actualSoldQuantity; }

    public BigDecimal getSellingPricePerUnit() { return sellingPricePerUnit; }
    public void setSellingPricePerUnit(BigDecimal sellingPricePerUnit) { this.sellingPricePerUnit = sellingPricePerUnit; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public BigDecimal getCogs() { return cogs; }
    public void setCogs(BigDecimal cogs) { this.cogs = cogs; }

    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }

    public BigDecimal getProfitMarginPct() { return profitMarginPct; }
    public void setProfitMarginPct(BigDecimal profitMarginPct) { this.profitMarginPct = profitMarginPct; }

    public boolean isSalesRecorded() { return isSalesRecorded; }
    public void setSalesRecorded(boolean salesRecorded) { isSalesRecorded = salesRecorded; }

    public LocalDate getAnalysisDate() { return analysisDate; }
    public void setAnalysisDate(LocalDate analysisDate) { this.analysisDate = analysisDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/entity/ProductionCostAnalysis.java", pca)

if __name__ == "__main__":
    build_entities()
