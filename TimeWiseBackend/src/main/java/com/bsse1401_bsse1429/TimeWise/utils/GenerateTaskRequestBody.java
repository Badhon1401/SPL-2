package com.bsse1401_bsse1429.TimeWise.utils;

import lombok.Getter;
import lombok.Setter;
import java.util.Date;

@Getter
@Setter
public class GenerateTaskRequestBody {
    private String goalName;
    private Date goalDeadline;
}
