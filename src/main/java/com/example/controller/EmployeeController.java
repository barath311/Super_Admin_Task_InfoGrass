package com.example.controller;
import com.example.model.Employee;
import com.example.service.EmployeeService;
import com.example.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final PermissionService permissionService;

    public EmployeeController(EmployeeService employeeService, PermissionService permissionService) {
        this.employeeService = employeeService;
        this.permissionService = permissionService;
    }

    // GET all employees → check view permission
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees(Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        if (!role.equals("CEO") && !permissionService.canView(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // GET employee by ID → check view permission
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable("id") Long id, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        if (!role.equals("CEO") && !permissionService.canView(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    // UPDATE employee → check update permission
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable("id") Long id,
                                                   @RequestBody Employee emp,
                                                   Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        if (!role.equals("CEO") && !permissionService.canUpdate(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(employeeService.updateEmployee(id, emp));
    }

    // DELETE employee → check delete permission
    /*@DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable Long id, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        if (!role.equals("CEO") && !permissionService.canDelete(role)) {
            return ResponseEntity.status(403).body("Not allowed to delete");
        }
        return ResponseEntity.ok(employeeService.deleteEmployee(id));
    }
*/

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable("id") Long id, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        if (!role.equals("CEO") && !permissionService.canDelete(role)) {
            return ResponseEntity.status(403).build();
        }

        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.noContent().build(); // 204
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).build(); // not found
        }
    }


    // CREATE employee → check create permission if needed
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee emp, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        // Example: Only CEO can create employees by default
        if (!role.equals("CEO") && !permissionService.canDelete(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(employeeService.createEmployee(emp));
    }
}
