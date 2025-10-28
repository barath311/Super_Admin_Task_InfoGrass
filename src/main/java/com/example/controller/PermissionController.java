package com.example.controller;

import com.example.model.Permission;
import com.example.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    // ✅ 1. Get all permissions (CEO only)
    @PreAuthorize("hasRole('CEO')")
    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    // ✅ 2. Get permission by role (CEO only)
    @PreAuthorize("hasRole('CEO')")
    @GetMapping("/{role}")
    public ResponseEntity<Permission> getPermissionByRole(@PathVariable("role") String role) {
        return ResponseEntity.ok(permissionService.getPermissionByRole(role));
    }

    /*
    // ✅ 3. Create or update permission (CEO only)
    @PreAuthorize("hasRole('CEO')")
    @PostMapping
    public ResponseEntity<Permission> updatePermission(@RequestBody Permission permissionRequest) {
        Permission updated = permissionService.updatePermission(
                permissionRequest.getRole(),
                permissionRequest.isCanView(),
                permissionRequest.isCanUpdate(),
                permissionRequest.isCanDelete()
        );
        return ResponseEntity.ok(updated);
    }


     */
    // ✅ 4. Check if a role can perform a specific action
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkPermission(
            @RequestParam("role") String role,
            @RequestParam("action") String action) {

        boolean result = switch (action.toLowerCase()) {
            case "view" -> permissionService.canView(role);
            case "update" -> permissionService.canUpdate(role);
            case "delete" -> permissionService.canDelete(role);
            default -> throw new IllegalArgumentException("Invalid action: " + action);
        };

        return ResponseEntity.ok(result);
    }

    // ✅ 5. Delete a permission (CEO only)
    @PreAuthorize("hasRole('CEO')")
    @DeleteMapping("/{role}")
    public ResponseEntity<String> deletePermission(@PathVariable("role") String role) {
        permissionService.deletePermission(role);
        return ResponseEntity.ok("Permission for role '" + role + "' has been deleted successfully.");
    }


    @PreAuthorize("hasRole('CEO')")
    @PostMapping
    public ResponseEntity<Permission> createPermission(@RequestBody Permission permission) {
        Permission createdPermission = permissionService.createPermission(permission);
        return ResponseEntity.ok(createdPermission);
    }

    // ✅ Update existing permission (CEO only)
    @PreAuthorize("hasRole('CEO')")
    @PutMapping("/{role}")
    public ResponseEntity<Permission> updatePermission(
            @PathVariable("role") String role,
            @RequestBody Permission updatedPermission
    ) {
        Permission permission = permissionService.updatePermission(role, updatedPermission);
        return ResponseEntity.ok(permission);
    }
}