package com.lowcost.airlinebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "flights")
@Data
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String flightNumber;      // ✅ ДОБАВЬ — например "LC-1042"
    private String origin;
    private String destination;

    // ❌ УБЕРИ departureDate — она дублирует departureTime
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String flightDuration;
    private String airplaneModel;
    private Integer totalSeats;

    // Базовые цены (не меняются — хранятся в БД)
    private Double basePriceEconomy;   // ✅ ДОБАВЬ
    private Double basePriceStandard;  // ✅ ДОБАВЬ
    private Double basePriceBusiness;  // ✅ ДОБАВЬ

    // Текущие цены (для расчётов — НЕ сохраняем в БД)
    @Transient                         // ✅ ДОБАВЬ аннотацию — JPA не будет трогать эти поля
    private Double priceEconomy;
    @Transient
    private Double priceStandard;
    @Transient
    private Double priceBusiness;
}