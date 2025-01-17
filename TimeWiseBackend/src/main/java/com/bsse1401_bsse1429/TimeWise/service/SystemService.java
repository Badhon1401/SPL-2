package com.bsse1401_bsse1429.TimeWise.service;

import com.bsse1401_bsse1429.TimeWise.engine.AnalyticsEngine;
import com.bsse1401_bsse1429.TimeWise.engine.CollaborationEngine;
import com.bsse1401_bsse1429.TimeWise.model.Notification;
import com.bsse1401_bsse1429.TimeWise.model.PerformanceReport;
import com.bsse1401_bsse1429.TimeWise.model.ProgressReport;
import com.bsse1401_bsse1429.TimeWise.repository.*;
import com.bsse1401_bsse1429.TimeWise.utils.*;
import jakarta.annotation.PostConstruct;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.bsse1401_bsse1429.TimeWise.model.User;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@EnableAsync
public class SystemService {

    @Autowired
    private JWTService jwtServiceInstance;

    @Autowired
    private AuthenticationManager authManagerInstance;

    @Autowired
    private UserRepository userRepositoryInstance;

    @Autowired
    private TaskRepository taskRepositoryInstance;

    @Autowired
    private TeamRepository teamRepositoryInstance;

    @Autowired
    private ProgressReportRepository progressReportRepositoryInstance;

    @Autowired
    private PerformanceReportRepository performanceReportRepository;

    @Autowired
    private UserVerificationMessageRepository userVerificationMessageRepositoryInstance;

    private static JWTService jwtService;
    private static AuthenticationManager authManager;
    private static UserRepository userRepository;
    private static TaskRepository taskRepository;
    private static TeamRepository teamRepository;
    private static ProgressReportRepository progressReportRepository;
    private static UserVerificationMessageRepository userVerificationMessageRepository;

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @PostConstruct
    private void initStaticDependencies() {
        jwtService = jwtServiceInstance;
        authManager = authManagerInstance;
        userRepository = userRepositoryInstance;
        taskRepository = taskRepositoryInstance;
        teamRepository = teamRepositoryInstance;
        userVerificationMessageRepository = userVerificationMessageRepositoryInstance;
    }
    public static ResponseEntity<?> checkRegistrationCredentialsAndSendRegistrationVerificationCode(User user) {
        // Check if username or email already exists
        if (userRepository.findByUserName(user.getUserName())!=null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists.");
        }
//        if (userRepository.existsByEmail(user.getEmail())) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists.");
//        }

        // Generate a verification code
        UserVerificationMessage verificationCode=generateVerificationCode(user);
        userVerificationMessageRepository.deleteByUserNameOrUserEmail(user.getUserName(),user.getUserEmail());
        // Save verification code
        userVerificationMessageRepository.save(verificationCode);


        return ResponseEntity.ok(CollaborationEngine.sendUserRegistrationVerificationCode(user.getUserName(),user.getUserEmail(),verificationCode.getCode()));
    }

    public static ResponseEntity<?> verifyVerificationCodeAndCompleteRegistration(User user, String code) {
        // Check if the verification code is valid and not expired
        UserVerificationMessage verificationCode = userVerificationMessageRepository.findByUserEmail(user.getUserEmail());
        if (verificationCode == null ) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No verification code found for this email");
        }
        if(verificationCode.getExpiry().before(new Date())){
            userVerificationMessageRepository.delete(verificationCode);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Expired verification code.");
        }
        if(!verificationCode.getCode().equals(code)){
            userVerificationMessageRepository.delete(verificationCode);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Wrong verification code.Previous code became useless. Ask for new code if required. ");
        }

        // Verify email matches the user's email
        if (!user.getUserEmail().equals(verificationCode.getUserEmail()) || !user.getUserName().equals(verificationCode.getUserName())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Name or Email mismatch during verification.Please send the same credentials as before getting the verification code");
        }

        // Check if username or email already exists (revalidation)
        if (userRepository.findByUserName(user.getUserName())!=null) {
            userVerificationMessageRepository.delete(verificationCode);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sorry you have to register again with another name as in the mean time a new user with that user name registered");
        }
//        if (userRepository.existsByEmail(user.getEmail())) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists.");
//        }


