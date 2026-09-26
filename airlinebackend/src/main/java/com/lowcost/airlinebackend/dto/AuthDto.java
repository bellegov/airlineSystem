package com.lowcost.airlinebackend.dto;
import lombok.Data;

@Data
public class AuthDto {
    private String username;
    private String password;
    private String fullName;
}