package com.TimeWise.controller;

import com.TimeWise.model.User;
import com.TimeWise.service.SystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/timewise")
public class SystemController {
    @Autowired
    private SystemService systemService;


}
