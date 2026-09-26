package com.lowcost.airlinebackend.repository;
import com.lowcost.airlinebackend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    long countByOutboundFlightId(Long flightId);

    List<Ticket> findByUserId(Long userId);
}