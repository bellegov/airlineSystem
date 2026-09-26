package com.lowcost.airlinebackend.controller;

import com.lowcost.airlinebackend.dto.*;
import com.lowcost.airlinebackend.model.*;
import com.lowcost.airlinebackend.service.AirlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AirlineController {

    private final AirlineService airlineService;

    // ==========================================
    // --- АУТЕНТИФИКАЦИЯ И ПРОФИЛЬ ---
    // ==========================================

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody AuthDto req) {
        try {
            User user = airlineService.register(req.getUsername(), req.getPassword(), req.getFullName());
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody AuthDto req) {
        try {
            User user = airlineService.login(req.getUsername(), req.getPassword());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Неверный логин или пароль"));
        }
    }

    @PutMapping("/users/me/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody ProfileUpdateDto dto) {
        try {
            User updated = airlineService.updateMyProfile(userId, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Не удалось обновить профиль"));
        }
    }

    // ==========================================
    // --- ПОИСК И РЕЙСЫ ---
    // ==========================================

    @GetMapping("/flights/cities")
    public ResponseEntity<Map<String, Object>> getCities() {
        return ResponseEntity.ok(airlineService.getAvailableCities());
    }

    @PostMapping("/flights/search")
    public ResponseEntity<Map<String, List<FlightResponseDto>>> search(@RequestBody SearchRequestDto dto) {
        return ResponseEntity.ok(airlineService.searchFlights(dto));
    }

    @GetMapping("/flights/recommended")
    public ResponseEntity<List<FlightResponseDto>> getRecommended() {
        return ResponseEntity.ok(airlineService.getRecommendedFlights());
    }

    // ==========================================
    // --- ИЗБРАННОЕ ---
    // ==========================================

    @PostMapping("/users/{userId}/favorites/{flightId}")
    public ResponseEntity<Void> toggleFavorite(@PathVariable Long userId, @PathVariable Long flightId) {
        try {
            airlineService.toggleFavorite(userId, flightId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{userId}/favorites")
    public ResponseEntity<List<Flight>> getFavorites(@PathVariable Long userId) {
        return ResponseEntity.ok(airlineService.getFavorites(userId));
    }

    // ==========================================
    // --- БИЛЕТЫ И ОПЛАТА ---
    // ==========================================

    @GetMapping("/tickets/my/{userId}")
    public ResponseEntity<Map<String, List<Ticket>>> getMyTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(airlineService.getMyTicketsCategorized(userId));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<?> getTicket(@PathVariable Long id) {
        try {
            Ticket ticket = airlineService.getTicketById(id);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Билет не найден"));
        }
    }

    @PostMapping("/tickets/init")
    public ResponseEntity<?> initBooking(@RequestBody BookingRequestDto dto) {
        try {
            Ticket ticket = airlineService.initBooking(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/tickets/{id}/pay")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @RequestParam boolean success) {
        try {
            Ticket ticket = airlineService.processPayment(id, success);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка проведения платежа"));
        }
    }

    // ==========================================
    // --- АДМИНИСТРИРОВАНИЕ (CRUD) ---
    // ==========================================

    @GetMapping("/admin/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(airlineService.getAllUsers());
    }

    @PutMapping("/admin/users/{id}")
    public ResponseEntity<?> updateUserByAdmin(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = airlineService.updateUserByAdmin(id, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @RequestParam Long requesterId) {
        try {
            airlineService.deleteUser(requesterId, id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/flights")
    public ResponseEntity<Flight> createFlight(@RequestBody Flight f) {
        Flight created = airlineService.createFlight(f);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/admin/flights/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable Long id) {
        try {
            airlineService.deleteFlight(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}