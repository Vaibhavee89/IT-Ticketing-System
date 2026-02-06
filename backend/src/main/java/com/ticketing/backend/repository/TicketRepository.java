package com.ticketing.backend.repository;

import com.ticketing.backend.model.Ticket;
import com.ticketing.backend.model.TicketStatus;
import com.ticketing.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedBy(User user);

    List<Ticket> findByAssignedTo(User user);

    List<Ticket> findByStatus(TicketStatus status);
}
