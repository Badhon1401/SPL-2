package com.bsse1401_bsse1429.TimeWise.repository;

import com.bsse1401_bsse1429.TimeWise.model.Team;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends MongoRepository<Team, ObjectId> {
    Team findByTeamName(String teamName);

    List<Team> findByTeamMembersContaining(String userName);
}
