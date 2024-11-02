package com.kblab.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.kblab.enums.ItemType;
import com.kblab.enums.KeycapType;
import org.springframework.stereotype.Service;

@Service
public class PriceService {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public double getPrice(JsonNode item) {
        String itemName = item.get("name").asText();

        switch (ItemType.valueOf(itemName.toUpperCase())) {
            case SIMPLE_ITEM_1:
                return 19.99;
            case SIMPLE_ITEM_2:
                return 24.99;
            case CUSTOM_SWITCH_TESTER:
                int size = item.get("size").asInt();
                String keycaps = item.get("keycaps").asText();
                return calculateCustomSwitchTesterPrice(size, keycaps);
            default:
                throw new IllegalArgumentException("Illegal item name");
        }
    }

    private double calculateCustomSwitchTesterPrice(int size, String keycaps) {
        double price;
        switch (size){
            case 10 -> price = 9.99;
            case 15 -> price = 13.99;
            case 20 -> price = 17.99;
            default -> throw new IllegalStateException("Illegal switch tester size");
        }
        return switch (KeycapType.valueOf(keycaps.toUpperCase())) {
            case NONE -> price;
            case TRANSPARENT -> price + (size * 0.2);
            case RANDOM -> price + (size * 0.1);
            default -> throw new IllegalArgumentException("Illegal keycap type");
        };
      }

    public String updatePrice(String itemsJson) {
        try {
            JsonNode items = objectMapper.readTree(itemsJson);

            for (JsonNode item : items) {
                double price = getPrice(item);
                ((ObjectNode) item).put("price", price);
            }

            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            e.printStackTrace();
            return itemsJson;  // Fallback to original JSON in case of error
        }
    }
}
