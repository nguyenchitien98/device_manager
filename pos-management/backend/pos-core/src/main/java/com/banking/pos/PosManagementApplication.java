package com.banking.pos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point chính của POS Management System.
 *
 * <p>Tại sao dùng @EnableScheduling? Cần cho OutboxPollingService (@Scheduled mỗi 2s)
 * để poll outbox events và publish lên Kafka mà không block transaction chính.
 *
 * @author POS Management Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class PosManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(PosManagementApplication.class, args);
    }
}
