package Production.Cost.Analysis.System.controller;

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
