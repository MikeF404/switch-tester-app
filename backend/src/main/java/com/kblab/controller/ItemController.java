package com.kblab.controller;

import com.kblab.model.Item;
import com.kblab.model.SimpleItem;
import com.kblab.model.Tester;
import com.kblab.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {
    @Autowired
    private ItemService itemService;

    @GetMapping
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemService.getItemById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/simple")
    public SimpleItem createSimpleItem(@RequestBody SimpleItem item) {
        return itemService.saveSimpleItem(item);
    }

    @PostMapping("/tester")
    public Tester createTester(@RequestBody Tester tester) {
        return itemService.saveTester(tester);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok().build();
    }
} 