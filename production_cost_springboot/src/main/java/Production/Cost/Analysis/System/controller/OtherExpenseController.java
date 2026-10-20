package Production.Cost.Analysis.System.controller;

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
