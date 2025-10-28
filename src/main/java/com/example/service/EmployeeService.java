package com.example.service;

import com.example.model.Employee;
import com.example.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) {
        this.repo = repo;
    }

    public Employee createEmployee(Employee emp) {
        return repo.save(emp);
    }

    public List<Employee> getAllEmployees() {
        return repo.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee updateEmployee(Long id, Employee newEmp) {
        Employee existing = getEmployeeById(id);
        existing.setEmployeeName(newEmp.getEmployeeName());
        existing.setEmployeeSalary(newEmp.getEmployeeSalary());
        existing.setEmployeeLocation(newEmp.getEmployeeLocation());
        return repo.save(existing);
    }

/*
    public String deleteEmployee(Long id) {
        repo.deleteById(id);
        return "Employee deleted successfully!";
    }
*/

    public void deleteEmployee(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        repo.deleteById(id);
    }
}