package com.lowcost.airlinebackend.dto;
import lombok.Data;

@Data
public class BookingRequestDto {
    private Long userId;
    private Long outboundFlightId;
    private Long returnFlightId; // Может быть null
    private String seatClass;    // ECONOMY, STANDARD, BUSINESS
    private Integer passengers;
    private Boolean hasLuggage;
    private Boolean hasPriority;
    private Boolean hasMeal;
}