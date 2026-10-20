package Production.Cost.Analysis.System.controller;

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
