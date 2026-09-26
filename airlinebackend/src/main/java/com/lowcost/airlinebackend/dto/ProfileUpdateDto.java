package com.lowcost.airlinebackend.dto;
import lombok.Data;

@Data
public class ProfileUpdateDto {
    private String fullName;
    private String password; // Опционально
}