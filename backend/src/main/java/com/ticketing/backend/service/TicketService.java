package com.ticketing.backend.service;

import com.ticketing.backend.model.*;
import com.ticketing.backend.repository.CommentRepository;
import com.ticketing.backend.repository.TicketRepository;
import com.ticketing.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByUser(User user) {
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPPORT) {
            return ticketRepository.findAll();
        } else {
            return ticketRepository.findByCreatedBy(user);
        }
    }

    @Transactional
    public Ticket createTicket(Ticket ticket, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        ticket.setCreatedBy(user);
        ticket.setStatus(TicketStatus.OPEN);
        return ticketRepository.save(ticket);
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    @Transactional
    public Ticket updateTicket(Long id, Ticket updatedTicket, User modifier) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Basic authorization or business logic
        if (updatedTicket.getStatus() != null) {
            ticket.setStatus(updatedTicket.getStatus());
        }
        if (updatedTicket.getAssignedTo() != null) {
            ticket.setAssignedTo(updatedTicket.getAssignedTo());
        }

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Comment addComment(Long ticketId, String content, String username) {
        Ticket ticket = getTicketById(ticketId);
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    public List<Comment> getComments(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }
}
