package com.TimeWise.controller;


import com.TimeWise.service.MessageService;
import com.TimeWise.utils.MessageBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;


    @PostMapping("/send/user")
    public ResponseEntity<?> sendMessageToUser(@RequestBody MessageBody messageBody) {
        return messageService.sendMessage(messageBody);
    }
    @PostMapping("/send/team")
    public ResponseEntity<?> sendMessageToTeam(@RequestBody MessageBody messageBody) {
        return messageService.sendMessage(messageBody);
    }
    @PostMapping("/send/timewise")
    public ResponseEntity<?> sendMessageToTimeWise(@RequestBody MessageBody messageBody) {
        return messageService.sendMessage(messageBody);
    }
}
