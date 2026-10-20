package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.RawMaterial;
import Production.Cost.Analysis.System.entity.MachineProduction;
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
        model.addAttribute("productions", productionService.getAllProductions());
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

    @PostMapping("/consume")
    public String recordConsumption(
            @RequestParam("materialId") Long materialId,
            @RequestParam("quantity") BigDecimal quantity,
            @RequestParam(value = "productionId", required = false) Long productionId,
            @RequestParam(value = "notes", required = false) String notes,
            RedirectAttributes ra) {
        try {
            MachineProduction prod = null;
            if (productionId != null) {
                prod = productionService.getProductionById(productionId).orElse(null);
            }
            materialService.consumeForProduction(materialId, prod, quantity, notes);
            ra.addFlashAttribute("successMessage", "Material consumption recorded and stock deducted successfully!");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Failed to record consumption: " + e.getMessage());
        }
        return "redirect:/raw-materials";
    }
}
