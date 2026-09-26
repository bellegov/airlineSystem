package com.lowcost.airlinebackend.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class SearchRequestDto {
    private String origin;
    private String destination;
    private LocalDate outboundDate; // Дата туда
    private LocalDate returnDate;   // Дата обратно (может быть null)
    private Integer passengers;
}