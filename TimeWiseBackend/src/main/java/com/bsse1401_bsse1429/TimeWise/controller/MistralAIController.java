package com.bsse1401_bsse1429.TimeWise.controller;

import com.bsse1401_bsse1429.TimeWise.service.MistralAIService;
import com.bsse1401_bsse1429.TimeWise.utils.GenerateTaskRequestBody;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/ai")
public class MistralAIController {

    private final MistralAIService mistralAIService;

    @PostMapping("/generatetasks")
    public Map<String, Object> generateTasks(@RequestBody GenerateTaskRequestBody requestBody) {
        // Format the final deadline and current date for prompt
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        String currentDate = dateFormat.format(new java.util.Date());
        String finalDeadline = dateFormat.format(requestBody.getGoalDeadline());

        // Generate a well-crafted prompt
        String prompt = String.format(
                "You are an AI assistant helping with goal planning. The goal is '%s'. Create a list of tasks to achieve this goal. Each task must include: "
                        + "taskName, taskCategory, taskDescription, taskPriority (low, medium, high), "
                        + "taskVisibilityStatus (public/private), and taskDeadline. Ensure task deadlines start from '%s' and do not exceed '%s'. "
                        + "Respond in JSON format as a list of task objects.",
                requestBody.getGoalName(), currentDate, finalDeadline
        );

        // Call the service to generate tasks
        String response = mistralAIService.generateResponse(prompt);

        return Map.of("tasks", response);
    }
}
