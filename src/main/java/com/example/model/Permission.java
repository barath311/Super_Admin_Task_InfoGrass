package com.example.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String role;
    @Column(name="can_update")
    private boolean canUpdate;
    @Column(name="can_delete")
    private boolean canDelete;
    @Column(name="can_view")
    private boolean canView;
}
