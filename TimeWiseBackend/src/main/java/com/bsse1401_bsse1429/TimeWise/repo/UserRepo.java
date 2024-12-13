package com.bsse1401_bsse1429.TimeWise.repo;

import com.bsse1401_bsse1429.TimeWise.model.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends MongoRepository<Users, Integer> {

    Users findByUserName(String username);
    Users findByEmail(String email);
    Users findByUserNameAndPassword(String username, String password);

}
