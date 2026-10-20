package Production.Cost.Analysis.System.controller;

import Production.Cost.Analysis.System.entity.User;
import Production.Cost.Analysis.System.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String listUsers(Model model) {
        model.addAttribute("users", userRepository.findAll());
        model.addAttribute("activePage", "users");
        return "users";
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public String createUser(
            @RequestParam("username") String username,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("role") String role,
            @RequestParam("initialPassword") String initialPassword,
            RedirectAttributes ra) {
        try {
            if (userRepository.existsByUsername(username)) {
                ra.addFlashAttribute("errorMessage", "Username '" + username + "' is already taken.");
                return "redirect:/users";
            }
            if (userRepository.existsByEmail(email)) {
                ra.addFlashAttribute("errorMessage", "Email '" + email + "' is already registered.");
                return "redirect:/users";
            }

            // Create new user with mustChangePassword = true
            User newUser = new User(username, passwordEncoder.encode(initialPassword), fullName, email, role, true);
            userRepository.save(newUser);
            ra.addFlashAttribute("successMessage", "User '" + username + "' created successfully with an initial temporary password. The user will be required to change it upon first login.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Failed to create user: " + e.getMessage());
        }
        return "redirect:/users";
    }

    @GetMapping("/change-password")
    public String changePasswordPage(Model model, Authentication auth) {
        model.addAttribute("username", auth.getName());
        return "change-password";
    }

    @PostMapping("/change-password")
    public String updatePassword(
            @RequestParam("newPassword") String newPassword,
            @RequestParam("confirmPassword") String confirmPassword,
            Authentication auth,
            RedirectAttributes ra) {
        if (!newPassword.equals(confirmPassword)) {
            ra.addFlashAttribute("errorMessage", "New passwords do not match.");
            return "redirect:/users/change-password";
        }
        if (newPassword.length() < 6) {
            ra.addFlashAttribute("errorMessage", "Password must be at least 6 characters long.");
            return "redirect:/users/change-password";
        }

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);

        ra.addFlashAttribute("successMessage", "Password updated successfully! Welcome to Seagull Printers.");
        return "redirect:/dashboard";
    }

    @PostMapping("/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public String resetUserPassword(
            @RequestParam("userId") Long userId,
            @RequestParam("tempPassword") String tempPassword,
            RedirectAttributes ra) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            user.setPassword(passwordEncoder.encode(tempPassword));
            user.setMustChangePassword(true);
            userRepository.save(user);
            ra.addFlashAttribute("successMessage", "Password for user '" + user.getUsername() + 
                    "' successfully reset to temporary password. The user must update their password on next login.");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Failed to reset password: " + e.getMessage());
        }
        return "redirect:/users";
    }
}
