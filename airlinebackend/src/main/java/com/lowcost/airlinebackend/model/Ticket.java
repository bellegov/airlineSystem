package com.lowcost.airlinebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "flight_outbound_id")
    private Flight outboundFlight;

    @ManyToOne
    @JoinColumn(name = "flight_return_id")
    private Flight returnFlight;

    private String seatClass;
    private Integer passengersCount;
    private Boolean hasLuggage;
    private Boolean hasPriority;
    private Boolean hasMeal;
    private Double finalPrice;
    private LocalDateTime purchaseDate;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    public enum TicketStatus { PENDING, PAID, CANCELLED }
}