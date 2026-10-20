#!/usr/bin/env python3
import os

BASE = "production_cost_springboot"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

def build_controllers_and_app():
    # 1. Login & Dashboard Controller
    login_ctrl = '''package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.model.DashboardSummaryDTO;
import Production.Cost.Analysis.System.service.DashboardService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    private final DashboardService dashboardService;

    public LoginController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/login")
    public String loginPage(
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "logout", required = false) String logout,
            Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid username or password. Please try again.");
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "You have been successfully logged out.");
        }
        return "login";
    }

    @GetMapping("/")
    public String root() {
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        DashboardSummaryDTO metrics = dashboardService.getDashboardMetrics();
        model.addAttribute("metrics", metrics);
        model.addAttribute("activePage", "dashboard");
        return "dashboard";
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/controller/LoginController.java", login_ctrl)

    # 2. ProductController.java
    prod_ctrl = '''package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.Product;
import Production.Cost.Analysis.System.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public String listProducts(
            @RequestParam(value = "search", required = false) String search,
            Model model) {
        model.addAttribute("products", productService.searchProducts(search));
        model.addAttribute("search", search);
        model.addAttribute("activePage", "products");
        return "products";
    }

    @GetMapping("/new")
    public String newProductForm(Model model) {
        Product product = new Product();
        product.setProductCode(productService.generateUniqueProductCode());
        model.addAttribute("product", product);
        model.addAttribute("isNew", true);
        model.addAttribute("activePage", "products");
        return "product-form";
    }

    @GetMapping("/edit/{id}")
    public String editProductForm(@PathVariable Long id, Model model, RedirectAttributes ra) {
        return productService.getProductById(id).map(prod -> {
            model.addAttribute("product", prod);
            model.addAttribute("isNew", false);
            model.addAttribute("activePage", "products");
            return "product-form";
        }).orElseGet(() -> {
            ra.addFlashAttribute("errorMessage", "Product not found: " + id);
            return "redirect:/products";
        });
    }

    @PostMapping("/save")
    public String saveProduct(
            @Valid @ModelAttribute("product") Product product,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes ra) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("isNew", (product.getId() == null));
            model.addAttribute("activePage", "products");
            return "product-form";
        }
        try {
            productService.saveProduct(product);
            ra.addFlashAttribute("successMessage", "Product '" + product.getName() + "' saved successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Failed to save product: " + e.getMessage());
        }
        return "redirect:/products";
    }

    @GetMapping("/delete/{id}")
    public String deleteProduct(@PathVariable Long id, RedirectAttributes ra) {
        try {
            productService.deleteProduct(id);
            ra.addFlashAttribute("successMessage", "Product archived successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error deleting product: " + e.getMessage());
        }
        return "redirect:/products";
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/controller/ProductController.java", prod_ctrl)

    # 3. RawMaterialController.java
    mat_ctrl = '''package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.RawMaterial;
import Production.Cost.Analysis.System.service.MachineProductionService;
import Production.Cost.Analysis.System.service.RawMaterialService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.math.BigDecimal;

@Controller
@RequestMapping("/raw-materials")
public class RawMaterialController {

    private final RawMaterialService materialService;
    private final MachineProductionService productionService;

    public RawMaterialController(RawMaterialService materialService,
                                 MachineProductionService productionService) {
        this.materialService = materialService;
        this.productionService = productionService;
    }

    @GetMapping
    public String listMaterials(
            @RequestParam(value = "search", required = false) String search,
            Model model) {
        model.addAttribute("materials", materialService.searchMaterials(search));
        model.addAttribute("search", search);
        model.addAttribute("lowStockCount", materialService.getLowStockMaterials().size());
        model.addAttribute("activePage", "raw-materials");
        return "raw-materials";
    }

    @GetMapping("/new")
    public String newMaterialForm(Model model) {
        RawMaterial mat = new RawMaterial();
        mat.setMaterialCode(materialService.generateUniqueMaterialCode());
        model.addAttribute("material", mat);
        model.addAttribute("isNew", true);
        model.addAttribute("activePage", "raw-materials");
        return "raw-material-form";
    }

    @GetMapping("/edit/{id}")
    public String editMaterialForm(@PathVariable Long id, Model model, RedirectAttributes ra) {
        return materialService.getMaterialById(id).map(mat -> {
            model.addAttribute("material", mat);
            model.addAttribute("isNew", false);
            model.addAttribute("movements", materialService.getMovementsForMaterial(id));
            model.addAttribute("activePage", "raw-materials");
            return "raw-material-form";
        }).orElseGet(() -> {
            ra.addFlashAttribute("errorMessage", "Raw Material not found: " + id);
            return "redirect:/raw-materials";
        });
    }

    @PostMapping("/save")
    public String saveMaterial(
            @Valid @ModelAttribute("material") RawMaterial material,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes ra) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("isNew", (material.getId() == null));
            model.addAttribute("activePage", "raw-materials");
            return "raw-material-form";
        }
        try {
            materialService.saveMaterial(material);
            ra.addFlashAttribute("successMessage", "Material '" + material.getName() + "' saved successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error saving material: " + e.getMessage());
        }
        return "redirect:/raw-materials";
    }

    @PostMapping("/purchase")
    public String recordPurchase(
            @RequestParam("materialId") Long materialId,
            @RequestParam("quantity") BigDecimal quantity,
            @RequestParam(value = "unitPrice", required = false) BigDecimal unitPrice,
            @RequestParam(value = "notes", required = false) String notes,
            RedirectAttributes ra) {
        try {
            materialService.recordPurchase(materialId, quantity, unitPrice, notes);
            ra.addFlashAttribute("successMessage", "Stock added successfully from purchase order!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Failed to record purchase: " + e.getMessage());
        }
        return "redirect:/raw-materials";
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/controller/RawMaterialController.java", mat_ctrl)

    # 4. LabourCostController.java
    lbr_ctrl = '''package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.LabourCost;
import Production.Cost.Analysis.System.service.LabourCostService;
import Production.Cost.Analysis.System.service.MachineProductionService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.time.LocalDate;

@Controller
@RequestMapping("/labour-costs")
public class LabourCostController {

    private final LabourCostService labourCostService;
    private final MachineProductionService productionService;

    public LabourCostController(LabourCostService labourCostService,
                                MachineProductionService productionService) {
        this.labourCostService = labourCostService;
        this.productionService = productionService;
    }

    @GetMapping
    public String listLabour(
            @RequestParam(value = "search", required = false) String search,
            Model model) {
        model.addAttribute("labourList", labourCostService.searchLabour(search));
        model.addAttribute("search", search);
        model.addAttribute("activePage", "labour-costs");
        return "labour-costs";
    }

    @GetMapping("/new")
    public String newLabourForm(Model model) {
        LabourCost lc = new LabourCost();
        lc.setLabourCode(labourCostService.generateUniqueLabourCode());
        lc.setRecordedDate(LocalDate.now());
        model.addAttribute("labourCost", lc);
        model.addAttribute("productions", productionService.getAllProductions());
        model.addAttribute("isNew", true);
        model.addAttribute("activePage", "labour-costs");
        return "labour-cost-form";
    }

    @GetMapping("/edit/{id}")
    public String editLabourForm(@PathVariable Long id, Model model, RedirectAttributes ra) {
        return labourCostService.getLabourCostById(id).map(lc -> {
            model.addAttribute("labourCost", lc);
            model.addAttribute("productions", productionService.getAllProductions());
            model.addAttribute("isNew", false);
            model.addAttribute("activePage", "labour-costs");
            return "labour-cost-form";
        }).orElseGet(() -> {
            ra.addFlashAttribute("errorMessage", "Labour entry not found: " + id);
            return "redirect:/labour-costs";
        });
    }

    @PostMapping("/save")
    public String saveLabourCost(
            @Valid @ModelAttribute("labourCost") LabourCost labourCost,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes ra) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("productions", productionService.getAllProductions());
            model.addAttribute("isNew", (labourCost.getId() == null));
            model.addAttribute("activePage", "labour-costs");
            return "labour-cost-form";
        }
        try {
            labourCostService.saveLabourCost(labourCost);
            ra.addFlashAttribute("successMessage", "Labour entry " + labourCost.getLabourCode() + " saved successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error saving labour cost: " + e.getMessage());
        }
        return "redirect:/labour-costs";
    }

    @GetMapping("/delete/{id}")
    public String deleteLabourCost(@PathVariable Long id, RedirectAttributes ra) {
        try {
            labourCostService.deleteLabourCost(id);
            ra.addFlashAttribute("successMessage", "Labour cost record deleted.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error deleting record: " + e.getMessage());
        }
        return "redirect:/labour-costs";
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/controller/LabourCostController.java", lbr_ctrl)

    # 5. MachineProductionController.java
    mach_ctrl = '''package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.service.MachineProductionService;
import Production.Cost.Analysis.System.service.ProductService;
import Production.Cost.Analysis.System.service.RawMaterialService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.math.BigDecimal;
import java.time.LocalDate;

@Controller
@RequestMapping("/machine-productions")
public class MachineProductionController {

    private final MachineProductionService productionService;
    private final ProductService productService;
    private final RawMaterialService rawMaterialService;

    public MachineProductionController(
            MachineProductionService productionService,
            ProductService productService,
            RawMaterialService rawMaterialService) {
        this.productionService = productionService;
        this.productService = productService;
        this.rawMaterialService = rawMaterialService;
    }

    @GetMapping
    public String listProductions(
            @RequestParam(value = "search", required = false) String search,
            Model model) {
        model.addAttribute("productions", productionService.searchProductions(search));
        model.addAttribute("search", search);
        model.addAttribute("activePage", "machine-productions");
        return "machine-productions";
    }

    @GetMapping("/new")
    public String newProductionForm(Model model) {
        MachineProduction mp = new MachineProduction();
        mp.setProductionCode(productionService.generateUniqueProductionCode());
        mp.setProductionDate(LocalDate.now());
        mp.setBatchNumber("BATCH-" + System.currentTimeMillis() % 100000);
        model.addAttribute("production", mp);
        model.addAttribute("products", productService.getActiveProducts());
        model.addAttribute("materials", rawMaterialService.getAllMaterials());
        model.addAttribute("isNew", true);
        model.addAttribute("activePage", "machine-productions");
        return "machine-production-form";
    }

    @GetMapping("/edit/{id}")
    public String editProductionForm(@PathVariable Long id, Model model, RedirectAttributes ra) {
        return productionService.getProductionById(id).map(mp -> {
            model.addAttribute("production", mp);
            model.addAttribute("products", productService.getActiveProducts());
            model.addAttribute("materials", rawMaterialService.getAllMaterials());
            model.addAttribute("materialMovements", rawMaterialService.getMovementsForProduction(id));
            model.addAttribute("isNew", false);
            model.addAttribute("activePage", "machine-productions");
            return "machine-production-form";
        }).orElseGet(() -> {
            ra.addFlashAttribute("errorMessage", "Production record not found: " + id);
            return "redirect:/machine-productions";
        });
    }

    @PostMapping("/save")
    public String saveProduction(
            @Valid @ModelAttribute("production") MachineProduction production,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes ra) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("products", productService.getActiveProducts());
            model.addAttribute("materials", rawMaterialService.getAllMaterials());
            model.addAttribute("isNew", (production.getId() == null));
            model.addAttribute("activePage", "machine-productions");
            return "machine-production-form";
        }
        try {
            productionService.saveProduction(production);
            ra.addFlashAttribute("successMessage", "Production order " + production.getProductionCode() + " saved successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error saving production: " + e.getMessage());
        }
        return "redirect:/machine-productions";
    }

    @PostMapping("/consume-material")
    public String consumeMaterial(
            @RequestParam("productionId") Long productionId,
            @RequestParam("materialId") Long materialId,
            @RequestParam("quantity") BigDecimal quantity,
            @RequestParam(value = "notes", required = false) String notes,
            RedirectAttributes ra) {
        try {
            MachineProduction prod = productionService.getProductionById(productionId)
                    .orElseThrow(() -> new IllegalArgumentException("Production not found: " + productionId));
            rawMaterialService.consumeForProduction(materialId, prod, quantity, notes);
            ra.addFlashAttribute("successMessage", "Material deducted and logged against production order successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Material consumption failed: " + e.getMessage());
        }
        return "redirect:/machine-productions/edit/" + productionId;
    }

    @GetMapping("/delete/{id}")
    public String deleteProduction(@PathVariable Long id, RedirectAttributes ra) {
        try {
            productionService.deleteProduction(id);
            ra.addFlashAttribute("successMessage", "Production order deleted successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Cannot delete production order: " + e.getMessage());
        }
        return "redirect:/machine-productions";
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/controller/MachineProductionController.java", mach_ctrl)

    # 6. OtherExpenseController.java
    exp_ctrl = '''package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.OtherExpense;
import Production.Cost.Analysis.System.service.MachineProductionService;
import Production.Cost.Analysis.System.service.OtherExpenseService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.time.LocalDate;

@Controller
@RequestMapping("/other-expenses")
public class OtherExpenseController {

    private final OtherExpenseService expenseService;
    private final MachineProductionService productionService;

    public OtherExpenseController(OtherExpenseService expenseService,
                                  MachineProductionService productionService) {
        this.expenseService = expenseService;
        this.productionService = productionService;
    }

    @GetMapping
    public String listExpenses(
            @RequestParam(value = "search", required = false) String search,
            Model model) {
        model.addAttribute("expenses", expenseService.searchExpenses(search));
        model.addAttribute("search", search);
        model.addAttribute("activePage", "other-expenses");
        return "other-expenses";
    }

    @GetMapping("/new")
    public String newExpenseForm(Model model) {
        OtherExpense exp = new OtherExpense();
        exp.setExpenseCode(expenseService.generateUniqueExpenseCode());
        exp.setExpenseDate(LocalDate.now());
        model.addAttribute("expense", exp);
        model.addAttribute("productions", productionService.getAllProductions());
        model.addAttribute("isNew", true);
        model.addAttribute("activePage", "other-expenses");
        return "other-expense-form";
    }

    @GetMapping("/edit/{id}")
    public String editExpenseForm(@PathVariable Long id, Model model, RedirectAttributes ra) {
        return expenseService.getExpenseById(id).map(exp -> {
            model.addAttribute("expense", exp);
            model.addAttribute("productions", productionService.getAllProductions());
            model.addAttribute("isNew", false);
            model.addAttribute("activePage", "other-expenses");
            return "other-expense-form";
        }).orElseGet(() -> {
            ra.addFlashAttribute("errorMessage", "Expense not found: " + id);
            return "redirect:/other-expenses";
        });
    }

    @PostMapping("/save")
    public String saveExpense(
            @Valid @ModelAttribute("expense") OtherExpense expense,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes ra) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("productions", productionService.getAllProductions());
            model.addAttribute("isNew", (expense.getId() == null));
            model.addAttribute("activePage", "other-expenses");
            return "other-expense-form";
        }
        try {
            expenseService.saveExpense(expense);
            ra.addFlashAttribute("successMessage", "Expense " + expense.getExpenseCode() + " recorded successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error saving expense: " + e.getMessage());
        }
        return "redirect:/other-expenses";
    }

    @GetMapping("/delete/{id}")
    public String deleteExpense(@PathVariable Long id, RedirectAttributes ra) {
        try {
            expenseService.deleteExpense(id);
            ra.addFlashAttribute("successMessage", "Expense deleted successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error deleting expense: " + e.getMessage());
        }
        return "redirect:/other-expenses";
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/controller/OtherExpenseController.java", exp_ctrl)

    # 7. ProductionCostAnalysisController.java
    pca_ctrl = '''package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import Production.Cost.Analysis.System.service.MachineProductionService;
import Production.Cost.Analysis.System.service.ProductionCostAnalysisService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.math.BigDecimal;
import java.time.LocalDate;

@Controller
@RequestMapping("/production-cost-analysis")
public class ProductionCostAnalysisController {

    private final ProductionCostAnalysisService analysisService;
    private final MachineProductionService productionService;

    public ProductionCostAnalysisController(
            ProductionCostAnalysisService analysisService,
            MachineProductionService productionService) {
        this.analysisService = analysisService;
        this.productionService = productionService;
    }

    @GetMapping
    public String listAnalyses(Model model) {
        model.addAttribute("analyses", analysisService.getAllAnalyses());
        model.addAttribute("activePage", "production-cost-analysis");
        return "production-cost-analysis";
    }

    @GetMapping("/new")
    public String newAnalysisForm(Model model) {
        ProductionCostAnalysis pca = new ProductionCostAnalysis();
        pca.setAnalysisCode(analysisService.generateUniqueAnalysisCode());
        pca.setAnalysisDate(LocalDate.now());
        model.addAttribute("analysis", pca);
        model.addAttribute("productions", productionService.getAllProductions());
        model.addAttribute("isNew", true);
        model.addAttribute("activePage", "production-cost-analysis");
        return "production-cost-analysis-form";
    }

    @GetMapping("/edit/{id}")
    public String editAnalysisForm(@PathVariable Long id, Model model, RedirectAttributes ra) {
        return analysisService.getAnalysisById(id).map(pca -> {
            model.addAttribute("analysis", pca);
            model.addAttribute("productions", productionService.getAllProductions());
            model.addAttribute("isNew", false);
            model.addAttribute("activePage", "production-cost-analysis");
            return "production-cost-analysis-form";
        }).orElseGet(() -> {
            ra.addFlashAttribute("errorMessage", "Analysis record not found: " + id);
            return "redirect:/production-cost-analysis";
        });
    }

    /**
     * Automated Trigger: pulls real-time costs from Material, Labour, Machine, and Expenses
     * for a production order and computes totals automatically.
     */
    @PostMapping("/calculate")
    public String calculateForProduction(
            @RequestParam("productionId") Long productionId,
            @RequestParam(value = "actualSoldQuantity", required = false, defaultValue = "0") Integer actualSoldQty,
            @RequestParam(value = "sellingPricePerUnit", required = false) BigDecimal sellingPrice,
            @RequestParam(value = "notes", required = false) String notes,
            RedirectAttributes ra) {
        try {
            ProductionCostAnalysis analysis = analysisService.calculateOrUpdateForProduction(
                    productionId, actualSoldQty, sellingPrice, notes
            );
            ra.addFlashAttribute("successMessage", "Cost analysis " + analysis.getAnalysisCode() + " automatically calculated from database records!");
            return "redirect:/production-cost-analysis/edit/" + analysis.getId();
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Cost calculation failed: " + e.getMessage());
            return "redirect:/production-cost-analysis";
        }
    }

    @PostMapping("/save")
    public String saveAnalysis(
            @Valid @ModelAttribute("analysis") ProductionCostAnalysis analysis,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes ra) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("productions", productionService.getAllProductions());
            model.addAttribute("isNew", (analysis.getId() == null));
            model.addAttribute("activePage", "production-cost-analysis");
            return "production-cost-analysis-form";
        }
        try {
            analysisService.saveAnalysis(analysis);
            ra.addFlashAttribute("successMessage", "Cost Analysis " + analysis.getAnalysisCode() + " saved and verified successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error saving cost analysis: " + e.getMessage());
        }
        return "redirect:/production-cost-analysis";
    }

    @GetMapping("/delete/{id}")
    public String deleteAnalysis(@PathVariable Long id, RedirectAttributes ra) {
        try {
            analysisService.deleteAnalysis(id);
            ra.addFlashAttribute("successMessage", "Cost analysis record deleted.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error deleting analysis: " + e.getMessage());
        }
        return "redirect:/production-cost-analysis";
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/controller/ProductionCostAnalysisController.java", pca_ctrl)

    # 8. Main Application Class: ProductionCostSystemApplication.java
    app_java = '''package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.entity.User;
import Production.Cost.Analysis.System.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ProductionCostSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductionCostSystemApplication.class, args);
    }

    /**
     * Initializes default accounts if database is empty on first boot.
     */
    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                System.out.println(">>> Initializing default users for Seagull Printers System...");
                User admin = new User("admin", passwordEncoder.encode("seagull123"), "System Administrator", "admin@seagullprinters.com", "ROLE_ADMIN");
                User manager = new User("manager", passwordEncoder.encode("seagull123"), "Production Manager", "manager@seagullprinters.com", "ROLE_MANAGER");
                User staff = new User("staff", passwordEncoder.encode("seagull123"), "Floor Operator", "operator@seagullprinters.com", "ROLE_PRODUCTION_STAFF");

                userRepository.save(admin);
                userRepository.save(manager);
                userRepository.save(staff);
                System.out.println(">>> Default users created: admin/seagull123, manager/seagull123, staff/seagull123");
            }
        };
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/ProductionCostSystemApplication.java", app_java)

if __name__ == "__main__":
    build_controllers_and_app()
