package com.lowcost.airlinebackend.service;

import com.lowcost.airlinebackend.model.Flight;
import com.lowcost.airlinebackend.model.Role;
import com.lowcost.airlinebackend.model.User;
import com.lowcost.airlinebackend.repository.FlightRepository;
import com.lowcost.airlinebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FlightRepository flightRepository;

    @Override
    public void run(String... args) {
        createUsers();
        createFlights();
    }

    // ==========================================
    // --- ПОЛЬЗОВАТЕЛИ ---
    // ==========================================
    private void createUsers() {
        // Если пользователи уже есть — не трогаем
        if (userRepository.count() > 0) {
            System.out.println(">>> Пользователи уже существуют, пропускаем.");
            return;
        }

        // Администратор
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword("admin123");
        admin.setFullName("Главный Администратор");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // Тестовый клиент 1
        User client1 = new User();
        client1.setUsername("ivan");
        client1.setPassword("ivan123");
        client1.setFullName("Иван Петров");
        client1.setRole(Role.CLIENT);
        userRepository.save(client1);

        // Тестовый клиент 2
        User client2 = new User();
        client2.setUsername("maria");
        client2.setPassword("maria123");
        client2.setFullName("Мария Сидорова");
        client2.setRole(Role.CLIENT);
        userRepository.save(client2);

        System.out.println(">>> Созданы пользователи: admin / ivan / maria");
    }

    // ==========================================
    // --- РЕЙСЫ ---
    // ==========================================
    private void createFlights() {
        if (flightRepository.count() > 0) {
            System.out.println(">>> Рейсы уже существуют, пропускаем.");
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        List<Flight> flights = List.of(

                // --- Москва → Берлин ---
                makeFlight("LC-1001", "Москва", "Берлин",
                        now.plusDays(3).withHour(6).withMinute(0),
                        now.plusDays(3).withHour(8).withMinute(30),
                        "2ч 30м", "Boeing 737", 120,
                        89.99, 139.99, 299.99),

                makeFlight("LC-1002", "Москва", "Берлин",
                        now.plusDays(5).withHour(14).withMinute(15),
                        now.plusDays(5).withHour(16).withMinute(45),
                        "2ч 30м", "Airbus A320", 150,
                        79.99, 119.99, 259.99),

                makeFlight("LC-1003", "Москва", "Берлин",
                        now.plusDays(10).withHour(20).withMinute(0),
                        now.plusDays(10).withHour(22).withMinute(30),
                        "2ч 30м", "Boeing 737", 120,
                        69.99, 109.99, 239.99),

                // --- Берлин → Москва (обратные) ---
                makeFlight("LC-2001", "Берлин", "Москва",
                        now.plusDays(7).withHour(9).withMinute(0),
                        now.plusDays(7).withHour(11).withMinute(30),
                        "2ч 30м", "Boeing 737", 120,
                        89.99, 139.99, 299.99),

                makeFlight("LC-2002", "Берлин", "Москва",
                        now.plusDays(12).withHour(17).withMinute(30),
                        now.plusDays(12).withHour(20).withMinute(0),
                        "2ч 30м", "Airbus A321", 180,
                        74.99, 114.99, 249.99),

                // --- Москва → Париж ---
                makeFlight("LC-3001", "Москва", "Париж",
                        now.plusDays(4).withHour(7).withMinute(45),
                        now.plusDays(4).withHour(10).withMinute(15),
                        "3ч 30м", "Airbus A320", 150,
                        109.99, 169.99, 349.99),

                makeFlight("LC-3002", "Москва", "Париж",
                        now.plusDays(8).withHour(22).withMinute(0),
                        now.plusDays(9).withHour(1).withMinute(30),
                        "3ч 30м", "Boeing 777", 250,
                        99.99, 159.99, 329.99),

                // --- Париж → Москва ---
                makeFlight("LC-4001", "Париж", "Москва",
                        now.plusDays(9).withHour(12).withMinute(0),
                        now.plusDays(9).withHour(15).withMinute(30),
                        "3ч 30м", "Airbus A320", 150,
                        104.99, 164.99, 339.99),

                // --- Москва → Амстердам ---
                makeFlight("LC-5001", "Москва", "Амстердам",
                        now.plusDays(2).withHour(5).withMinute(30),
                        now.plusDays(2).withHour(8).withMinute(0),
                        "3ч 30м", "Boeing 737", 120,
                        119.99, 179.99, 369.99),

                makeFlight("LC-5002", "Москва", "Амстердам",
                        now.plusDays(6).withHour(16).withMinute(0),
                        now.plusDays(6).withHour(18).withMinute(30),
                        "3ч 30м", "Airbus A321", 180,
                        99.99, 154.99, 319.99),

                // --- Амстердам → Москва ---
                makeFlight("LC-6001", "Амстердам", "Москва",
                        now.plusDays(11).withHour(10).withMinute(0),
                        now.plusDays(11).withHour(15).withMinute(0),
                        "3ч 30м", "Boeing 737", 120,
                        114.99, 174.99, 359.99),

                // --- Москва → Рим ---
                makeFlight("LC-7001", "Москва", "Рим",
                        now.plusDays(3).withHour(11).withMinute(0),
                        now.plusDays(3).withHour(13).withMinute(30),
                        "3ч 00м", "Airbus A320", 150,
                        94.99, 144.99, 309.99),

                makeFlight("LC-7002", "Москва", "Рим",
                        now.plusDays(9).withHour(8).withMinute(0),
                        now.plusDays(9).withHour(10).withMinute(30),
                        "3ч 00м", "Boeing 737", 120,
                        89.99, 134.99, 289.99),

                // --- Рим → Москва ---
                makeFlight("LC-8001", "Рим", "Москва",
                        now.plusDays(14).withHour(15).withMinute(0),
                        now.plusDays(14).withHour(17).withMinute(30),
                        "3ч 00м", "Airbus A321", 180,
                        94.99, 149.99, 319.99),

                // --- Москва → Барселона ---
                makeFlight("LC-9001", "Москва", "Барселона",
                        now.plusDays(5).withHour(6).withMinute(0),
                        now.plusDays(5).withHour(9).withMinute(0),
                        "4ч 00м", "Boeing 777", 250,
                        129.99, 199.99, 399.99),

                makeFlight("LC-9002", "Москва", "Барселона",
                        now.plusDays(15).withHour(19).withMinute(0),
                        now.plusDays(15).withHour(22).withMinute(0),
                        "4ч 00м", "Airbus A320", 150,
                        119.99, 184.99, 379.99),

                // --- Барселона → Москва ---
                makeFlight("LC-10001", "Барселона", "Москва",
                        now.plusDays(20).withHour(10).withMinute(0),
                        now.plusDays(20).withHour(14).withMinute(0),
                        "4ч 00м", "Boeing 777", 250,
                        124.99, 194.99, 389.99),

                // --- Ближайшие рейсы (< 48 часов — для теста динамических цен) ---
                makeFlight("LC-0001", "Москва", "Берлин",
                        now.plusHours(20).withMinute(0),
                        now.plusHours(22).withMinute(30),
                        "2ч 30м", "Boeing 737", 120,
                        89.99, 139.99, 299.99),

                makeFlight("LC-0002", "Москва", "Париж",
                        now.plusHours(36).withMinute(0),
                        now.plusHours(39).withMinute(30),
                        "3ч 30м", "Airbus A320", 150,
                        109.99, 169.99, 349.99)
        );

        flightRepository.saveAll(flights);
        System.out.println(">>> Создано рейсов: " + flights.size());
        System.out.println(">>> Два рейса (LC-0001, LC-0002) вылетают < 48 часов — цены будут повышены динамически.");
    }

    // ==========================================
    // --- ХЕЛПЕР для создания рейса ---
    // ==========================================
    private Flight makeFlight(
            String flightNumber,
            String origin, String destination,
            LocalDateTime departure, LocalDateTime arrival,
            String duration, String airplane, int seats,
            double priceEconomy, double priceStandard, double priceBusiness
    ) {
        Flight f = new Flight();
        f.setFlightNumber(flightNumber);
        f.setOrigin(origin);
        f.setDestination(destination);
        f.setDepartureTime(departure);
        f.setArrivalTime(arrival);
        f.setFlightDuration(duration);
        f.setAirplaneModel(airplane);
        f.setTotalSeats(seats);
        f.setBasePriceEconomy(priceEconomy);
        f.setBasePriceStandard(priceStandard);
        f.setBasePriceBusiness(priceBusiness);
        return f;
    }
}