package com.lowcost.airlinebackend.repository;

import com.lowcost.airlinebackend.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    // Ищем рейсы, где departureTime находится между началом и концом суток
    @Query("SELECT f FROM Flight f WHERE f.origin = :origin AND f.destination = :destination " +
            "AND f.departureTime >= :startOfDay AND f.departureTime <= :endOfDay")
    List<Flight> searchByRouteAndDate(
            @Param("origin") String origin,
            @Param("destination") String destination,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("SELECT DISTINCT f.origin FROM Flight f")
    List<String> findDistinctOrigins();

    @Query("SELECT DISTINCT f.destination FROM Flight f")
    List<String> findDistinctDestinations();
}