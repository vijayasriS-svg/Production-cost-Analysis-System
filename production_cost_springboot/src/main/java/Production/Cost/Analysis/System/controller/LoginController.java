package Production.Cost.Analysis.System.controller;

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
