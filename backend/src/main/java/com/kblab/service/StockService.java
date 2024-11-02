package com.kblab.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import com.kblab.enums.ItemType;
import com.kblab.enums.KeycapType;
import com.kblab.model.Switch;
import com.kblab.repository.SwitchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;

@Service
public class StockService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private SwitchRepository switchRepository;

    @Autowired
    private PriceService priceService;

    // Method to validate cart JSON
    public boolean validateCart(String itemsJson) {
        try {
            JsonNode items = objectMapper.readTree(itemsJson);
            for (JsonNode item : items) {
                if (!validateItem(item)) {
                    return false;  // Invalid item detected
                }
            }
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Method to validate individual item
    private boolean validateItem(JsonNode item) {
        String itemName = item.get("name").asText();
        if (!ItemType.isValid(itemName)) {
            return false;
        }

        int quantity = item.get("quantity").asInt(-1);
        if (quantity <= 0) {
            return false;  // Quantity must be a positive integer
        }

        // Replace price with calculated price
        double calculatedPrice = priceService.getPrice(item);
        ((ObjectNode) item).put("price", calculatedPrice);

        if (itemName.equals(ItemType.CUSTOM_SWITCH_TESTER.name())) {
            return validateCustomSwitchTester(item);
        }

        return true;
    }

    // Method to validate custom switch tester
    private boolean validateCustomSwitchTester(JsonNode item) {
        int size = item.get("size").asInt();
        if (size != 10 && size != 15 && size != 20) {
            return false;
        }

        String keycaps = item.get("keycaps").asText();
        if (!KeycapType.isValid(keycaps)) {
            return false;
        }

        JsonNode switches = item.get("switches");
        if (!switches.isArray()) {
            return false;
        }

        int totalSwitchQuantity = 0;
        for (JsonNode switchNode : switches) {
            Long switchId = switchNode.get("id").asLong();
            int switchQuantity = switchNode.get("quantity").asInt();

            totalSwitchQuantity += switchQuantity;
            if (!isSwitchInStock(switchId, switchQuantity)) {
                return false;  // Not enough stock for this switch
            }
        }

        return totalSwitchQuantity == size;
    }

    // Method to check stock for individual switch
    private boolean isSwitchInStock(Long switchId, int requiredQuantity) {
        Switch sw = switchRepository.findById(switchId).orElse(null);
        return sw != null && sw.getStock() >= requiredQuantity;
    }

    // Transactional method for stock check and decrement
    @Transactional
    public boolean checkAndDecrementStock(String itemsJson) {
        if (!validateCart(itemsJson)) {
            return false;
        }

        try {
            JsonNode items = objectMapper.readTree(itemsJson);
            for (JsonNode item : items) {
                if (item.get("name").asText().equals(ItemType.CUSTOM_SWITCH_TESTER.name())) {
                    for (JsonNode switchNode : item.get("switches")) {
                        Long switchId = switchNode.get("id").asLong();
                        int quantity = switchNode.get("quantity").asInt();
                        Switch sw = switchRepository.findById(switchId).orElseThrow();
                        sw.setStock(sw.getStock() - quantity);
                        switchRepository.save(sw);
                    }
                }
            }
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
}

