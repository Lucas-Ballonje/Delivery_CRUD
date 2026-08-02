package com.entregas.pedido;

import com.entregas.model.Pedido;
import com.entregas.model.StatusPedido;
import com.entregas.pedido.dto.PedidoRequest;
import com.entregas.pedido.dto.StatusUpdateRequest;
import com.entregas.repository.PedidoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Todas as rotas aqui passam pelo AuthFilter: so respondem com um
 * "Authorization: Bearer <token>" valido, obtido em POST /auth/login.
 */
@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;

    public PedidoController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody PedidoRequest req) {
        if (isBlank(req.getCliente()) || isBlank(req.getEnderecoEntrega())
                || req.getItens() == null || req.getItens().isEmpty()) {
            return erro(HttpStatus.BAD_REQUEST, "cliente, itens e enderecoEntrega sao obrigatorios");
        }

        Pedido pedido = new Pedido(req.getCliente(), req.getItens(), req.getEnderecoEntrega());
        pedido = pedidoRepository.save(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping
    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        return pedidoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> erro(HttpStatus.NOT_FOUND, "pedido nao encontrado"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest req) {
        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) {
            return erro(HttpStatus.NOT_FOUND, "pedido nao encontrado");
        }

        StatusPedido novoStatus;
        try {
            novoStatus = StatusPedido.valueOf(req.getStatus());
        } catch (Exception e) {
            return erro(HttpStatus.BAD_REQUEST, "status invalido. valores aceitos: "
                    + List.of(StatusPedido.values()));
        }

        pedido.setStatus(novoStatus);
        pedidoRepository.save(pedido);
        return ResponseEntity.ok(pedido);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private ResponseEntity<?> erro(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }
}
