package com.lowcost.airlinebackend.dto;
import com.lowcost.airlinebackend.model.Flight;
import lombok.Data;

@Data
public class FlightResponseDto {
    private Flight flight;
    private Double priceEconomy;    // ✅ вместо currentDynamicPrice
    private Double priceStandard;
    private Double priceBusiness;
    private Integer availableSeats;
}