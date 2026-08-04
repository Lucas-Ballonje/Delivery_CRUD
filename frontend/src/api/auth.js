import request from './client';

export function cadastrar({ nome, email, senha }) {
  return request('/auth/cadastro', { method: 'POST', body: { nome, email, senha } });
}

export function login({ email, senha }) {
  return request('/auth/login', { method: 'POST', body: { email, senha } });
}
