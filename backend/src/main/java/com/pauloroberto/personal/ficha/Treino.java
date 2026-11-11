package com.pauloroberto.personal.ficha;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "treino")
public class Treino {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ficha_id", nullable = false)
    private Ficha ficha;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(nullable = false)
    private int ordem;

    @Column(length = 1000)
    private String observacao;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "treino_dia_semana", joinColumns = @JoinColumn(name = "treino_id"))
    @Column(name = "dia_semana", nullable = false)
    private Set<Integer> diasSemana = new LinkedHashSet<>();

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "treino", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<Exercicio> exercicios = new ArrayList<>();

    public void adicionarExercicio(Exercicio exercicio) {
        exercicios.add(exercicio);
        exercicio.setTreino(this);
    }
}
