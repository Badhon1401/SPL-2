package com.TimeWise.service;

import com.TimeWise.utils.UserPrincipal;
import com.TimeWise.model.User;
import com.TimeWise.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username); // Ensure this method exists in the repository
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new UserPrincipal(user);
    }

    public UserPrincipal loadUserByUserId(ObjectId userId) throws UsernameNotFoundException {

        // Query the user from the repository
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UsernameNotFoundException("This User not found with ID: " + userId);
        }

        return new UserPrincipal(user);
    }
}
