package com.kblab.service;

import com.kblab.model.Item;
import com.kblab.model.SimpleItem;
import com.kblab.model.Tester;
import com.kblab.repository.ItemRepository;
import com.kblab.repository.SimpleItemRepository;
import com.kblab.repository.TesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private SimpleItemRepository simpleItemRepository;
    
    @Autowired
    private TesterRepository testerRepository;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    public SimpleItem saveSimpleItem(SimpleItem item) {
        return simpleItemRepository.save(item);
    }

    public Tester saveTester(Tester tester) {
        return testerRepository.save(tester);
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
} 