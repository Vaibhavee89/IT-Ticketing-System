package com.ticketing.backend.controller;

import com.ticketing.backend.model.Comment;
import com.ticketing.backend.model.Ticket;
import com.ticketing.backend.model.User;
import com.ticketing.backend.repository.UserRepository;
import com.ticketing.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Ticket> getTickets() {
        User user = getAuthenticatedUser();
        return ticketService.getTicketsByUser(user);
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(ticketService.createTicket(ticket, user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @RequestBody Ticket ticket) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket, user));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser();
        String content = payload.get("content");
        return ResponseEntity.ok(ticketService.addComment(id, content, user.getUsername()));
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return ticketService.getComments(id);
    }
}
