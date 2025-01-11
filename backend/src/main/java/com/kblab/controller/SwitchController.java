package com.kblab.controller;

import com.kblab.model.Switch;
import com.kblab.repository.SwitchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class SwitchController {

    @Autowired
    private SwitchRepository switchRepository;

    @GetMapping("/switches")
    public List<Switch> getAllSwitches() {
        return switchRepository.findAll();
    }
}
