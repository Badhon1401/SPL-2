package com.TimeWise.utils;

import lombok.*;

import java.util.Date;
import java.util.List;
import java.util.Set;


@Data
@NoArgsConstructor
@AllArgsConstructor
    public  class TeamDetailResponse {
        private String teamName;
        private String teamDescription;
        private Set<String> teamMembers;
        private String teamOwner;
        private Date creationDate;

    }

