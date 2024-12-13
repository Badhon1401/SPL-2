package com.bsse1401_bsse1429.TimeWise.service;

import com.bsse1401_bsse1429.TimeWise.model.UserPrincipal;
import com.bsse1401_bsse1429.TimeWise.model.Users;
import com.bsse1401_bsse1429.TimeWise.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = userRepo.findByUserName(username);  // Find user by username
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return new UserPrincipal(user);  // Return UserPrincipal
    }
}
