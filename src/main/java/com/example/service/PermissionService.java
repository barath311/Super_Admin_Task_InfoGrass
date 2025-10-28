package com.example.service;

import com.example.model.Permission;
import com.example.repository.PermissionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public boolean canView(String role) {
        return permissionRepository.findByRole(role)
                .map(Permission::isCanView)
                .orElse(false);
    }

    public boolean canUpdate(String role) {
        return permissionRepository.findByRole(role)
                .map(Permission::isCanUpdate)
                .orElse(false);
    }

    public boolean canDelete(String role) {
        return permissionRepository.findByRole(role)
                .map(Permission::isCanDelete)
                .orElse(false);
    }


    /*
    public Permission updatePermission(String role, boolean canView, boolean canUpdate, boolean canDelete) {
        if (role == null || role.isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }

        System.out.println("🔹 Updating Permission for role: " + role);
        System.out.println("   View=" + canView + ", Update=" + canUpdate + ", Delete=" + canDelete);

        Permission permission = permissionRepository.findByRole(role)
                .orElse(new Permission(null, role, canView, canUpdate, canDelete));

        permission.setCanView(canView);
        permission.setCanUpdate(canUpdate);
        permission.setCanDelete(canDelete);

        return permissionRepository.saveAndFlush(permission);
    }


     */
    public void deletePermission(String role) {
        permissionRepository.findByRole(role)
                .ifPresent(permissionRepository::delete);
    }

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Permission getPermissionByRole(String role) {
        return permissionRepository.findByRole(role)
                .orElseThrow(() -> new RuntimeException("Permission not found for role: " + role));
    }

public Permission createPermission(Permission permission) {
    if (permissionRepository.findByRole(permission.getRole()).isPresent()) {
        throw new RuntimeException("Permission already exists for role: " + permission.getRole());
    }
    return permissionRepository.save(permission);
}

// ✅ Update existing permission
public Permission updatePermission(String role, Permission updatedPermission) {
    Permission existing = permissionRepository.findByRole(role)
            .orElseThrow(() -> new RuntimeException("Permission not found for role: " + role));

    existing.setCanView(updatedPermission.isCanView());
    existing.setCanUpdate(updatedPermission.isCanUpdate());
    existing.setCanDelete(updatedPermission.isCanDelete());

    return permissionRepository.save(existing);
}
}