        // Remove the verification code from the database
        userVerificationMessageRepository.delete(verificationCode);
        // Save the user in the database
        String rawPassword = user.getPassword();

        user.setPassword(encoder.encode(rawPassword));
        user.setUserStatus("Active");
        user.setTodos(new ArrayList<>());
        user.setUsersFollowing(new HashSet<>());
        if(user.getRole()==null){
            user.setRole("User");
        }
        if(user.getShortBioData()==null){
            user.setShortBioData("Myself "+user.getUserName());
        }

        userRepository.save(user);


        String response = CollaborationEngine.sendRegistrationSuccessfulMessage(user.getUserName(),user.getUserEmail());

        // Log saved data
        System.out.println("User saved: " + user);

        // Authenticate and generate token
        user.setPassword(rawPassword); // Reset raw password for login

        return performUserLogin(user);
    }

    public static ResponseEntity<?> performUserLogin(User user) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword())
            );

            if (authentication.isAuthenticated()) {
                User authenticatedUser = userRepository.findByUserName(user.getUserName());
                if (authenticatedUser == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found in the database.");
                }

                return ResponseEntity.ok("User logged in  successfully! Token: "+jwtService.generateToken(authenticatedUser.getUserId()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Authentication failed. Invalid credentials.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Authentication failed. Bad credentials.");
        }
    }

    public static ResponseEntity<?> handleForgotUserCredentials(String userEmail) {

        List<User> user = userRepository.findByUserEmail(userEmail);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase(); // Generate a 6-character code

        // Generate a verification code
        UserVerificationMessage verificationCode=new UserVerificationMessage(code,"User",userEmail,new Date(System.currentTimeMillis() + (7 * 60 * 1000)));

        userVerificationMessageRepository.deleteByUserEmail(userEmail);
        // Save verification code
        userVerificationMessageRepository.save(verificationCode);

        String response=CollaborationEngine.sendAccountVerificationCode(userEmail,verificationCode.getCode());

        return ResponseEntity.ok(response);

    }
    public static ResponseEntity<?> verifyVerificationCodeForAccountVerification(String code,String userEmail) {
        // Check if the verification code is valid and not expired
        UserVerificationMessage verificationCode = userVerificationMessageRepository.findByUserEmail(userEmail);
        if (verificationCode == null ) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No verification code found for this email");
        }
        if(verificationCode.getExpiry().before(new Date())){
            userVerificationMessageRepository.delete(verificationCode);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Expired verification code.");
        }
        if(!verificationCode.getCode().equals(code)){
            userVerificationMessageRepository.delete(verificationCode);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Wrong verification code.Previous code became useless. Ask for new code if required. ");
        }
        return ResponseEntity.ok(userRepository.findByUserEmail(userEmail));

    }

    private static UserVerificationMessage generateVerificationCode(User user) {
        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase(); // Generate a 6-character code

        return new UserVerificationMessage(
                code,
                user.getUserName(),
                user.getUserEmail(),
                new Date(System.currentTimeMillis() + (7 * 60 * 1000)) // 7 minutes expiry
        );

    }

    public static ResponseEntity<?> getUserAccountDetails(String userName) {
        // Check if the user exists
        User user = userRepository.findByUserName(userName);

        if (user != null) {
            // Initialize UserDetailResponse
            UserDetailResponse userDetailResponse = new UserDetailResponse();
            userDetailResponse.setUserName(user.getUserName());
            userDetailResponse.setUserEmail(user.getUserEmail());
            userDetailResponse.setShortBioData(user.getShortBioData());
            userDetailResponse.setRole(user.getRole());
            userDetailResponse.setUserStatus(user.getUserStatus());

            // Fetch tasks where user is a participant or tasks marked as public
            List<UserDetailResponse.UserTasks> userTasks = taskRepository.findAll().stream()
                    .filter(task ->
                            task.getTaskParticipants().contains(userName) ||
                                    "public".equalsIgnoreCase(task.getTaskVisibilityStatus()))
                    .map(task -> new UserDetailResponse.UserTasks(
                            task.getTaskName(),
                            task.getTaskCategory(),
                            task.getTaskDescription()
                    ))
                    .collect(Collectors.toList());
            userDetailResponse.setUserTasks(userTasks);

            // Fetch teams where user is a member or teams marked as public
            List<UserDetailResponse.UserTeams> userTeams = teamRepository.findAll().stream()
                    .filter(team ->
                            team.getTeamMembers().contains(userName) ||
                                    "public".equalsIgnoreCase(team.getTeamVisibilityStatus()))
                    .map(team -> new UserDetailResponse.UserTeams(
                            team.getTeamName(),
                            team.getTeamOwner(),
                            team.getTeamDescription()
                    ))
                    .collect(Collectors.toList());
            userDetailResponse.setUserTeams(userTeams);

            return ResponseEntity.ok(userDetailResponse);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @Scheduled(cron = "0 0 9,17,22 * * *") // 9 AM, 5 PM, 10 PM daily
    @Async("taskExecutor")
    public void sendDailyProgressReportToAllUsers() {
        Set<String> userNames = userRepository.findAllUserNames();
        processReports(userNames, this::generateAndSendDailyReport);
    }


    @Scheduled(cron = "0 0 20 * * THU") // 8 PM every Thursday
    @Async("taskExecutor")
    public void sendWeeklyPerformanceReportToAllUsers() {
        Set<String> userNames = userRepository.findAllUserNames();
        processReports(userNames, this::generateAndSendWeeklyReport);
    }


    private void processReports(Set<String> userNames, Consumer<String> reportProcessor) {
        for (String userName : userNames) {
            CompletableFuture.runAsync(() -> reportProcessor.accept(userName));
        }
    }


    private void generateAndSendDailyReport(String userName) {
        try {
            ProgressReport report = AnalyticsEngine.generateProgressReport(userName);
            if (report != null) {
                progressReportRepository.save(report);
                String message = generateMessageDescriptionFromProgressReport(report);
                CollaborationEngine.sendProgressAndPerformanceReport(message, userName, true);
            }
        } catch (Exception e) {
            logError(e, "Daily Progress Report", userName);
        }
    }


    private void generateAndSendWeeklyReport(String userName) {
        try {
            PerformanceReport report = AnalyticsEngine.generateWeeklyPerformanceReport(userName);
            if (report != null) {
                performanceReportRepository.save(report);
                String message = generateMessageDescriptionFromPerformanceReport(report);
                CollaborationEngine.sendProgressAndPerformanceReport(message, userName, false);
            }
        } catch (Exception e) {
            logError(e, "Weekly Performance Report", userName);
        }
    }


    private void logError(Exception e, String reportType, String userName) {
        System.err.println("Failed to generate " + reportType + " for user: " + userName);
        e.printStackTrace();
    }
    @Async
    public String generateMessageDescriptionFromProgressReport(ProgressReport progressReport) {
        // Separate tasks into deadline crossed and non-crossed categories
        List<ProgressReport.TaskStatus> deadlineCrossedTasks = progressReport.getTaskStatuses().stream()
                .filter(ProgressReport.TaskStatus::getIsDeadlineCrossed)
                .toList();

        List<ProgressReport.TaskStatus> nonDeadlineCrossedTasks = progressReport.getTaskStatuses().stream()
                .filter(task -> !task.getIsDeadlineCrossed())
                .toList();

        // Build descriptive notification messages
        StringBuilder messageBuilder = new StringBuilder();
        messageBuilder.append("Progress Report Summary for ").append(progressReport.getUserName()).append(":\n\n");

        if (!deadlineCrossedTasks.isEmpty()) {
            messageBuilder.append("Tasks with Crossed Deadlines:\n");
            for (ProgressReport.TaskStatus task : deadlineCrossedTasks) {
                messageBuilder.append("- Task: ").append(task.getTaskName())
                        .append(", Owner: ").append(task.getTaskOwner())
                        .append(", Priority: ").append(task.getTaskPriority())
                        .append(", Progress: ").append(task.getTasksCurrentProgress()).append("%\n");
            }
            messageBuilder.append("\n");
        }

        if (!nonDeadlineCrossedTasks.isEmpty()) {
            messageBuilder.append("Tasks with Deadlines Remaining:\n");
            for (ProgressReport.TaskStatus task : nonDeadlineCrossedTasks) {
                messageBuilder.append("- Task: ").append(task.getTaskName())
                        .append(", Owner: ").append(task.getTaskOwner())
                        .append(", Priority: ").append(task.getTaskPriority())
                        .append(", Progress: ").append(task.getTasksCurrentProgress()).append("%\n");
            }
            messageBuilder.append("\n");
        }

        if (deadlineCrossedTasks.isEmpty() && nonDeadlineCrossedTasks.isEmpty()) {
            messageBuilder.append("No tasks available in the progress report.\n");
        }

        return messageBuilder.toString();
    }

    public static String generateMessageDescriptionFromPerformanceReport(PerformanceReport performanceReport) {
        StringBuilder messageBuilder = new StringBuilder();

        messageBuilder.append("Performance Summary for ").append(performanceReport.getUserName()).append(":\n\n");

        // Include UsersTaskStatistics summary
        UsersTaskStatistics taskStats = performanceReport.getUsersTaskStatistics();
        if (taskStats != null) {
            messageBuilder.append("Task Performance Summary:\n")
                    .append("  - Tasks Completed Before Deadline: ")
                    .append(String.join(", ", taskStats.getTasksCompletedBeforeDeadline())).append("\n")
                    .append("  - Tasks Completed After Deadline: ")
                    .append(String.join(", ", taskStats.getTasksCompletedAfterDeadline())).append("\n")
                    .append("  - Unfinished Tasks with Deadline Remaining: ")
                    .append(String.join(", ", taskStats.getDeadlineUncrossedAndUnfinishedTasks())).append("\n")
                    .append("  - Unfinished Tasks with Deadline Crossed: ")
                    .append(String.join(", ", taskStats.getDeadlineCrossedAndUnfinishedTasks())).append("\n\n");
        }

        // Include UsersSessionStatistics summary
        UsersSessionStatistics sessionStats = performanceReport.getUsersSessionStatistics();
        if (sessionStats != null) {
            messageBuilder.append("Session Performance Summary:\n")
                    .append("  - Total Sessions: ").append(sessionStats.getNumberOfSession()).append("\n")
                    .append("  - Total Session Time: ").append(String.format("%.2f hours", sessionStats.getTotalSessionTime())).append("\n")
                    .append("  - Average Efficiency: ").append(String.format("%.2f%%", sessionStats.getAverageSessionEfficiency())).append("\n")
                    .append("  - Total Tasks Operated: ").append(sessionStats.getTotalTasksOperated()).append("\n")
                    .append("  - Session Names: ").append(String.join(", ", sessionStats.getSessionNames())).append("\n\n");
        }

        // Include UsersFeedbackStatistics summary
        UsersFeedbackStatistics feedbackStats = performanceReport.getUsersFeedbackStatistics();
        if (feedbackStats != null) {
            messageBuilder.append("Feedback Summary:\n")
                    .append("  - Total Feedback Count: ").append(feedbackStats.getFeedbackCount()).append("\n")
                    .append("  - Average Feedback Score: ").append(String.format("%.2f", feedbackStats.getAverageFeedbackScore())).append("\n")
                    .append("  - Feedback Messages:\n").append(String.join("\n", feedbackStats.getFeedbackMessages())).append("\n\n");
        }

        // Include UsersAccountStatistics summary
        UsersAccountStatistics accountStats = performanceReport.getUsersAccountStatistics();
        if (accountStats != null) {
            messageBuilder.append("Account Activity Summary:\n")
                    .append("  - Users Following: ").append(accountStats.getNumberOfUserFollowing()).append("\n")
                    .append("  - Teams Participated: ").append(accountStats.getTeamsParticipated()).append("\n")
                    .append("  - Tasks Participated: ").append(accountStats.getNumberOfTasksParticipated()).append("\n")
                    .append("  - Sessions Created: ").append(accountStats.getNumberOfSessionsCreated()).append("\n")
                    .append("  - Messages Sent: ").append(accountStats.getNumberOfMessagesSent()).append("\n")
                    .append("  - Messages Received: ").append(accountStats.getNumberOfMessagesReceived()).append("\n")
                    .append("  - Previous Feedback Scores: ").append(accountStats.getPreviousFeedbackScores().toString()).append("\n");
        }
        return messageBuilder.toString();


    }



}
