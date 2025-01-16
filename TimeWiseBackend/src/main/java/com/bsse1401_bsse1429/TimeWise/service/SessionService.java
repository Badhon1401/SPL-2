package com.bsse1401_bsse1429.TimeWise.service;

import com.bsse1401_bsse1429.TimeWise.model.Session;
import com.bsse1401_bsse1429.TimeWise.repository.SessionRepository;
import com.bsse1401_bsse1429.TimeWise.utils.UserCredentials;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    // Create a new session
    public Session createSession(Session session) {
        session.setSessionTimeStamp(new Date()); // Set the timestamp
        return sessionRepository.save(session);
    }

    // Get a session by ID
    public Session getSessionById(String id) {
        String  currentUser= UserCredentials.getCurrentUsername();
        Session session= sessionRepository.findBySessionId(id);
        if(session==null){
            return null;
        }
        if(!session.getSessionCreator().equals(currentUser)){
            return null;
        }
        return session;

    }



    // Delete a session by ID
    public Session deleteSession(String id) {
        String  currentUser= UserCredentials.getCurrentUsername();
        Session session= sessionRepository.findBySessionId(id);
        if(session==null){
            return null;
        }
        if(!session.getSessionCreator().equals(currentUser)){
            return null;
        }
        sessionRepository.delete(session);
        return session;
    }

    // Get sessions by creator
    public List<Session> getAllSessionsOfAnUser() {
        String  currentUser= UserCredentials.getCurrentUsername();
        List<Session> sessions= sessionRepository.findBySessionCreator(currentUser);
        if(sessions.isEmpty()){
            return null;
        }
        return sessions;
    }

}

