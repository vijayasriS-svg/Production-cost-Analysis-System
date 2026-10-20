package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.entity.Product;
import Production.Cost.Analysis.System.repository.ProductRepository;
import Production.Cost.Analysis.System.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setId(1L);
        sampleProduct.setName("A4 Glossy Flyer");
        sampleProduct.setCategory("Marketing");
        sampleProduct.setStandardCost(new BigDecimal("0.50"));
        sampleProduct.setStandardSellingPrice(new BigDecimal("1.20"));
    }

    @Test
    void testSaveProduct_GeneratesUniqueProductCodeWhenBlank() {
        when(productRepository.count()).thenReturn(5L);
        when(productRepository.existsByProductCode("PRD-006")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product saved = productService.saveProduct(sampleProduct);

        assertNotNull(saved.getProductCode());
        assertEquals("PRD-006", saved.getProductCode());
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    void testSaveProduct_ThrowsOnEmptyName() {
        sampleProduct.setName("   ");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            productService.saveProduct(sampleProduct);
        });
        assertTrue(ex.getMessage().contains("Product name cannot be empty"));
    }

    @Test
    void testDeleteProduct_SafeArchival() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        productService.deleteProduct(1L);

        assertFalse(sampleProduct.isActive());
        verify(productRepository).save(sampleProduct);
    }
}
