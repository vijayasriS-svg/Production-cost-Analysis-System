package Production.Cost.Analysis.System.controller;

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
