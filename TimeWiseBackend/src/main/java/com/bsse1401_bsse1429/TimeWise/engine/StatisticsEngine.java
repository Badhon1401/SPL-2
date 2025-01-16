package com.bsse1401_bsse1429.TimeWise.engine;

import com.bsse1401_bsse1429.TimeWise.model.Feedback;
import com.bsse1401_bsse1429.TimeWise.model.Session;
import com.bsse1401_bsse1429.TimeWise.model.Task;
import com.bsse1401_bsse1429.TimeWise.repository.*;
import com.bsse1401_bsse1429.TimeWise.utils.UsersFeedbackStatistics;
import com.bsse1401_bsse1429.TimeWise.utils.UsersSessionStatistics;
import com.bsse1401_bsse1429.TimeWise.utils.UsersTaskStatistics;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class StatisticsEngine {

    @Autowired
    private TeamRepository teamRepositoryInstance;

    @Autowired
    private TaskRepository taskRepositoryInstance;

    @Autowired
    private UserRepository userRepositoryInstance;

    @Autowired
    private SessionRepository sessionRepositoryInstance;

    @Autowired
    private FeedbackRepository feedbackRepositoryInstance;

    @Autowired
    private ProgressReportRepository progressReportRepositoryInstance;

    private static UserRepository userRepository;
    private static TeamRepository teamRepository;
    private static TaskRepository taskRepository;
    private static SessionRepository sessionRepository;
    private static FeedbackRepository feedbackRepository ;
    private static ProgressReportRepository progressReportRepository;

    @PostConstruct
    private void initStaticDependencies() {
        userRepository = userRepositoryInstance;
        teamRepository=teamRepositoryInstance;
        taskRepository=taskRepositoryInstance;
        sessionRepository=sessionRepositoryInstance;
        progressReportRepository=progressReportRepositoryInstance;
        feedbackRepository=feedbackRepositoryInstance;
    }

    public static UsersTaskStatistics calculateTaskStatistics(String userName) {
        List<Task> tasks = taskRepository.findByTaskParticipantsContains(userName);
        UsersTaskStatistics taskPerformance = new UsersTaskStatistics(
                new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>()
        );

        Date currentDate = new Date();
        for (Task task : tasks) {
            boolean isCompleted = task.getTaskCurrentProgress() >= 100;
            boolean isDeadlineCrossed = task.getTaskDeadline().before(currentDate);

            if (isCompleted && !isDeadlineCrossed) {
                taskPerformance.getTasksCompletedBeforeDeadline().add(task.getTaskName());
            } else if (isCompleted) {
                taskPerformance.getTasksCompletedAfterDeadline().add(task.getTaskName());
            } else if (!isDeadlineCrossed) {
                taskPerformance.getDeadlineUncrossedAndUnfinishedTasks().add(task.getTaskName());
            } else {
                taskPerformance.getDeadlineCrossedAndUnfinishedTasks().add(task.getTaskName());
            }
        }

        return taskPerformance;
    }

    public static UsersSessionStatistics calculateSessionStatistics(String userName, int numberOfDays) {
        List<Session> sessions = sessionRepository.findBySessionCreator(userName);
        Date cutoffDate = calculateCutoffDate(numberOfDays);

        int sessionCount = 0;
        double totalSessionTime = 0; // in minutes
        double totalEfficiency = 0;
        int totalTasksOperated = 0;
        List<String> sessionNames = new ArrayList<>();

        for (Session session : sessions) {
            if (session.getSessionTimeStamp().after(cutoffDate)) {
                sessionCount++;
                totalSessionTime += session.getDuration();
                totalEfficiency += session.getSessionEfficiency();
                totalTasksOperated += session.getTasksOperated().size();
                sessionNames.add(session.getSessionGoal());
            }
        }

        double averageEfficiency = sessionCount > 0 ? totalEfficiency / sessionCount : 0;
        return new UsersSessionStatistics(
                sessionCount,
                totalSessionTime / 60.0, // Convert to hours
                averageEfficiency,
                totalTasksOperated,
                sessionNames
        );
    }

    public static UsersFeedbackStatistics calculateFeedbackStatistics(String userName) {
        List<Feedback> feedbacks = feedbackRepository.findByFeedbackRecipientsContains(userName);
        int feedbackCount = feedbacks.size();
        double totalScore = 0;
        List<String> feedbackMessages = new ArrayList<>();

        for (Feedback feedback : feedbacks) {
            totalScore += feedback.getFeedbackScore();
            feedbackMessages.add(feedback.getFeedbackMessage());
        }

        double averageScore = feedbackCount > 0 ? totalScore / feedbackCount : 0;
        return new UsersFeedbackStatistics(feedbackCount, averageScore, feedbackMessages);
    }


    private static Date calculateCutoffDate(int numberOfDays) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, -numberOfDays);
        return calendar.getTime();
    }



}
