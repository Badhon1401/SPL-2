package com.TimeWise.repository;


import com.TimeWise.model.Feedback;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FeedbackRepository extends MongoRepository<Feedback, ObjectId> {
    List<Feedback> findByFeedbackRecipientsContains(String userName);
}
