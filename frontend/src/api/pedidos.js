import request from './client';

export function listarPedidos(token) {
  return request('/pedidos', { token });
}

export function buscarPedido(id, token) {
  return request(`/pedidos/${id}`, { token });
}

export function criarPedido({ cliente, itens, enderecoEntrega }, token) {
  return request('/pedidos', { method: 'POST', body: { cliente, itens, enderecoEntrega }, token });
}

export function atualizarStatusPedido(id, status, token) {
  return request(`/pedidos/${id}/status`, { method: 'PUT', body: { status }, token });
}

export function excluirPedido(id, token) {
  return request(`/pedidos/${id}`, { method: 'DELETE', token });
}
