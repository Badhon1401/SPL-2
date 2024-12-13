package com.bsse1401_bsse1429.TimeWise.controller;

import com.bsse1401_bsse1429.TimeWise.model.Users;
import com.bsse1401_bsse1429.TimeWise.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    private UserService service;


    @PostMapping("/register")
    public String register(@RequestBody Users user) {
        System.out.println("Received user at the controller : " + user);
        return service.register(user);

    }

    @PostMapping("/login")
    public String login(@RequestBody Users user) {

        return service.verify(user);
    }
    @GetMapping("/check1")
    public String check1() {

        return "Hi there";

    }
    @GetMapping("/check2")
    public String check2() {

        return "Hi there from 2";

    }
}
