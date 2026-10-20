package Production.Cost.Analysis.System.controller;

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
