package com.kblab;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class StockServiceUnitTest {

    @Autowired
    private StockService stockService;

    @Autowired
    private PriceService priceService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testValidSimpleItem() throws Exception {
        String json = """
            [
                {
                    "name": "SIMPLE_ITEM_1",
                    "quantity": 2,
                    "price": 0
                }
            ]
            """;

        JsonNode jsonNode = objectMapper.readTree(json);

        // Check if price was updated correctly
        assertEquals(19.99, priceService.getPrice(jsonNode.get(0)), "Price should be updated from PriceService");
    }

    @Test
    void testInvalidItemName() throws Exception {
        String json = """
            [
                {
                    "name": "INVALID_ITEM",
                    "quantity": 2,
                    "price": 0
                }
            ]
            """;

        boolean isValid = stockService.validateCart(json);
        assertFalse(isValid, "Item with an invalid name should be invalid");
    }

    @Test
    void testPriceServiceCustomSwitchTester() throws Exception {
        String json = """
            [
                {
                    "name": "CUSTOM_SWITCH_TESTER",
                    "size": 10,
                    "keycaps": "TRANSPARENT",
                    "price": 0,
                    "quantity": 1,
                    "switches": [
                        { "id": 1, "quantity": 5 },
                        { "id": 2, "quantity": 5 }
                    ]
                },
                {
                    "name": "CUSTOM_SWITCH_TESTER",
                    "size": 15,
                    "keycaps": "NONE",
                    "quantity": 1,
                    "price": 0,
                    "switches": [
                        { "id": 1, "quantity": 10 },
                        { "id": 2, "quantity": 5 }
                    ]
                }
            ]
            """;

        JsonNode jsonNode = objectMapper.readTree(json);

         // Check if price was updated correctly
        assertEquals(11.99, priceService.getPrice(jsonNode.get(0)), "Testing price calculation for Custom Switch Tester 1");
        assertEquals(13.99, priceService.getPrice(jsonNode.get(1)), "Testing price calculation for Custom Switch Tester 2");
    }

    @Test
    void testInvalidCustomSwitchTesterQuantity() throws Exception {
        String json = """
            [
                {
                    "name": "CUSTOM_SWITCH_TESTER",
                    "size": 10,
                    "keycaps": "RANDOM",
                    "price": 0,
                    "quantity": 1,
                    "switches": [
                        { "id": 1, "quantity": 5 },
                        { "id": 2, "quantity": 6 }  // Exceeds size
                    ]
                }
            ]
            """;

        boolean isValid = stockService.validateCart(json);
        assertFalse(isValid, "Custom Switch Tester with incorrect switch quantity should be invalid");
    }

    @Test
    void testInvalidCustomSwitchTesterKeycaps() throws Exception {
        String json = """
            [
                {
                    "name": "CUSTOM_SWITCH_TESTER",
                    "size": 10,
                    "keycaps": "INVALID",
                    "quantity": 1,
                    "price": 0,
                    "switches": [
                        { "id": 1, "quantity": 5 },
                        { "id": 2, "quantity": 5 }
                    ]
                }
            ]
            """;

        boolean isValid = stockService.validateCart(json);
        assertFalse(isValid, "Custom Switch Tester with invalid keycaps should be invalid");
    }
}
