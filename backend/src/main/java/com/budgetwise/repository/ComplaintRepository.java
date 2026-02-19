package com.budgetwise.repository;

import com.budgetwise.model.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    List<Complaint> findByUserId(String userId);
}
