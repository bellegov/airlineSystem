package com.lowcost.airlinebackend.service;

import com.lowcost.airlinebackend.dto.*;
import com.lowcost.airlinebackend.model.*;
import com.lowcost.airlinebackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AirlineService {

    private final UserRepository userRepo;
    private final FlightRepository flightRepo;
    private final TicketRepository ticketRepo;

    // Цены на допы
    private final double LUGGAGE_PRICE = 50.0;
    private final double PRIORITY_PRICE = 15.0;
    private final double MEAL_PRICE = 20.0;

    // --- AUTH & PROFILE ---
    public User register(String username, String password, String fullName) {
        if (userRepo.findByUsername(username).isPresent()) throw new RuntimeException("Логин занят");
        User u = new User();
        u.setUsername(username); u.setPassword(password); u.setFullName(fullName);
        u.setRole(Role.CLIENT);
        return userRepo.save(u);
    }

    public User login(String username, String password) {
        return userRepo.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Ошибка входа"));
    }

    @Transactional
    public User updateMyProfile(Long userId, ProfileUpdateDto dto) {
        User user = userRepo.findById(userId).orElseThrow();
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) user.setPassword(dto.getPassword());
        return userRepo.save(user);
    }

    // --- ПОИСК И РЕКОМЕНДАЦИИ ---
    public Map<String, Object> getAvailableCities() {
        Map<String, Object> res = new HashMap<>();
        res.put("origins", flightRepo.findDistinctOrigins());
        res.put("destinations", flightRepo.findDistinctDestinations());
        return res;
    }

    public Map<String, List<FlightResponseDto>> searchFlights(SearchRequestDto dto) {
        Map<String, List<FlightResponseDto>> result = new HashMap<>();

        // Формируем начало и конец суток для даты ТУДА
        LocalDateTime startOutbound = dto.getOutboundDate().atStartOfDay();
        LocalDateTime endOutbound = dto.getOutboundDate().atTime(23, 59, 59);

        List<FlightResponseDto> outbound = flightRepo.searchByRouteAndDate(
                        dto.getOrigin(), dto.getDestination(), startOutbound, endOutbound)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        result.put("outbound", outbound);

        // Если есть дата ОБРАТНО, ищем рейсы
        if (dto.getReturnDate() != null) {
            LocalDateTime startReturn = dto.getReturnDate().atStartOfDay();
            LocalDateTime endReturn = dto.getReturnDate().atTime(23, 59, 59);

            List<FlightResponseDto> returnFlights = flightRepo.searchByRouteAndDate(
                            dto.getDestination(), dto.getOrigin(), startReturn, endReturn)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
            result.put("return", returnFlights);
        }

        return result;
    }

    public List<FlightResponseDto> getRecommendedFlights() {
        List<Flight> all = flightRepo.findAll();
        Collections.shuffle(all);
        return all.stream().limit(3).map(this::mapToResponse).collect(Collectors.toList());
    }

    private FlightResponseDto mapToResponse(Flight f) {
        double multiplier = calcMultiplier(f);
        FlightResponseDto dto = new FlightResponseDto();
        dto.setFlight(f);
        // Считаем динамические цены на лету — в БД ничего не меняем
        dto.setPriceEconomy(Math.round(f.getBasePriceEconomy() * multiplier * 100.0) / 100.0);
        dto.setPriceStandard(Math.round(f.getBasePriceStandard() * multiplier * 100.0) / 100.0);
        dto.setPriceBusiness(Math.round(f.getBasePriceBusiness() * multiplier * 100.0) / 100.0);
        long sold = ticketRepo.countByOutboundFlightId(f.getId());
        dto.setAvailableSeats(f.getTotalSeats() - (int) sold);
        return dto;
    }
    private double calcMultiplier(Flight flight) {
        long sold = ticketRepo.countByOutboundFlightId(flight.getId());
        double occupancy = (double) sold / flight.getTotalSeats();
        double multiplier = 1.0;
        if (occupancy >= 0.8) multiplier *= 1.5;
        long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), flight.getDepartureTime());
        if (hours < 48) multiplier *= 1.8;
        return multiplier;
    }

    // --- ИЗБРАННОЕ ---
    @Transactional
    public void toggleFavorite(Long userId, Long flightId) {
        User user = userRepo.findById(userId).orElseThrow();
        Flight flight = flightRepo.findById(flightId).orElseThrow();
        if (user.getFavoriteFlights().contains(flight)) user.getFavoriteFlights().remove(flight);
        else user.getFavoriteFlights().add(flight);
        userRepo.save(user);
    }

    public List<Flight> getFavorites(Long userId) {
        return userRepo.findById(userId).orElseThrow().getFavoriteFlights();
    }

    // --- БИЛЕТЫ (АКТИВНЫЕ И АРХИВ) ---
    public Map<String, List<Ticket>> getMyTicketsCategorized(Long userId) {
        List<Ticket> all = ticketRepo.findByUserId(userId)
                .stream()
                .filter(t -> t.getStatus() == Ticket.TicketStatus.PAID)
                .collect(Collectors.toList());
        Map<String, List<Ticket>> res = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        res.put("active", all.stream().filter(t -> t.getOutboundFlight().getDepartureTime().isAfter(now)).collect(Collectors.toList()));
        res.put("archive", all.stream().filter(t -> t.getOutboundFlight().getDepartureTime().isBefore(now)).collect(Collectors.toList()));
        return res;
    }

    public Ticket getTicketById(Long id) { return ticketRepo.findById(id).orElseThrow(); }

    @Transactional
    public Ticket initBooking(BookingRequestDto dto) {
        User user = userRepo.findById(dto.getUserId()).orElseThrow();
        Flight outbound = flightRepo.findById(dto.getOutboundFlightId()).orElseThrow();


        long soldOut = ticketRepo.countByOutboundFlightId(outbound.getId());
        if (outbound.getTotalSeats() - soldOut < dto.getPassengers()) {
            throw new RuntimeException("Недостаточно свободных мест");
        }

        double multiplier = calcMultiplier(outbound);


        double basePrice = "BUSINESS".equals(dto.getSeatClass()) ? outbound.getBasePriceBusiness() :
                "STANDARD".equals(dto.getSeatClass()) ? outbound.getBasePriceStandard() : outbound.getBasePriceEconomy();

        double dynamicPrice = Math.round(basePrice * multiplier * 100.0) / 100.0;

        double extra = (Boolean.TRUE.equals(dto.getHasLuggage()) ? LUGGAGE_PRICE : 0)
                + (Boolean.TRUE.equals(dto.getHasPriority()) ? PRIORITY_PRICE : 0)
                + (Boolean.TRUE.equals(dto.getHasMeal()) ? MEAL_PRICE : 0);

        Ticket t = new Ticket();
        t.setUser(user);
        t.setOutboundFlight(outbound);
        t.setSeatClass(dto.getSeatClass());
        t.setPassengersCount(dto.getPassengers());
        t.setHasLuggage(dto.getHasLuggage());
        t.setHasPriority(dto.getHasPriority());
        t.setHasMeal(dto.getHasMeal());
        t.setPurchaseDate(LocalDateTime.now());
        t.setStatus(Ticket.TicketStatus.PENDING);

        double totalPrice = (dynamicPrice + extra) * dto.getPassengers();

        // ✅ Обратный рейс — если указан
        if (dto.getReturnFlightId() != null) {
            Flight returnFlight = flightRepo.findById(dto.getReturnFlightId()).orElseThrow();
            double retMultiplier = calcMultiplier(returnFlight);
            double retBasePrice = "BUSINESS".equals(dto.getSeatClass()) ? returnFlight.getBasePriceBusiness() :
                    "STANDARD".equals(dto.getSeatClass()) ? returnFlight.getBasePriceStandard() : returnFlight.getBasePriceEconomy();
            double retDynamic = Math.round(retBasePrice * retMultiplier * 100.0) / 100.0;
            totalPrice += (retDynamic + extra) * dto.getPassengers();
            t.setReturnFlight(returnFlight);
        }

        t.setFinalPrice(totalPrice);
        return ticketRepo.save(t);
    }

    @Transactional
    public Ticket processPayment(Long id, boolean success) {
        Ticket t = ticketRepo.findById(id).orElseThrow();
        t.setStatus(success ? Ticket.TicketStatus.PAID : Ticket.TicketStatus.CANCELLED);
        return ticketRepo.save(t);
    }

    // --- ADMIN ---
    public List<User> getAllUsers() { return userRepo.findAll(); }
    @Transactional
    public User updateUserByAdmin(Long id, User data) {
        User u = userRepo.findById(id).orElseThrow();
        u.setFullName(data.getFullName()); u.setRole(data.getRole());
        return userRepo.save(u);
    }
    public void deleteUser(Long requesterId, Long targetId) {
        User requester = userRepo.findById(requesterId).orElseThrow();
        if (requester.getRole() != Role.ADMIN) {
            throw new RuntimeException("Доступ запрещён");
        }
        userRepo.deleteById(targetId);
    }
    public Flight createFlight(Flight f) { return flightRepo.save(f); }
    public void deleteFlight(Long id) { flightRepo.deleteById(id); }
}